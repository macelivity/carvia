from flask import Blueprint, request, jsonify
from app.models.reservierung_ops import ReservierungOps

bp = Blueprint("reservierung", __name__)

@bp.route("/", methods=["GET"])
def list_reservierungen():
    reservierungen = ReservierungOps.get_all()
    return jsonify(reservierungen)

@bp.route("/", methods=["POST"])
def create_reservierung():
    data = request.get_json()

    if not data["UserID"]:
        return jsonify({"error": "Sie sind nicht angemeldet"}), 401

    reservierung_id = ReservierungOps.create(
        data["FahrzeugID"], 
        data["UserID"], 
        data["RechnungID"], 
        data["TarifID"], 
        data["StartDatum"],
        data["EndDatum"],
        data["Abholort"],
        data["Rueckgabeort"]
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
        data["EndDatum"],
        data["Abholort"],
        data["Rueckgabeort"]
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
