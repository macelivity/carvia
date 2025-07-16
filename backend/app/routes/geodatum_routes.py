from flask import Blueprint, request, jsonify
from app.models.geodatum_ops import GeodatumOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity  # Import für Autorisierung

"""
Geodaten-Routes für das Carsharing-System.
Verwaltet GPS-Standortdaten der Fahrzeuge für Tracking und Navigation.
"""

bp = Blueprint("geodatum", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def list_geodatums():
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    geodatums = GeodatumOps.get_all()
    return jsonify(geodatums)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_geodatum():
    if not UserOps.is_authorized(get_jwt_identity(), ["Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    geodatum_id = GeodatumOps.create(data["FahrzeugID"], data["Longitude"], data["Latitude"], data["Zeit"])
    return jsonify({"msg": f"GeoDatum with ID {geodatum_id} added", "id": geodatum_id}), 201

@bp.route("/<int:geodatum_id>", methods=["GET"])
@jwt_required()
def get_geodatum(geodatum_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    geodatum = GeodatumOps.get_by_id(geodatum_id)
    if not geodatum:
        return jsonify({"error": "Not found"}), 404
    return jsonify(geodatum)

@bp.route("/<int:geodatum_id>", methods=["PUT"])
@jwt_required()
def update_geodatum(geodatum_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not GeodatumOps.get_by_id(geodatum_id):
        return jsonify({"error": "Not found"}), 404
    GeodatumOps.update(geodatum_id, data["Longitude"], data["Latitude"], data["Zeit"])
    return jsonify({"msg": "GeoDatum updated"})

@bp.route("/<int:geodatum_id>", methods=["DELETE"])
@jwt_required()
def delete_geodatum(geodatum_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter", "Vehicle"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not GeodatumOps.get_by_id(geodatum_id):
        return jsonify({"error": "Not found"}), 404
    GeodatumOps.delete(geodatum_id)
    return jsonify({"msg": "GeoDatum deleted"}), 204
