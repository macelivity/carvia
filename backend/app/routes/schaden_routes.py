from flask import Blueprint, request, jsonify
from app.models.schaden_ops import SchadenOps

bp = Blueprint("schaden", __name__, url_prefix="/schaden")

@bp.route("/", methods=["GET"])
def list_schadens():
    schadens = SchadenOps.get_all()
    return jsonify(schadens)

@bp.route("/", methods=["POST"])
def create_schaden():
    data = request.get_json()
    schaden_id = SchadenOps.create(data["FahrzeugID"], data["Beschreibung"])
    return jsonify({"msg": f"Schaden with ID {schaden_id} added", "id": schaden_id}), 201

@bp.route("/<int:schaden_id>", methods=["GET"])
def get_schaden(schaden_id):
    schaden = SchadenOps.get_by_id(schaden_id)
    if not schaden:
        return jsonify({"error": "Not found"}), 404
    return jsonify(schaden)

@bp.route("/<int:schaden_id>", methods=["PUT"])
def update_schaden(schaden_id):
    data = request.get_json()
    if not SchadenOps.get_by_id(schaden_id):
        return jsonify({"error": "Not found"}), 404
    SchadenOps.update(schaden_id, data["FahrzeugID"], data["Beschreibung"])
    return jsonify({"msg": "Schaden updated"})

@bp.route("/<int:schaden_id>", methods=["DELETE"])
def delete_schaden(schaden_id):
    if not SchadenOps.get_by_id(schaden_id):
        return jsonify({"error": "Not found"}), 404
    SchadenOps.delete(schaden_id)
    return jsonify({"msg": "Schaden deleted"}), 204
