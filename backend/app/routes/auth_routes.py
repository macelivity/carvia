from flask import Blueprint, request, jsonify
from app.models.user_ops import UserOps
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from datetime import timedelta

"""
Authentifizierungs-Routes für das Carsharing-System.
Verwaltet Benutzerregistrierung, Login, Profilaktualisierung und JWT-Token-Management.
"""

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/register", methods=["POST"])
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

@bp.route("/login", methods=["POST"])
def login():
    """Authentifiziert einen Nutzer und gibt JWT-Token zurück"""
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400
    
    # Benutzer aus der Datenbank laden
    user = UserOps.get_user_by_username(username)
    if not user:
        return jsonify({"msg": "Invalid username or password"}), 401
    
    # Prüfen ob der Benutzer genehmigt wurde
    if not user["Angenommen"]:
        return jsonify({"msg": "User not accepted yet"}), 403

    # Passwort verifizieren
    if not UserOps.check_password(user["PasswordHash"], password):
        return jsonify({"msg": "Invalid username or password"}), 401
        
    # JWT-Token erstellen (UserID als String für Flask-JWT-Extended)
    access_token = create_access_token(
        identity=str(user["UserID"]), 
        expires_delta=timedelta(hours=1)
    )
    refresh_token = create_refresh_token(
        identity=str(user["UserID"]),
        expires_delta=timedelta(days=30)
    )
    
    return jsonify({
        "access_token": access_token,
        "refresh_token": refresh_token,
        "user": {
            "user_id": user["UserID"],
            "username": user["Username"],
            "vorname": user["Vorname"],
            "nachname": user["Nachname"],
            "rolle_id": user["RolleID"]
        }
    }), 200

@bp.route("/users", methods=["GET"])
@jwt_required()
def get_all_users():
    """Gibt eine Liste aller Nutzer zurück"""
    if not UserOps.is_authorized(int(get_jwt_identity()), ["Mitarbeiter", "Admin"]):
        return jsonify({"msg": "Unauthorized"}), 403

    try:
        users = UserOps.get_all_users()
        
        # Entferne sensible Informationen für die Ausgabe
        user_list = []
        for user in users:
            user_data = user.copy()
            user_data.pop("PasswordHash", None)  # Passwort-Hash entfernen
            user_list.append(user_data)
            
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"msg": "Error retrieving users", "error": str(e)}), 500

@bp.route("/users/not-approved", methods=["GET"])
@jwt_required()
def get_all_not_approved_users():
    """Gibt eine Liste aller nicht akzeptierten Nutzer zurück"""

    if not UserOps.is_authorized(int(get_jwt_identity()), ["Mitarbeiter"]):
        return jsonify({"msg": "Unauthorized"}), 403
        
    try:
        users = UserOps.get_all_not_approved_users()
        
        # Entferne sensible Informationen und bereite die Ausgabe vor
        user_list = []
        for user in users:
            user_data = user.copy()
            user_data.pop("PasswordHash", None)  # Passwort-Hash entfernen
            user_list.append(user_data)
            
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"msg": "Error retrieving not approved users", "error": str(e)}), 500
    
@bp.route("/users/<int:user_id>/approve", methods=["PUT"])
@jwt_required()
def approve_user(user_id):
    """Genehmigt einen Nutzer"""
    if not UserOps.is_authorized(int(get_jwt_identity()), ["Mitarbeiter"]):
        return jsonify({"msg": "Unauthorized"}), 403

    try:
        UserOps.approve_user(user_id)
        return jsonify({"msg": "User approved successfully"}), 200
    except Exception as e:
        return jsonify({"msg": "Error approving user", "error": str(e)}), 500

@bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Erneuert den Access Token mit einem Refresh Token"""
    user_id = int(get_jwt_identity())  # Convert back to int
    new_token = create_access_token(
        identity=str(user_id),  # Convert to string for token
        expires_delta=timedelta(hours=1)
    )
    return jsonify({"access_token": new_token}), 200

@bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Gibt das Profil des aktuell authentifizierten Nutzers zurück"""
    user_id = int(get_jwt_identity())  # Zurück zu int konvertieren
    user = UserOps.get_user_by_id(user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Sensible Informationen entfernen
    user_data = user.copy()
    user_data.pop("PasswordHash", None)
    
    return jsonify({"user": user_data}), 200

@bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Aktualisiert das Profil des aktuell authentifizierten Nutzers"""
    current_user_id = int(get_jwt_identity())  # Zurück zu int konvertieren
    data = request.get_json()
    
    # Sensible Felder entfernen, die nicht über diesen Endpoint aktualisiert werden sollten
    data.pop("UserID", None)
    data.pop("PasswordHash", None)
    
    try:
        success = UserOps.update_user(current_user_id, **data)
        if success:
            return jsonify({"msg": "Profile updated successfully"}), 200
        else:
            return jsonify({"msg": "No valid fields to update"}), 400
    except Exception as e:
        return jsonify({"msg": "Error updating profile", "error": str(e)}), 500

@bp.route("/change-password", methods=["PUT"])
@jwt_required()
def change_password():
    """Ändert das Passwort des aktuell authentifizierten Nutzers"""
    current_user_id = int(get_jwt_identity())  # Zurück zu int konvertieren
    data = request.get_json()
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"msg": "Missing current_password or new_password"}), 400
    
    # Neues Passwort validieren
    if len(new_password) < 6:
        return jsonify({"msg": "New password must be at least 6 characters long"}), 400
    
    # Aktuellen Benutzer laden
    user = UserOps.get_user_by_id(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Aktuelles Passwort verifizieren
    if not UserOps.check_password(user["PasswordHash"], current_password):
        return jsonify({"msg": "Current password is incorrect"}), 401
    
    try:
        UserOps.update_user(current_user_id, password=new_password)
        return jsonify({"msg": "Password changed successfully"}), 200
    except Exception as e:
        return jsonify({"msg": "Error changing password", "error": str(e)}), 500
