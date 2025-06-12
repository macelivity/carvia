from flask import Blueprint, request, jsonify
from app.models.rechnung_ops import RechnungOps

bp = Blueprint("rechnung", __name__)

@bp.route("/", methods=["GET"])
def list_rechnungen():
    rechnungen = RechnungOps.get_all()
    return jsonify(rechnungen)

@bp.route("/", methods=["POST"])
def create_rechnung():
    data = request.get_json()
    rechnung_id = RechnungOps.create(data["FahrzeugID"], data["Bezahlt"], data["Austellungsdatum"])
    return jsonify({"msg": f"Rechnung with ID {rechnung_id} added", "id": rechnung_id}), 201

@bp.route("/<int:rechnung_id>", methods=["GET"])
def get_rechnung(rechnung_id):
    rechnung = RechnungOps.get_by_id(rechnung_id)
    if not rechnung:
        return jsonify({"error": "Not found"}), 404
    return jsonify(rechnung)

@bp.route("/<int:rechnung_id>", methods=["PUT"])
def update_rechnung(rechnung_id):
    data = request.get_json()
    if not RechnungOps.get_by_id(rechnung_id):
        return jsonify({"error": "Not found"}), 404
    RechnungOps.update(rechnung_id, data["FahrzeugID"], data["Bezahlt"], data["Austellungsdatum"])
    return jsonify({"msg": "Rechnung updated"})

@bp.route("/<int:rechnung_id>", methods=["DELETE"])
def delete_rechnung(rechnung_id):
    if not RechnungOps.get_by_id(rechnung_id):
        return jsonify({"error": "Not found"}), 404
    RechnungOps.delete(rechnung_id)
    return jsonify({"msg": "Rechnung deleted"}), 204

@bp.route("/fahrzeug/<int:fahrzeug_id>", methods=["GET"])
def get_rechnungen_by_fahrzeug(fahrzeug_id):
    rechnungen = RechnungOps.get_by_fahrzeug_id(fahrzeug_id)
    return jsonify(rechnungen)
