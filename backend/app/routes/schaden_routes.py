from flask import Blueprint, request, jsonify
from app.models.schaden_ops import SchadenOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity

bp = Blueprint("schaden", __name__, url_prefix="/schaden")

@bp.route("/", methods=["GET"])
@jwt_required()
def list_schadens():
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    schadens = SchadenOps.get_all()
    return jsonify(schadens)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_schaden():
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    schaden_id = SchadenOps.create(data["FahrzeugID"], data["Beschreibung"])
    return jsonify({"msg": f"Schaden with ID {schaden_id} added", "id": schaden_id}), 201

@bp.route("/<int:schaden_id>", methods=["GET"])
@jwt_required()
def get_schaden(schaden_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    schaden = SchadenOps.get_by_id(schaden_id)
    if not schaden:
        return jsonify({"error": "Not found"}), 404
    return jsonify(schaden)

@bp.route("/<int:schaden_id>", methods=["PUT"])
@jwt_required()
def update_schaden(schaden_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not SchadenOps.get_by_id(schaden_id):
        return jsonify({"error": "Not found"}), 404
    SchadenOps.update(schaden_id, data["FahrzeugID"], data["Beschreibung"])
    return jsonify({"msg": "Schaden updated"})

@bp.route("/<int:schaden_id>", methods=["DELETE"])
@jwt_required()
def delete_schaden(schaden_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not SchadenOps.get_by_id(schaden_id):
        return jsonify({"error": "Not found"}), 404
    SchadenOps.delete(schaden_id)
    return jsonify({"msg": "Schaden deleted"}), 204
