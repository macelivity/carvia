from flask import Blueprint, request, jsonify
from app.models.rechnung_ops import RechnungOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("rechnung", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_rechnungen():
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    rechnungen = RechnungOps.get_all()
    return jsonify(rechnungen)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_rechnung():
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    data = request.get_json()
    rechnung_id = RechnungOps.create(data["FahrzeugID"], data["Bezahlt"], data["Austellungsdatum"])
    return jsonify({"msg": f"Rechnung with ID {rechnung_id} added", "id": rechnung_id}), 201

@bp.route("/<int:rechnung_id>", methods=["GET"])
@jwt_required()
def get_rechnung(rechnung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["User", "Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    rechnung = RechnungOps.get_by_id(rechnung_id)

    if rechnung["UserID"] != int(get_jwt_identity()) and not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not rechnung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(rechnung)

@bp.route("/<int:rechnung_id>", methods=["PUT"])
@jwt_required()
def update_rechnung(rechnung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not RechnungOps.get_by_id(rechnung_id):
        return jsonify({"error": "Not found"}), 404
    RechnungOps.update(rechnung_id, data["FahrzeugID"], data["Bezahlt"], data["Austellungsdatum"])
    return jsonify({"msg": "Rechnung updated"})

@bp.route("/<int:rechnung_id>", methods=["DELETE"])
@jwt_required()
def delete_rechnung(rechnung_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not RechnungOps.get_by_id(rechnung_id):
        return jsonify({"error": "Not found"}), 404
    RechnungOps.delete(rechnung_id)
    return jsonify({"msg": "Rechnung deleted"}), 204
