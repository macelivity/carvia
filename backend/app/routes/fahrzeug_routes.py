from datetime import datetime
from flask import Blueprint, request, jsonify
from app.models.fahrzeug_ops import FahrzeugOps
from app.models.geodatum_ops import GeodatumOps # Import für Geodaten
from app.models.rolle_ops import RolleOps # Import für Rollenoperationen
from flask_jwt_extended import jwt_required, get_jwt_identity # Import für Autorisierung

# Expose the blueprint as 'bp' for test imports
bp = Blueprint("fahrzeug", __name__, url_prefix="/fahrzeug")

@bp.route("/", methods=["GET"])
def list_fahrzeuge():
    fahrzeuge = FahrzeugOps.get_all_detailed()
    return jsonify(fahrzeuge)

@bp.route("/filter", methods=["GET"])
def list_filtered_fahrzeuge():
    """
    Gibt eine gefilterte Liste von Fahrzeugen zurück.
    Mögliche Query-Parameter:
    - start_datum (YYYY-MM-DDTHH:MM:SS)
    - end_datum (YYYY-MM-DDTHH:MM:SS)
    - hersteller (string)
    - fahrzeugtyp (string)
    - getriebeart (string)
    - sitze (integer)
    - stundenpreis (float)
    """
    try:
        start_datum = request.args.get("start_datum")
        end_datum = request.args.get("end_datum")
        hersteller = request.args.get("hersteller")
        fahrzeugtyp = request.args.get("fahrzeugtyp")
        getriebeart = request.args.get("getriebeart")
        sitze_str = request.args.get("sitze")
        stundenpreis_str = request.args.get("stundenpreis")

        sitze = int(sitze_str) if sitze_str else None
        stundenpreis = float(stundenpreis_str) if stundenpreis_str else None

        # Übergebe die originalen Strings für Datum an get_filtered, da die Methode diese erwartet
        fahrzeuge = FahrzeugOps.get_filtered(
            start_datum=start_datum, 
            end_datum=end_datum,
            hersteller=hersteller,
            fahrzeugtyp=fahrzeugtyp,
            getriebeart=getriebeart,
            sitze=sitze,
            stundenpreis=stundenpreis
        )
        return jsonify(fahrzeuge), 200
    except ValueError as ve: # Für int/float Konvertierungsfehler
        return jsonify({"error": f"Ungültiger Wert für einen numerischen Filter: {ve}"}), 400
    except Exception as e:
        # Logge den Fehler serverseitig für Debugging
        print(f"Fehler beim Filtern von Fahrzeugen: {e}")
        return jsonify({"error": "Ein interner Fehler ist aufgetreten."}), 500


@bp.route("/", methods=["POST"])
def create_fahrzeug():
    data = request.get_json()
    fahrzeug_id = FahrzeugOps.create(data["ModellID"], data["Kennzeichen"], data["Reperaturzustand"], data["Aktiv"],
                     data["Reifen"], data["Kilometerstand"], data["LetzterService"], data["TuevDatum"],
                     data["ErstzulassungsDatum"])
    return jsonify({"msg": f"Fahrzeug with ID {fahrzeug_id} added", "id": fahrzeug_id}), 201

@bp.route("/<int:fahrzeug_id>", methods=["GET"])
def get_fahrzeug(fahrzeug_id):
    fahrzeug = FahrzeugOps.get_by_id_detailed(fahrzeug_id)
    if not fahrzeug:
        return jsonify({"error": "Not found"}), 404
    return jsonify(fahrzeug)

@bp.route("/<int:fahrzeug_id>", methods=["PUT"])
def update_fahrzeug(fahrzeug_id):
    data = request.get_json()
    if not FahrzeugOps.get_by_id(fahrzeug_id):
        return jsonify({"error": "Not found"}), 404
    FahrzeugOps.update(fahrzeug_id, data["ModellID"], data["Kennzeichen"], data["Reperaturzustand"], data["Aktiv"],
                     data["Reifen"], data["Kilometerstand"], data["LetzterService"], data["TuevDatum"],
                     data["ErstzulassungsDatum"])
    return jsonify({"msg": "Fahrzeug updated"})

@bp.route("/<int:fahrzeug_id>", methods=["DELETE"])
def delete_fahrzeug(fahrzeug_id):
    if not FahrzeugOps.get_by_id(fahrzeug_id):
        return jsonify({"error": "Not found"}), 404
    FahrzeugOps.delete(fahrzeug_id)
    return jsonify({"msg": "Fahrzeug deleted"}), 204

@bp.route("/<int:fahrzeug_id>/location", methods=["GET"])
@jwt_required()
def get_fahrzeug_location(fahrzeug_id):
    """
    Gibt die aktuelle Position eines Fahrzeugs zurück.
    Zugriffsregeln:
    - Mitarbeiter: Immer Zugriff.
    - Mitglieder: Nur Zugriff, wenn das Fahrzeug aktuell nicht verwendet wird (keine aktive Buchung).
    """
    role = RolleOps.get_by_user_id(int(get_jwt_identity()))  # Hole die Rolle des Nutzers aus dem JWT

    if not role:
        return jsonify({"error": "Access denied"}), 401

    if role['Bedeutung'] not in ["User", "Manager"]:
        return jsonify({"error": "Zugriff verweigert: Ungültige Rolle"}), 403

    fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
    if not fahrzeug:
        return jsonify({"error": "Fahrzeug nicht gefunden"}), 404

    # Mitarbeiter dürfen die Position immer abfragen
    if role['Bedeutung'] == "Manager":
        location_data = GeodatumOps.get_location_of_vehicle(fahrzeug_id)
        if not location_data:
            return jsonify({"error": "Keine Positionsdaten für dieses Fahrzeug gefunden"}), 404
        return jsonify(location_data), 200

    # Mitglieder dürfen die Position nur abfragen, wenn das Fahrzeug nicht aktiv gebucht ist
    if role['Bedeutung'] == "User" and not FahrzeugOps.is_booked_at_time(fahrzeug_id, datetime.now().isoformat()):
        location_data = GeodatumOps.get_location_of_vehicle(fahrzeug_id)
        if not location_data:
            return jsonify({"error": "Keine Positionsdaten für dieses Fahrzeug gefunden"}), 404
        return jsonify(location_data), 200
    
    return jsonify({"error": "Unerwarteter Fehler bei der Autorisierung"}), 500
