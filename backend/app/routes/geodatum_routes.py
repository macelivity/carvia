from flask import Blueprint, request, jsonify
from app.models.geodatum_ops import GeoDatumOps

geodatum_bp = Blueprint("geodatum", __name__)

@geodatum_bp.route("/", methods=["GET"])
def list_geodatums():
    geodatums = GeoDatumOps.get_all()
    return jsonify(geodatums)

@geodatum_bp.route("/", methods=["POST"])
def create_geodatum():
    data = request.get_json()
    GeoDatumOps.create(data["Längengrad"], data["Breitengrad"], data["Zeit"])
    return jsonify({"msg": "GeoDatum added"}), 201

@geodatum_bp.route("/<int:geodatum_id>", methods=["GET"])
def get_geodatum(geodatum_id):
    geodatum = GeoDatumOps.get_by_id(geodatum_id)
    if not geodatum:
        return jsonify({"error": "Not found"}), 404
    return jsonify(geodatum)

@geodatum_bp.route("/<int:geodatum_id>", methods=["PUT"])
def update_geodatum(geodatum_id):
    data = request.get_json()
    if not GeoDatumOps.get_by_id(geodatum_id):
        return jsonify({"error": "Not found"}), 404
    GeoDatumOps.update(geodatum_id, data["Längengrad"], data["Breitengrad"], data["Zeit"])
    return jsonify({"msg": "GeoDatum updated"})

@geodatum_bp.route("/<int:geodatum_id>", methods=["DELETE"])
def delete_geodatum(geodatum_id):
    if not GeoDatumOps.get_by_id(geodatum_id):
        return jsonify({"error": "Not found"}), 404
    GeoDatumOps.delete(geodatum_id)
    return jsonify({"msg": "GeoDatum deleted"}), 204
