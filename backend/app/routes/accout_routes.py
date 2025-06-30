from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models.user_ops import UserOps

bp = Blueprint("accounts", __name__, url_prefix="/accounts")

def get_current_user():
    """Hilfsfunktion: Holt den aktuellen Nutzer aus der DB"""
    current_user_id = int(get_jwt_identity())
    return UserOps.get_user_by_id(current_user_id)

# Route 1: Alle Nutzer mit Rolle "Manager" oder "Customer Support" (nur für Admin)
@bp.route("/managers-support", methods=["GET"])
@jwt_required()
def get_managers_and_support():
    """Gibt alle Nutzer mit Rolle 'Manager' oder 'Customer Support' zurück (nur für Admins)"""
    current_user = get_current_user()
    if not current_user or current_user.get("RolleID") != 2:  # 2 = Admin
        return jsonify({"msg": "Unauthorized"}), 403

    users = UserOps.get_users_by_role_bedeutung(["Manager", "Customer Support"])
    user_list = []
    for user in users:
        user_data = user.copy()
        user_data.pop("PasswordHash", None)
        user_list.append(user_data)
    return jsonify(user_list), 200

# Route 2: Alle Nutzer mit Rolle "User" (nur für Manager oder Customer Support)
@bp.route("/users", methods=["GET"])
@jwt_required()
def get_users_for_manager_support():
    """Gibt alle Nutzer mit Rolle 'User' zurück (nur für Manager oder Customer Support)"""
    current_user = get_current_user()
    # Hole die Rollenbezeichnung des aktuellen Nutzers
    rolle_bedeutung = UserOps.get_role_bedeutung_by_id(current_user.get("RolleID"))
    if rolle_bedeutung not in ["Manager", "Customer Support"]:
        return jsonify({"msg": "Unauthorized"}), 403

    users = UserOps.get_users_by_role_bedeutung(["User"])
    user_list = []
    for user in users:
        user_data = user.copy()
        user_data.pop("PasswordHash", None)
        user_list.append(user_data)
    return jsonify(user_list), 200

# Route 3: Nutzer aktualisieren
@bp.route("/<int:user_id>", methods=["PUT"])
@jwt_required()
def update_user(user_id):
    """
    Aktualisiert einen Nutzer anhand der user_id.
    Erwartet ein JSON mit den zu ändernden Feldern.
    """
    data = request.get_json()
    if not UserOps.get_user_by_id(user_id):
        return jsonify({"error": "Not found"}), 404

    # Optional: Felder filtern, die nicht geändert werden dürfen
    data.pop("UserID", None)
    data.pop("PasswordHash", None)

    success = UserOps.update_user_fields(user_id, data)
    if success:
        return jsonify({"msg": "Nutzer updated"})
    else:
        return jsonify({"error": "Update fehlgeschlagen"}), 400