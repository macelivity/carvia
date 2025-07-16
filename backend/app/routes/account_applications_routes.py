from flask import Blueprint, request, jsonify
from app.models.user_ops import UserOps
from app.models.reservierung_ops import ReservierungOps
from flask_jwt_extended import jwt_required, get_jwt_identity

"""
Mitgliedschaftsanträge-Routes für das Carsharing-System.
Verwaltet Benutzersuche, Reservierungshistorie und Benutzerverwaltung.
"""

bp = Blueprint("account-applications", __name__)

@bp.route("/", methods=["GET"])
@jwt_required()
def get_all_not_approved_users():
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    users = UserOps.get_pending_applications()
    for user in users:
        user.pop("PasswordHash", None)
    return jsonify(users)

@bp.route("/", methods=["POST"])
@jwt_required(optional=True)
def register():
    """Registriert einen neuen Nutzer mit Validierung der Pflichtfelder"""
    data = request.get_json()
    
    # Pflichtfelder validieren
    required_fields = ['email', 'username', 'password', 'vorname', 'nachname', 
                      'geburtsdatum', 'iban', 'bic', 'plz', 'ort', 'strasse', 'hausnummer']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"Missing required field: {field}"}), 400

    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    angenommen = data.get("angenommen", False)
    
    # Nur Mitarbeiter und Admins können Benutzer direkt genehmigen
    jwt_identity = get_jwt_identity()
    if not jwt_identity or not UserOps.is_authorized(int(jwt_identity), ["Mitarbeiter", "Admin"]):
        angenommen = False
    
    # Prüfen ob Benutzername bereits existiert
    if UserOps.username_exists(username):
        return jsonify({"msg": "Username already exists"}), 400
    
    # Passwort-Stärke validieren (grundlegende Validierung)
    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters long"}), 400
    
    user_id = UserOps.create_user(
        username=username,
        password=password,
        rolle_id=data.get("rolle_id", 1),
        vorname=data.get("vorname"),
        nachname=data.get("nachname"),
        email=email,
        geburtsdatum=data.get("geburtsdatum"),
        fuehrerschein=data.get("fuehrerschein"),
        iban=data.get("iban"),
        bic=data.get("bic"),
        hausnummer=data.get("hausnummer", ""),
        plz=data.get("plz", ""),
        ort=data.get("ort", ""),
        strasse=data.get("strasse", ""),
        angenommen=angenommen
    )
    
    return jsonify({
        "msg": "User created successfully", 
        "user_id": user_id
    }), 201
    
@bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()    
def set_application_status(user_id):
    if not UserOps.is_authorized(get_jwt_identity(), ["Mitarbeiter"]):
        return jsonify({"error": "Zugriff verweigert"}), 403

    data = request.json
    accepted = data.get("accepted")

    UserOps.set_application_status(user_id, accepted)

    return jsonify({"success": True})

