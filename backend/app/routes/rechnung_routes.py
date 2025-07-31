from flask import Blueprint, request, jsonify
from app.models.rechnung_ops import RechnungOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity

"""
Rechnungs-Routes für das Carsharing-System.
Verwaltet die Erstellung, Abfrage und Verwaltung von Abrechnungen für Reservierungen.
"""

bp = Blueprint("rechnung", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_rechnungen():
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    rechnungen = RechnungOps.get_all()
    return jsonify(rechnungen)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_rechnung():
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    data = request.get_json()
    rechnung_id = RechnungOps.create(data["ReservierungID"], data["UserID"], data["FahrzeugID"], data["Preis"], data["Bezahlt"], data["Ausstellungsdatum"])
    return jsonify({"msg": f"Rechnung with ID {rechnung_id} added", "id": rechnung_id}), 201

@bp.route("/<int:rechnung_id>", methods=["GET"])
@jwt_required()
def get_rechnung(rechnung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    rechnung = RechnungOps.get_by_id(rechnung_id)

    if not rechnung:
        if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
            return jsonify({"error": "Zugriff verweigert"}), 403
        else:
            return jsonify({"error": "Not found"}), 404

    if rechnung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    return jsonify(rechnung)

@bp.route("/<int:rechnung_id>", methods=["PUT"])
@jwt_required()
def update_rechnung(rechnung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not RechnungOps.get_by_id(rechnung_id):
        return jsonify({"error": "Not found"}), 404
    RechnungOps.update(rechnung_id, data["FahrzeugID"], data["Bezahlt"], data["Ausstellungsdatum"])
    return jsonify({"msg": "Rechnung updated"})

@bp.route("/<int:rechnung_id>", methods=["DELETE"])
@jwt_required()
def delete_rechnung(rechnung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not RechnungOps.get_by_id(rechnung_id):
        return jsonify({"error": "Not found"}), 404
    RechnungOps.delete(rechnung_id)
    return jsonify({"msg": "Rechnung deleted"}), 204

@bp.route("/from-reservation", methods=["POST"])
@jwt_required()
def create_rechnung_from_reservation():
    """Create a Rechnung from an existing reservation"""
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    data = request.get_json()
    
    # Required fields
    reservierung_id = data.get("ReservierungID")
    if not reservierung_id:
        return jsonify({"error": "Missing required field: ReservierungID"}), 400
    
    try:
        # Get reservation details
        from app.models.reservierung_ops import ReservierungOps
        from app.models.fahrzeug_ops import FahrzeugOps
        from app.models.modell_ops import ModellOps
        from app.models.tarif_ops import TarifOps
        from datetime import datetime
        
        reservierung = ReservierungOps.get_by_id(reservierung_id)
        if not reservierung:
            return jsonify({"error": "Reservation not found"}), 404
        
        # Calculate price based on reservation data
        fahrzeug = FahrzeugOps.get_by_id(reservierung["FahrzeugID"])
        if not fahrzeug:
            return jsonify({"error": "Vehicle not found"}), 404
            
        modell = ModellOps.get_by_id(fahrzeug["ModellID"])
        if not modell:
            return jsonify({"error": "Vehicle model not found"}), 404
        
        tarif = TarifOps.get_by_id(reservierung["TarifID"])
        if not tarif:
            return jsonify({"error": "Tariff not found"}), 404
        
        # Parse dates and calculate price
        start_date = datetime.fromisoformat(reservierung["StartDatum"].replace('Z', '+00:00'))
        end_date = datetime.fromisoformat(reservierung["EndDatum"].replace('Z', '+00:00'))
        
        duration_hours = (end_date - start_date).total_seconds() / 3600
        calculated_price = duration_hours * float(modell["Stundenpreis"]) * float(tarif["Multiplikator"])
        
        # Create Rechnung
        rechnung_id = RechnungOps.create(
            reservierung_id=reservierung_id,
            user_id=reservierung["UserID"],
            fahrzeug_id=reservierung["FahrzeugID"],
            preis=round(calculated_price, 2),
            bezahlt=data.get("Bezahlt", False),
            austellungsdatum=data.get("Austellungsdatum", datetime.now().strftime("%Y-%m-%d %H:%M:%S"))
        )
        
        return jsonify({
            "msg": f"Rechnung with ID {rechnung_id} created from reservation",
            "id": rechnung_id,
            "calculated_price": round(calculated_price, 2)
        }), 201
        
    except Exception as e:
        return jsonify({"error": f"Failed to create Rechnung: {str(e)}"}), 500
