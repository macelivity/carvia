from flask import Blueprint, request, jsonify
from app.models.fahrzeug_ops import FahrzeugOps

fahrzeug_bp = Blueprint("fahrzeug", __name__)

@fahrzeug_bp.route("/", methods=["GET"])
def list_fahrzeugs():
    fahrzeugs = FahrzeugOps.get_all()
    return jsonify(fahrzeugs)

@fahrzeug_bp.route("/", methods=["POST"])
def create_fahrzeug():
    data = request.get_json()
    FahrzeugOps.create(data["ModellID"], data["Kennzeichen"], data["Reperaturzustand"], data["Aktiv"],
                     data["Reifen"], data["Kilometerstand"], data["LetzterService"], data["TuevDatum"],
                     data["ErstzulassungsDatum"])
    return jsonify({"msg": "Fahrzeug added"}), 201

@fahrzeug_bp.route("/<int:fahrzeug_id>", methods=["GET"])
def get_fahrzeug(fahrzeug_id):
    fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
    if not fahrzeug:
        return jsonify({"error": "Not found"}), 404
    return jsonify(fahrzeug)

@fahrzeug_bp.route("/<int:fahrzeug_id>", methods=["PUT"])
def update_fahrzeug(fahrzeug_id):
    data = request.get_json()
    if not FahrzeugOps.get_by_id(fahrzeug_id):
        return jsonify({"error": "Not found"}), 404
    FahrzeugOps.update(fahrzeug_id, data["ModellID"], data["Kennzeichen"], data["Reperaturzustand"], data["Aktiv"],
                     data["Reifen"], data["Kilometerstand"], data["LetzterService"], data["TuevDatum"],
                     data["ErstzulassungsDatum"])
    return jsonify({"msg": "Fahrzeug updated"})

@fahrzeug_bp.route("/<int:fahrzeug_id>", methods=["DELETE"])
def delete_fahrzeug(fahrzeug_id):
    if not FahrzeugOps.get_by_id(fahrzeug_id):
        return jsonify({"error": "Not found"}), 404
    FahrzeugOps.delete(fahrzeug_id)
    return jsonify({"msg": "Fahrzeug deleted"}), 204
