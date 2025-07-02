from datetime import datetime # Sicherstellen, dass datetime importiert ist
from flask import Blueprint, request, jsonify
from app.models.fahrzeug_ops import FahrzeugOps
from app.models.geodatum_ops import GeodatumOps # Import für Geodaten
from app.models.rolle_ops import RolleOps # Import für Rollenoperationen
from backend.app.models.user_ops import UserOps
from flask_jwt_extended import jwt_required, get_jwt_identity # Import für Autorisierung

# Expose the blueprint as 'bp' for test imports
bp = Blueprint("fahrzeug", __name__, url_prefix="/fahrzeug")

@bp.route("/", methods=["GET"])
def list_fahrzeuge():
    detailed = request.args.get("detailed")
    if detailed and detailed.lower() == "true":
        fahrzeuge = FahrzeugOps.get_all_detailed()
    else:
        fahrzeuge = FahrzeugOps.get_all()
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

        # test endpoint TODO remove later
        if hersteller == "test":
            print("returning Testvehicles")
            return jsonify(FahrzeugOps.get_all_detailed()), 200
        

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
@jwt_required()
def create_fahrzeug():
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    fahrzeug_id = FahrzeugOps.create(data["ModellID"], data["Kennzeichen"], data["Reperaturzustand"], data["Aktiv"],
                     data["Reifen"], data["Kilometerstand"], data["LetzterService"], data["TuevDatum"],
                     data["ErstzulassungsDatum"])
    return jsonify({"msg": f"Fahrzeug with ID {fahrzeug_id} added", "id": fahrzeug_id}), 201

@bp.route("/<int:fahrzeug_id>", methods=["GET"])
def get_fahrzeug(fahrzeug_id):
    detailed = request.args.get("detailed")
    if detailed and detailed.lower() == "true":
        fahrzeug = FahrzeugOps.get_by_id_detailed(fahrzeug_id)
    else:
        fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
    if not fahrzeug:
        return jsonify({"error": "Not found"}), 404
    return jsonify(fahrzeug)

@bp.route("/<int:fahrzeug_id>", methods=["PUT"])
@jwt_required()
def update_fahrzeug(fahrzeug_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.get_json()
    fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
    if not fahrzeug:
        return jsonify({"error": "Not found"}), 404
    FahrzeugOps.update(fahrzeug_id,
            data["ModellID"] if data.get("ModellID") else fahrzeug["ModellID"],
            data["Kennzeichen"] if data.get("Kennzeichen") else fahrzeug["Kennzeichen"],
            data["Reperaturzustand"] if data.get("Reperaturzustand") else fahrzeug["Reperaturzustand"],
            data["Aktiv"] if data.get("Aktiv") else fahrzeug["Aktiv"],
            data["Reifen"] if data.get("Reifen") else fahrzeug["Reifen"],
            data["Kilometerstand"] if data.get("Kilometerstand") else fahrzeug["Kilometerstand"],
            data["LetzterService"] if data.get("LetzterService") else fahrzeug["LetzterService"],
            data["TuevDatum"] if data.get("TuevDatum") else fahrzeug["TuevDatum"],
            data["ErstzulassungsDatum"] if data.get("ErstzulassungsDatum") else fahrzeug["ErstzulassungsDatum"])
    return jsonify({"msg": "Fahrzeug updated"})

@bp.route("/<int:fahrzeug_id>", methods=["DELETE"])
@jwt_required()
def delete_fahrzeug(fahrzeug_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Manager"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    if not FahrzeugOps.get_by_id(fahrzeug_id):
        return jsonify({"error": "Not found"}), 404
    FahrzeugOps.delete(fahrzeug_id)
    return jsonify({"msg": "Fahrzeug deleted"}), 204

@bp.route("/<int:fahrzeug_id>/location", methods=["GET"])
@jwt_required()
def get_fahrzeug_location(fahrzeug_id):
    """
    Gibt die aktuelle oder erwartete Position eines Fahrzeugs zurück.
    Akzeptiert einen optionalen Query-Parameter 'time' (ISO-Format, z.B. YYYY-MM-DDTHH:MM:SS).
    Zugriffsregeln:
    - Manager: Immer Zugriff.
    - User: Nur Zugriff, wenn das Fahrzeug zum angefragten Zeitpunkt (oder aktuell) nicht gebucht ist.
    """

    jwt_identity = get_jwt_identity()

    if not jwt_identity:
        return jsonify({"error": "Zugriff verweigert"}), 403

    user_id = int(jwt_identity)
    role_entry = RolleOps.get_by_user_id(user_id)

    if not role_entry:
        return jsonify({"error": "Zugriff verweigert: Benutzerrolle nicht gefunden."}), 401

    user_role = role_entry['Bedeutung']

    if user_role not in ["User", "Manager"]:
        return jsonify({"error": "Zugriff verweigert: Ungültige Rolle."}), 403

    fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
    if not fahrzeug:
        return jsonify({"error": "Fahrzeug nicht gefunden."}), 404

    date_param_str = request.args.get("date")
    query_time_iso_str = datetime.now().isoformat() # Standard ist die aktuelle Zeit

    if date_param_str:
        try:
            datetime.fromisoformat(date_param_str.replace('Z', '+00:00'))
            query_time_iso_str = date_param_str
        except ValueError:
            return jsonify({"error": "Ungültiges Zeitformat für 'time'. Bitte ISO-Format verwenden (z.B. YYYY-MM-DDTHH:MM:SS)."}), 400

    # Autorisierungslogik: User dürfen nur zugreifen, wenn Fahrzeug nicht gebucht ist zum query_time_iso_str
    if user_role == "User":
        if FahrzeugOps.is_booked_at_time(fahrzeug_id, query_time_iso_str):
            return jsonify({"error": f"Zugriff auf Fahrzeugposition verweigert, da das Fahrzeug zum Zeitpunkt {query_time_iso_str} gebucht ist."}), 403

    # Datenabruf basierend darauf, ob 'time' angefragt wurde
    # Erwartete Position für den gegebenen Zeitpunkt
    location_data = FahrzeugOps.get_target_destination(fahrzeug_id, query_time_iso_str if date_param_str else datetime.now().isoformat())
    if not location_data:
        return jsonify({"error": f"Keine erwarteten Positionsdaten für Fahrzeug {fahrzeug_id} zum Zeitpunkt {query_time_iso_str} gefunden."}), 404
    return jsonify(location_data), 200
