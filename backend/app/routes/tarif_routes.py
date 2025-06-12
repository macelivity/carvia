from flask import Blueprint, request, jsonify
from app.models.tarif_ops import TarifOps

bp = Blueprint("tarif", __name__)

@bp.route("/", methods=["GET"])
def list_tarife():
    tarife = TarifOps.get_all()
    return jsonify(tarife)

@bp.route("/", methods=["POST"])
def create_tarif():
    data = request.get_json()
    tarif_id = TarifOps.create(data["Name"], data["Freikilometer"], data["Versicherungsschutz"])
    return jsonify({"msg": f"Tarif with ID {tarif_id} added", "id": tarif_id}), 201

@bp.route("/<int:tarif_id>", methods=["GET"])
def get_tarif(tarif_id):
    tarif = TarifOps.get_by_id(tarif_id)
    if not tarif:
        return jsonify({"error": "Not found"}), 404
    return jsonify(tarif)

@bp.route("/<int:tarif_id>", methods=["PUT"])
def update_tarif(tarif_id):
    data = request.get_json()
    if not TarifOps.get_by_id(tarif_id):
        return jsonify({"error": "Not found"}), 404
    TarifOps.update(tarif_id, data["Name"], data["Freikilometer"], data["Versicherungsschutz"])
    return jsonify({"msg": "Tarif updated"})

@bp.route("/<int:tarif_id>", methods=["DELETE"])
def delete_tarif(tarif_id):
    if not TarifOps.get_by_id(tarif_id):
        return jsonify({"error": "Not found"}), 404
    TarifOps.delete(tarif_id)
    return jsonify({"msg": "Tarif deleted"}), 204
