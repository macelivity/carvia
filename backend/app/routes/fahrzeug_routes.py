from flask import Blueprint, request, jsonify
from app.models.fahrzeug_ops import FahrzeugOps
from datetime import datetime # Import für Datumskonvertierung

# Expose the blueprint as 'bp' for test imports
bp = Blueprint("fahrzeug", __name__, url_prefix="/fahrzeug")

@bp.route("/", methods=["GET"])
def list_fahrzeugs():
    fahrzeugs = FahrzeugOps.get_all()
    return jsonify(fahrzeugs)

@bp.route("/filter", methods=["GET"])
def list_filtered_fahrzeugs():
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
    - abholort (string)
    - rueckgabeort (string)
    """
    try:
        start_datum_str = request.args.get("start_datum")
        end_datum_str = request.args.get("end_datum")
        
        # Konvertiere Datumsstrings zu datetime-Objekten, falls vorhanden
        # Die get_filtered Methode erwartet Strings, aber eine Validierung hier ist gut
        start_datum = None
        if start_datum_str:
            try:
                start_datum = datetime.fromisoformat(start_datum_str)
            except ValueError:
                return jsonify({"error": "Ungültiges Format für start_datum. Bitte YYYY-MM-DDTHH:MM:SS verwenden."}), 400
        
        end_datum = None
        if end_datum_str:
            try:
                end_datum = datetime.fromisoformat(end_datum_str)
            except ValueError:
                return jsonify({"error": "Ungültiges Format für end_datum. Bitte YYYY-MM-DDTHH:MM:SS verwenden."}), 400

        # Hole weitere Filterparameter
        hersteller = request.args.get("hersteller")
        fahrzeugtyp = request.args.get("fahrzeugtyp")
        getriebeart = request.args.get("getriebeart")
        sitze_str = request.args.get("sitze")
        stundenpreis_str = request.args.get("stundenpreis")
        abholort = request.args.get("abholort")
        rueckgabeort = request.args.get("rueckgabeort")

        sitze = int(sitze_str) if sitze_str else None
        stundenpreis = float(stundenpreis_str) if stundenpreis_str else None

        # Übergebe die originalen Strings für Datum an get_filtered, da die Methode diese erwartet
        fahrzeuge = FahrzeugOps.get_filtered(
            start_datum=start_datum_str, 
            end_datum=end_datum_str,
            hersteller=hersteller,
            fahrzeugtyp=fahrzeugtyp,
            getriebeart=getriebeart,
            sitze=sitze,
            stundenpreis=stundenpreis,
            abholort=abholort,
            rueckgabeort=rueckgabeort
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
    fahrzeug = FahrzeugOps.get_by_id(fahrzeug_id)
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
