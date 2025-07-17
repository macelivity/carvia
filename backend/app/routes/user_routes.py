from flask import Blueprint, request, jsonify
from app.models.user_ops import UserOps
from app.models.reservierung_ops import ReservierungOps
from flask_jwt_extended import jwt_required, get_jwt_identity

"""
Benutzer-Routes für das Carsharing-System.
Verwaltet Benutzersuche, Reservierungshistorie und Benutzerverwaltung.
"""

bp = Blueprint("user", __name__)

@bp.route("/search", methods=["GET"])
@jwt_required()
def search_users():
    """Sucht Benutzer nach Vor- und Nachnamen (nur für Mitarbeiter)"""
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    vorname = request.args.get("vorname", "")
    nachname = request.args.get("nachname", "")

    if not vorname and not nachname:
        return jsonify([])
    
    users = UserOps.search_users(vorname, nachname)
    return jsonify(users)

@bp.route("/<int:user_id>/reservations", methods=["GET"])
@jwt_required()
def get_user_reservations(user_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitglied", "Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403
    
    if UserOps.is_authorized(get_jwt_identity(), ["Mitglied"]) and user_id != int(get_jwt_identity()):
        return jsonify({"error": "Zugriff verweigert"}), 403


    # Holt alle Reservierungen für einen User
    reservierungen = ReservierungOps.get_by_user_id(user_id)
    return jsonify(reservierungen)

@bp.route("/", methods=["GET"])
@jwt_required()
def get_all_users():
    
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    users = UserOps.get_all_users()
    
    # Entferne sensible Informationen und bereite die Ausgabe vor
    user_list = []
    for user in users:
        user_data = user.copy()
        user_data.pop("PasswordHash", None) # Passwort-Hash entfernen
        user_list.append(user_data)
        
    return jsonify(user_list), 200

@bp.route("/identitycheck", methods=["POST"])
def identity_check():

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    
    file = request.files['file']
    user_id = request.form.get('user_id')

    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400
    
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        return jsonify({"success": False, "error": "Invalid file type"}), 415
    
    result = UserOps.identitycheck(user_id, None, None)
    return jsonify({"success": result})

@bp.route("/licencecheck", methods=["POST"])
def licence_check():

    if 'file' not in request.files:
        return jsonify({"success": False, "error": "No file uploaded"}), 400
    
    file = request.files['file']
    user_id = request.form.get('user_id')

    if not file or file.filename == '':
        return jsonify({"success": False, "error": "No file selected"}), 400
    
    if not file.filename.lower().endswith((".png", ".jpg", ".jpeg")):
        return jsonify({"success": False, "error": "Invalid file type"}), 415
    
    result = UserOps.licencecheck(user_id, None)
    return jsonify({"success": result})

@bp.route("/creditworthycheck", methods=["POST"])
def creditworthy_check():

    data = request.json
    user_id = data.get("user_id")
    name = data.get("name")
    bic = data.get("bic")
    iban = data.get("iban")

    result = UserOps.creditworthycheck(user_id, name, bic, iban)

    return jsonify({"success": result})