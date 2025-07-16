from flask import Blueprint, request, jsonify
from app.models.rolle_ops import RolleOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity

"""
Rollen-Routes für das Carsharing-System.
Verwaltet Benutzerrollen und Berechtigungen im System.
"""

bp = Blueprint("rolle", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_rollen():
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter", "Admin", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    rollen = RolleOps.get_all()
    return jsonify(rollen)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_rolle():
    if not UserOps.is_authorized(get_jwt_identity(), ["Admin"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    rolle_id = RolleOps.create(data["Bedeutung"])
    return jsonify({"msg": f"Rolle with ID {rolle_id} added", "id": rolle_id}), 201

@bp.route("/<int:rolle_id>", methods=["GET"])
@jwt_required()
def get_rolle(rolle_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter", "Admin", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    rolle = RolleOps.get_by_id(rolle_id)
    if not rolle:
        return jsonify({"error": "Not found"}), 404
    return jsonify(rolle)

@bp.route("/<int:rolle_id>", methods=["PUT"])
@jwt_required()
def update_rolle(rolle_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Admin"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not RolleOps.get_by_id(rolle_id):
        return jsonify({"error": "Not found"}), 404
    RolleOps.update(rolle_id, data["Bedeutung"])
    return jsonify({"msg": "Rolle updated"})

@bp.route("/<int:rolle_id>", methods=["DELETE"])
@jwt_required()
def delete_rolle(rolle_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Admin"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    if not RolleOps.get_by_id(rolle_id):
        return jsonify({"error": "Not found"}), 404
    RolleOps.delete(rolle_id)
    return jsonify({"msg": "Rolle deleted"}), 204
