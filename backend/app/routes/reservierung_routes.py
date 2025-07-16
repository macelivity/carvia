from flask import Blueprint, request, jsonify
from app.models.reservierung_ops import ReservierungOps
from app.models.rechnung_ops import RechnungOps
from app.models.user_ops import UserOps
from app.models.fahrzeug_ops import FahrzeugOps
from app.models.modell_ops import ModellOps
from app.models.tarif_ops import TarifOps
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

"""
Reservierungs-Routes für das Carsharing-System.
Verwaltet die Erstellung, Abfrage und Verwaltung von Fahrzeugreservierungen.
"""

bp = Blueprint("reservierung", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_reservierungen():
    """Gibt alle Reservierungen zurück (nur für Mitarbeiter)"""
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierungen = ReservierungOps.get_all()
    return jsonify(reservierungen)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_reservierung():

    # check that user only reserves for himself
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    
    if data["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    try:
        # Calculate price on backend to ensure consistency
        fahrzeug = FahrzeugOps.get_by_id(data["FahrzeugID"])
        if not fahrzeug:
            return jsonify({"error": "Vehicle not found"}), 404
            
        modell = ModellOps.get_by_id(fahrzeug["ModellID"])
        if not modell:
            return jsonify({"error": "Vehicle model not found"}), 404
        
        tarif = TarifOps.get_by_id(data["TarifID"])
        if not tarif:
            return jsonify({"error": "Tariff not found"}), 404
        
        # Parse dates and calculate price
        start_date = datetime.fromisoformat(data["StartDatum"].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(data["EndDatum"].replace('Z', '+00:00'))
        
        if start_date >= end_date:
            return jsonify({"error": "End date must be after start date"}), 400
        
        duration_hours = (end_date - start_date).total_seconds() / 3600
        calculated_price = duration_hours * float(modell["Stundenpreis"]) * float(tarif["Multiplikator"])
        
        reservierung_id = ReservierungOps.create(
            fahrzeug_id=data["FahrzeugID"],
            user_id=data["UserID"],
            tarif_id=data["TarifID"],
            start_datum=data["StartDatum"],
            end_datum=data["EndDatum"],
            abholort=data["Abholort"],
            abholplz=data["AbholPlz"],
            rueckgabeort=data["Rueckgabeort"],
            rueckgabeplz=data["RueckgabePlz"],
            rechnung_id=0
        )
        
        # Create Rechnung with backend-calculated price
        rechnung = RechnungOps.create(
            reservierung_id=reservierung_id,
            user_id=data["UserID"],
            fahrzeug_id=data["FahrzeugID"],
            preis=round(calculated_price, 2),
            bezahlt=False,
            austellungsdatum=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        
        return jsonify({
            "msg": f"Reservierung with ID {reservierung_id} added",
            "id": reservierung_id,
            "rechnung_id": rechnung,
            "calculated_price": round(calculated_price, 2)
        }), 201
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 400

@bp.route("/<int:reservierung_id>", methods=["GET"])
@jwt_required()
def get_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierung = ReservierungOps.get_by_id(reservierung_id)
    
    if reservierung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    if not reservierung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(reservierung)

@bp.route("/<int:reservierung_id>", methods=["PUT"])
@jwt_required()
def update_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not ReservierungOps.get_by_reservation_id(reservierung_id):
        return jsonify({"error": "Not found"}), 404
    ReservierungOps.update(
        reservierung_id, 
        data["FahrzeugID"], 
        data["UserID"], 
        data["RechnungID"], 
        data["TarifID"], 
        data["StartDatum"], 
        data["EndDatum"],
        data["Abholort"],
        data["AbholPlz"],
        data["Rueckgabeort"],
        data["RueckgabePlz"]
    )
    return jsonify({"msg": "Reservierung updated"})

@bp.route("/<int:reservierung_id>", methods=["DELETE"])
@jwt_required()
def delete_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierung = ReservierungOps.get_by_id(reservierung_id)

    if not reservierung:
        return jsonify({"error": "Not found"}), 404
    
    if reservierung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    ReservierungOps.delete(reservierung_id)
    return jsonify({"msg": "Reservierung deleted"}), 204

@bp.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_reservierungen_by_user(user_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if user_id != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierungen = ReservierungOps.get_by_user_id(user_id)
    return jsonify(reservierungen)

@bp.route("/fahrzeug/<int:fahrzeug_id>", methods=["GET"])
@jwt_required()
def get_reservierungen_by_fahrzeug(fahrzeug_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierungen = ReservierungOps.get_by_fahrzeug_id(fahrzeug_id)
    return jsonify(reservierungen)

@bp.route("/<int:reservierung_id>/rechnung", methods=["GET"])
@jwt_required()
def get_rechnung_by_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    rechnung = RechnungOps.get_by_reservierung_id(reservierung_id)

    if rechnung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not rechnung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(rechnung)

@bp.route("/calculate-price", methods=["POST"])
@jwt_required()
def calculate_reservation_price():
    """Calculate the price for a reservation based on vehicle, tariff, and duration"""
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    
    try:
        # Required fields
        fahrzeug_id = data.get("FahrzeugID")
        tarif_id = data.get("TarifID")
        start_datum = data.get("StartDatum")
        end_datum = data.get("EndDatum")
        
        if not all([fahrzeug_id, tarif_id, start_datum, end_datum]):
            return jsonify({"error": "Missing required fields: FahrzeugID, TarifID, StartDatum, EndDatum"}), 400
        
        # Get vehicle and model information
        fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
        if not fahrzeug:
            return jsonify({"error": "Vehicle not found"}), 404
            
        modell = ModellOps.get_by_id(fahrzeug["ModellID"])
        if not modell:
            return jsonify({"error": "Vehicle model not found"}), 404
        
        # Get tariff information
        tarif = TarifOps.get_by_id(tarif_id)
        if not tarif:
            return jsonify({"error": "Tariff not found"}), 404
        
        # Parse dates
        start_date = datetime.fromisoformat(start_datum.replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(end_datum.replace('Z', '+00:00'))
        
        if start_date >= end_date:
            return jsonify({"error": "End date must be after start date"}), 400
        
        # Calculate duration in hours
        duration_ms = (end_date - start_date).total_seconds() * 1000
        duration_hours = duration_ms / (1000 * 60 * 60)

        # Check if required fields exist
        if "Stundenpreis" not in modell:
            return jsonify({"error": f"Stundenpreis field not found in model. Available fields: {list(modell.keys())}"}), 500
        if "Multiplikator" not in tarif:
            return jsonify({"error": f"Multiplikator field not found in tariff. Available fields: {list(tarif.keys())}"}), 500
        
        hourly_rate = float(modell["Stundenpreis"])
        tariff_multiplier = float(tarif["Multiplikator"])
        total_price = duration_hours * hourly_rate * tariff_multiplier
        
        return jsonify({
            "price": round(total_price, 2),
            "duration_hours": round(duration_hours, 2),
            "hourly_rate": hourly_rate,
            "tariff_multiplier": tariff_multiplier,
            "vehicle_info": {
                "hersteller": modell.get("Hersteller", "Unknown"),
                "modell": modell.get("Name", "Unknown"),
                "kennzeichen": fahrzeug.get("Kennzeichen", "Unknown")
            },
            "tariff_info": {
                "name": tarif.get("Name", "Unknown"),
                "multiplikator": tariff_multiplier
            }
        }), 200
        
    except ValueError as e:
        return jsonify({"error": f"Invalid date format: {str(e)}"}), 400
    except Exception as e:
        return jsonify({"error": f"Price calculation failed: {str(e)}"}), 500

@bp.route("/reservation-data", methods=["POST"])
@jwt_required()
def get_reservation_data():
    """Get all data needed for creating a reservation (vehicle, model, tariffs)"""
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    fahrzeug_id = data.get("FahrzeugID")
    
    if not fahrzeug_id:
        return jsonify({"error": "Missing required field: FahrzeugID"}), 400
    
    try:
        # Get vehicle information
        fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
        if not fahrzeug:
            return jsonify({"error": "Vehicle not found"}), 404
            
        # Get model information
        modell = ModellOps.get_by_id(fahrzeug["ModellID"])
        if not modell:
            return jsonify({"error": "Vehicle model not found"}), 404
        
        # Get all available tariffs
        tarife = TarifOps.get_all()
        
        return jsonify({
            "vehicle": fahrzeug,
            "model": modell,
            "tariffs": tarife
        }), 200
        
    except Exception as e:
        return jsonify({"error": f"Failed to fetch reservation data: {str(e)}"}), 500
