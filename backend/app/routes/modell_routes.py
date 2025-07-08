from flask import Blueprint, request, jsonify
from app.models.modell_ops import ModellOps
from app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity # Import für Autorisierung

bp = Blueprint("modell", __name__, url_prefix="/modell")

@bp.route("/", methods=["GET"])
def list_modells():
    modells = ModellOps.get_all()
    return jsonify(modells)

@bp.route("/", methods=["POST"])
@jwt_required()
def create_modell():
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    modell_id = ModellOps.create(data["ModellName"], data["Hersteller"], data["Fahrzeugtyp"], data["Getriebeart"], 
                     data["Kraftstoffart"], data["Leistung"], data["Türen"], data["Sitze"], 
                     data["Kofferraumvolumen"], data["Stundenpreis"])
    return jsonify({"msg": f"Modell with ID {modell_id} added", "id": modell_id}), 201

@bp.route("/<int:modell_id>", methods=["GET"])
def get_modell(modell_id):
    modell = ModellOps.get_by_id(modell_id)
    if not modell:
        return jsonify({"error": "Not found"}), 404
    return jsonify(modell)

@bp.route("/<int:modell_id>", methods=["PUT"])
@jwt_required()
def update_modell(modell_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    if not ModellOps.get_by_id(modell_id):
        return jsonify({"error": "Not found"}), 404
    ModellOps.update(modell_id, data["ModellName"], data["Hersteller"], data["Fahrzeugtyp"], 
                     data["Getriebeart"], data["Kraftstoffart"], data["Leistung"], data["Türen"], 
                     data["Sitze"], data["Kofferraumvolumen"], data["Stundenpreis"])
    return jsonify({"msg": "Modell updated"})

@bp.route("/<int:modell_id>", methods=["DELETE"])
@jwt_required()
def delete_modell(modell_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not ModellOps.get_by_id(modell_id):
        return jsonify({"error": "Not found"}), 404
    ModellOps.delete(modell_id)
    return jsonify({"msg": "Modell deleted"}), 204
