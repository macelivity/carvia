from flask import Blueprint, request, jsonify
from app.models.modell_ops import ModellOps

modell_bp = Blueprint("modell", __name__)

@modell_bp.route("/", methods=["GET"])
def list_modells():
    modells = ModellOps.get_all()
    return jsonify(modells)

@modell_bp.route("/", methods=["POST"])
def create_modell():
    data = request.get_json()
    ModellOps.create(data["ModellName"], data["Hersteller"], data["Fahrzeugtyp"], data["Getriebeart"], 
                     data["Kraftstoffart"], data["Leistung"], data["Türen"], data["Sitze"], 
                     data["Kofferraumvolumen"], data["Stundenpreis"])
    return jsonify({"msg": "Modell added"}), 201

@modell_bp.route("/<int:modell_id>", methods=["GET"])
def get_modell(modell_id):
    modell = ModellOps.get_by_id(modell_id)
    if not modell:
        return jsonify({"error": "Not found"}), 404
    return jsonify(modell)

@modell_bp.route("/<int:modell_id>", methods=["PUT"])
def update_modell(modell_id):
    data = request.get_json()
    if not ModellOps.get_by_id(modell_id):
        return jsonify({"error": "Not found"}), 404
    ModellOps.update(modell_id, data["ModellName"], data["Hersteller"], data["Fahrzeugtyp"], 
                     data["Getriebeart"], data["Kraftstoffart"], data["Leistung"], data["Türen"], 
                     data["Sitze"], data["Kofferraumvolumen"], data["Stundenpreis"])
    return jsonify({"msg": "Modell updated"})

@modell_bp.route("/<int:modell_id>", methods=["DELETE"])
def delete_modell(modell_id):
    if not ModellOps.get_by_id(modell_id):
        return jsonify({"error": "Not found"}), 404
    ModellOps.delete(modell_id)
    return jsonify({"msg": "Modell deleted"}), 204
