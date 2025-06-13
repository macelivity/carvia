from flask import Blueprint, request, jsonify
from app.models.reservierung_ops import ReservierungOps
<<<<<<< HEAD
from datetime import datetime

bp = Blueprint("reservations", __name__, url_prefix="/reservations")

@bp.route("/", methods=["POST"])
def create_reservation():
    """Erstellt eine neue Reservierung."""
    data = request.get_json()

    # Grundlegende Prüfung auf erforderliche Felder
    required_fields = ["UserID", "FahrzeugID", "Reservierungsbeginn", "Reservierungsende", "RechnungID", "TarifID"]
    for field in required_fields:
        if field not in data:
            return jsonify({"msg": f"Missing required field: {field}"}), 400

    user_id = data["UserID"]
    fahrzeug_id = data["FahrzeugID"]
    rechnung_id = data["RechnungID"]
    tarif_id = data["TarifID"]

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
        start_datum=reservierungsbeginn,
        end_datum=reservierungsende,
        rechnung_id=rechnung_id,
        tarif_id=tarif_id
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
    if "RechnungID" in data: update_data["rechnung_id"] = data["RechnungID"]
    if "TarifID" in data: update_data["tarif_id"] = data["TarifID"]

    if not update_data:
        return jsonify({"msg": "No fields to update provided"}), 400

    update_successful = ReservierungOps.update(
        reservierungs_id,
        user_id=update_data.get("user_id"),
        fahrzeug_id=update_data.get("fahrzeug_id"),
        start_datum=update_data.get("reservierungsbeginn"),
        end_datum=update_data.get("reservierungsende"),
        rechnung_id=update_data.get("rechnung_id"),
        tarif_id=update_data.get("tarif_id")
    )
    if update_successful:
        return jsonify({"msg": "Reservation updated successfully"}), 200
    return jsonify({"msg": "Failed to update reservation"}), 400

@bp.route("/<int:reservierungs_id>", methods=["DELETE"])
def delete_reservation(reservierungs_id):
    """Löscht eine Reservierung."""
    if not ReservierungOps.get_by_id(reservierungs_id): # Prüfen, ob Reservierung existiert
        return jsonify({"msg": "Reservation not found"}), 404
    
    success = ReservierungOps.delete(reservierungs_id)
    if success:
        return jsonify({"msg": "Reservation deleted successfully"}), 200 # 204 No Content wäre auch möglich
=======

bp = Blueprint("reservierung", __name__)

@bp.route("/", methods=["GET"])
def list_reservierungen():
    reservierungen = ReservierungOps.get_all()
    return jsonify(reservierungen)

@bp.route("/", methods=["POST"])
def create_reservierung():
    data = request.get_json()
    reservierung_id = ReservierungOps.create(
        data["FahrzeugID"], 
        data["UserID"], 
        data["RechnungID"], 
        data["TarifID"], 
        data["StartDatum"], 
        data["EndDatum"]
    )
    return jsonify({"msg": f"Reservierung with ID {reservierung_id} added", "id": reservierung_id}), 201

@bp.route("/<int:reservierung_id>", methods=["GET"])
def get_reservierung(reservierung_id):
    reservierung = ReservierungOps.get_by_id(reservierung_id)
    if not reservierung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(reservierung)

@bp.route("/<int:reservierung_id>", methods=["PUT"])
def update_reservierung(reservierung_id):
    data = request.get_json()
    if not ReservierungOps.get_by_id(reservierung_id):
        return jsonify({"error": "Not found"}), 404
    ReservierungOps.update(
        reservierung_id, 
        data["FahrzeugID"], 
        data["UserID"], 
        data["RechnungID"], 
        data["TarifID"], 
        data["StartDatum"], 
        data["EndDatum"]
    )
    return jsonify({"msg": "Reservierung updated"})

@bp.route("/<int:reservierung_id>", methods=["DELETE"])
def delete_reservierung(reservierung_id):
    if not ReservierungOps.get_by_id(reservierung_id):
        return jsonify({"error": "Not found"}), 404
    ReservierungOps.delete(reservierung_id)
    return jsonify({"msg": "Reservierung deleted"}), 204

@bp.route("/user/<int:user_id>", methods=["GET"])
def get_reservierungen_by_user(user_id):
    reservierungen = ReservierungOps.get_by_user_id(user_id)
    return jsonify(reservierungen)

@bp.route("/fahrzeug/<int:fahrzeug_id>", methods=["GET"])
def get_reservierungen_by_fahrzeug(fahrzeug_id):
    reservierungen = ReservierungOps.get_by_fahrzeug_id(fahrzeug_id)
    return jsonify(reservierungen)
>>>>>>> develop
