from flask import Blueprint, request, jsonify
from app.models.rolle_ops import RolleOps

bp = Blueprint("rolle", __name__)

@bp.route("/", methods=["GET"])
def list_rollen():
    rollen = RolleOps.get_all()
    return jsonify(rollen)

@bp.route("/", methods=["POST"])
def create_rolle():
    data = request.get_json()
    rolle_id = RolleOps.create(data["Bedeutung"])
    return jsonify({"msg": f"Rolle with ID {rolle_id} added", "id": rolle_id}), 201

@bp.route("/<int:rolle_id>", methods=["GET"])
def get_rolle(rolle_id):
    rolle = RolleOps.get_by_id(rolle_id)
    if not rolle:
        return jsonify({"error": "Not found"}), 404
    return jsonify(rolle)

@bp.route("/<int:rolle_id>", methods=["PUT"])
def update_rolle(rolle_id):
    data = request.get_json()
    if not RolleOps.get_by_id(rolle_id):
        return jsonify({"error": "Not found"}), 404
    RolleOps.update(rolle_id, data["Bedeutung"])
    return jsonify({"msg": "Rolle updated"})

@bp.route("/<int:rolle_id>", methods=["DELETE"])
def delete_rolle(rolle_id):
    if not RolleOps.get_by_id(rolle_id):
        return jsonify({"error": "Not found"}), 404
    RolleOps.delete(rolle_id)
    return jsonify({"msg": "Rolle deleted"}), 204
