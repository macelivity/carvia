from flask import Blueprint, request, jsonify
from app.models.geodatum_ops import GeodatumOps

bp = Blueprint("geodatum", __name__, url_prefix="/geodatum")

@bp.route("/", methods=["GET"])
def list_geodatums():
    geodatums = GeodatumOps.get_all()
    return jsonify(geodatums)

@bp.route("/", methods=["POST"])
def create_geodatum():
    data = request.get_json()
    geodatum_id = GeodatumOps.create(data["Longitude"], data["Latitude"], data["Zeit"])
    return jsonify({"msg": f"GeoDatum with ID {geodatum_id} added", "id": geodatum_id}), 201

@bp.route("/<int:geodatum_id>", methods=["GET"])
def get_geodatum(geodatum_id):
    geodatum = GeodatumOps.get_by_id(geodatum_id)
    if not geodatum:
        return jsonify({"error": "Not found"}), 404
    return jsonify(geodatum)

@bp.route("/<int:geodatum_id>", methods=["PUT"])
def update_geodatum(geodatum_id):
    data = request.get_json()
    if not GeodatumOps.get_by_id(geodatum_id):
        return jsonify({"error": "Not found"}), 404
    GeodatumOps.update(geodatum_id, data["Longitude"], data["Latitude"], data["Zeit"])
    return jsonify({"msg": "GeoDatum updated"})

@bp.route("/<int:geodatum_id>", methods=["DELETE"])
def delete_geodatum(geodatum_id):
    if not GeodatumOps.get_by_id(geodatum_id):
        return jsonify({"error": "Not found"}), 404
    GeodatumOps.delete(geodatum_id)
    return jsonify({"msg": "GeoDatum deleted"}), 204
