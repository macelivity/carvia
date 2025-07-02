from flask import Blueprint, request, jsonify
from app.models.reservierung_ops import ReservierungOps
from app.models.rechnung_ops import RechnungOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime

bp = Blueprint("reservierung", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_reservierungen():
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierungen = ReservierungOps.get_all()
    return jsonify(reservierungen)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_reservierung():
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()

    if not data["UserID"]:
        return jsonify({"error": "Sie sind nicht angemeldet"}), 401
    
    if data["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    try:
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
        rechnung = RechnungOps.create(
            reservierung_id=reservierung_id,
            user_id=data["UserID"],
            fahrzeug_id=data["FahrzeugID"],
            preis=data["Preis"],
            bezahlt=False,
            austellungsdatum=datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        )
        return jsonify({"msg": f"Reservierung with ID {reservierung_id} added", "id": reservierung_id}), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 400

@bp.route("/<int:reservierung_id>", methods=["GET"])
@jwt_required()
def get_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierung = ReservierungOps.get_by_id(reservierung_id)
    
    if reservierung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    if not reservierung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(reservierung)

@bp.route("/<int:reservierung_id>", methods=["PUT"])
@jwt_required()
def update_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
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
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierung = ReservierungOps.get_by_id(reservierung_id)

    if not reservierung:
        return jsonify({"error": "Not found"}), 404
    
    if reservierung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    ReservierungOps.delete(reservierung_id)
    return jsonify({"msg": "Reservierung deleted"}), 204

@bp.route("/user/<int:user_id>", methods=["GET"])
@jwt_required()
def get_reservierungen_by_user(user_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if user_id != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierungen = ReservierungOps.get_by_user_id(user_id)
    return jsonify(reservierungen)

@bp.route("/fahrzeug/<int:fahrzeug_id>", methods=["GET"])
@jwt_required()
def get_reservierungen_by_fahrzeug(fahrzeug_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    reservierungen = ReservierungOps.get_by_fahrzeug_id(fahrzeug_id)
    return jsonify(reservierungen)

@bp.route("/<int:reservierung_id>/rechnung", methods=["GET"])
@jwt_required()
def get_rechnung_by_reservierung(reservierung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    rechnung = RechnungOps.get_by_reservierung_id(reservierung_id)

    if rechnung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not rechnung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(rechnung)
