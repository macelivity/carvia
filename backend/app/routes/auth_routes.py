from flask import Blueprint, request, jsonify
from app.models.user_ops import UserOps
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity, create_refresh_token
from datetime import timedelta

bp = Blueprint("auth", __name__, url_prefix="/auth")

@bp.route("/register", methods=["POST"])
def register():
    """Registriert einen neuen Nutzer"""
    data = request.get_json()
    
    # Validate required fields
    required_fields = ['email', 'username', 'password', 'vorname', 'nachname', 'geburtsdatum', 'iban', 'bic', 'plz', 'ort', 'strasse' ,'hausnummer']
    for field in required_fields:
        if not data.get(field):
            return jsonify({"msg": f"Missing required field: {field}"}), 400

    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    
    # Check if username already exists
    if UserOps.username_exists(username):
        return jsonify({"msg": "Username already exists"}), 400
    
    # Validate password strength (basic validation)
    if len(password) < 6:
        return jsonify({"msg": "Password must be at least 6 characters long"}), 400
    
    try:
        # Create user with default role (assuming RolleID 1 is for regular users)
        user_id = UserOps.create_user(
            username=username,
            password=password,
            rolle_id=data.get("rolle_id", 1),  # Default to role 1
            vorname=data.get("vorname"),
            nachname=data.get("nachname"),
            geburtsdatum=data.get("geburtsdatum"),
            fuehrerschein=data.get("fuehrerschein"),
            iban=data.get("iban"),
            bic=data.get("bic"),
            hausnummer=data.get("hausnummer", ""),
            plz=data.get("plz", ""),
            ort=data.get("ort", ""),
            strasse=data.get("strasse", "")
        )
        
        return jsonify({
            "msg": "User created successfully", 
            "user_id": user_id
        }), 201
        
    except Exception as e:
        return jsonify({"msg": "Error creating user", "error": str(e)}), 500

@bp.route("/login", methods=["POST"])
def login():
    """Authentifiziert einen Nutzer und gibt JWT-Token zurück"""
    data = request.get_json()
    
    username = data.get("username")
    password = data.get("password")
    
    if not username or not password:
        return jsonify({"msg": "Missing username or password"}), 400
    
    # Get user from database
    user = UserOps.get_user_by_username(username)
    if not user:
        return jsonify({"msg": "Invalid username or password"}), 401
    
    # Check password
    if not UserOps.check_password(user["PasswordHash"], password):
        return jsonify({"msg": "Invalid username or password"}), 401
      # Create JWT tokens (convert user ID to string as required by Flask-JWT-Extended)
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

@bp.route("/refresh", methods=["POST"])
@jwt_required(refresh=True)
def refresh():
    """Erneuert den Access Token mit einem Refresh Token"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    new_token = create_access_token(
        identity=str(current_user_id),  # Convert to string for token
        expires_delta=timedelta(hours=1)
    )
    return jsonify({"access_token": new_token}), 200

@bp.route("/profile", methods=["GET"])
@jwt_required()
def get_profile():
    """Gibt das Profil des aktuell authentifizierten Nutzers zurück"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    user = UserOps.get_user_by_id(current_user_id)
    
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Remove sensitive information
    user_data = user.copy()
    user_data.pop("PasswordHash", None)
    
    return jsonify({"user": user_data}), 200

@bp.route("/profile", methods=["PUT"])
@jwt_required()
def update_profile():
    """Aktualisiert das Profil des aktuell authentifizierten Nutzers"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    data = request.get_json()
    
    # Remove sensitive fields that shouldn't be updated via this endpoint
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
    current_user_id = int(get_jwt_identity())  # Convert back to int
    data = request.get_json()
    
    current_password = data.get("current_password")
    new_password = data.get("new_password")
    
    if not current_password or not new_password:
        return jsonify({"msg": "Missing current_password or new_password"}), 400
    
    # Validate new password
    if len(new_password) < 6:
        return jsonify({"msg": "New password must be at least 6 characters long"}), 400
    
    # Get current user
    user = UserOps.get_user_by_id(current_user_id)
    if not user:
        return jsonify({"msg": "User not found"}), 404
    
    # Verify current password
    if not UserOps.check_password(user["PasswordHash"], current_password):
        return jsonify({"msg": "Current password is incorrect"}), 401
    
    try:
        UserOps.update_user(current_user_id, password=new_password)
        return jsonify({"msg": "Password changed successfully"}), 200
    except Exception as e:
        return jsonify({"msg": "Error changing password", "error": str(e)}), 500

# Protected route example
@bp.route("/protected", methods=["GET"])
@jwt_required()
def protected():
    """Beispiel für eine geschützte Route"""
    current_user_id = int(get_jwt_identity())  # Convert back to int
    return jsonify({
        "msg": "This is a protected route",
        "logged_in_as": current_user_id
    }), 200