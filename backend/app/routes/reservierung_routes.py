from flask import Blueprint, request, jsonify
from app.models.reservierung_ops import ReservierungOps
from datetime import datetime

bp = Blueprint("reservations", __name__, url_prefix="/reservations")

@bp.route("/", methods=["POST"])
def create_reservation():
    """Erstellt eine neue Reservierung."""
    data = request.get_json()

    # Grundlegende Prüfung auf erforderliche Felder
    required_fields = ["UserID", "FahrzeugID", "Reservierungsbeginn", "Reservierungsende"]
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing required field: {field}"}), 400

    user_id = data["UserID"]
    fahrzeug_id = data["FahrzeugID"]
    
    try:
        reservierungsbeginn_str = data["Reservierungsbeginn"]
        reservierungsende_str = data["Reservierungsende"]
        reservierungsbeginn = datetime.fromisoformat(reservierungsbeginn_str)
        reservierungsende = datetime.fromisoformat(reservierungsende_str)
    except ValueError:
        return jsonify({"msg": "Invalid datetime format. Please use ISO 8601 format (YYYY-MM-DDTHH:MM:SS)."}), 400
    except TypeError:
         return jsonify({"msg": "Datetime fields must be strings in ISO 8601 format."}), 400


    # Vereinfachte Erstellung ohne komplexe Geschäftslogik-Checks
    reservierungs_id = ReservierungOps.create(
        user_id=user_id,
        fahrzeug_id=fahrzeug_id,
        reservierungsbeginn=reservierungsbeginn,
        reservierungsende=reservierungsende,
        status=data.get('Status', 'bestätigt'), # Optional Status aus Request oder Default
        gesamtkosten=data.get('Gesamtkosten') # Optional Gesamtkosten aus Request
    )
    if reservierungs_id:
        return jsonify({"msg": "Reservation created successfully", "ReservierungsID": reservierungs_id}), 201

@bp.route("/", methods=["GET"])
def list_reservations():
    """Gibt alle Reservierungen zurück."""
    reservations = ReservierungOps.get_all()
    return jsonify(reservations), 200

@bp.route("/<int:reservierungs_id>", methods=["GET"])
def get_reservation_by_id(reservierungs_id):
    """Gibt eine spezifische Reservierung zurück."""
    reservation = ReservierungOps.get_by_id(reservierungs_id)
    if not reservation:
        return jsonify({"msg": "Reservation not found"}), 404
    return jsonify(reservation), 200

@bp.route("/<int:reservierungs_id>", methods=["PUT"])
def update_reservation(reservierungs_id):
    """Aktualisiert eine bestehende Reservierung."""
    data = request.get_json()
    
    if not ReservierungOps.get_by_id(reservierungs_id): # Prüfen, ob Reservierung existiert
        return jsonify({"msg": "Reservation not found"}), 404

    update_data = {}
    if "UserID" in data: update_data["user_id"] = data["UserID"]
    if "FahrzeugID" in data: update_data["fahrzeug_id"] = data["FahrzeugID"]
    if "Reservierungsbeginn" in data:
        try:
            update_data["reservierungsbeginn"] = datetime.fromisoformat(data["Reservierungsbeginn"])
        except (ValueError, TypeError):
            return jsonify({"msg": "Invalid Reservierungsbeginn format."}), 400
    if "Reservierungsende" in data:
        try:
            update_data["reservierungsende"] = datetime.fromisoformat(data["Reservierungsende"])
        except (ValueError, TypeError):
            return jsonify({"msg": "Invalid Reservierungsende format."}), 400
    if "Status" in data: update_data["status"] = data["Status"]
    if "Gesamtkosten" in data: update_data["gesamtkosten"] = data["Gesamtkosten"]

    if not update_data:
        return jsonify({"msg": "No fields to update provided"}), 400

    updated_reservation = ReservierungOps.get_by_id(reservierungs_id)
    return jsonify({"msg": "Reservation updated successfully", "reservation": updated_reservation}), 200

@bp.route("/<int:reservierungs_id>", methods=["DELETE"])
def delete_reservation(reservierungs_id):
    """Löscht eine Reservierung."""
    if not ReservierungOps.get_by_id(reservierungs_id): # Prüfen, ob Reservierung existiert
        return jsonify({"msg": "Reservation not found"}), 404
    
    success = ReservierungOps.delete(reservierungs_id)
    if success:
        return jsonify({"msg": "Reservation deleted successfully"}), 200 # 204 No Content wäre auch möglich
