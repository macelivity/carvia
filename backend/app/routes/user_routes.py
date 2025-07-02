from flask import Blueprint, request, jsonify
from app.models.user_ops import UserOps
from app.models.reservierung_ops import ReservierungOps

bp = Blueprint("user", __name__, url_prefix="/user")

@bp.route("/search", methods=["GET"])
def search_users():
    vorname = request.args.get("vorname", "")
    nachname = request.args.get("nachname", "")
    if not vorname and not nachname:
        return jsonify([])
    users = UserOps.search_users(vorname, nachname)
    return jsonify(users)

@bp.route("/<int:user_id>/reservations", methods=["GET"])
def get_user_reservations(user_id):
    # Holt alle Reservierungen für einen User
    reservierungen = ReservierungOps.get_by_user_id(user_id)
    return jsonify(reservierungen)

@bp.route("/users", methods=["GET"])
def get_all_users():
    """Gibt eine Liste aller Nutzer zurück (geschützt)"""
    # Hier könnte eine Rollenprüfung hinzugefügt werden, z.B. nur für Admins
    # current_user_id = get_jwt_identity()
    # current_user = UserOps.get_user_by_id(int(current_user_id))
    # if not current_user or current_user['RolleID'] != 2: # Annahme: RolleID 2 = Admin
    #     return jsonify({"msg": "Unauthorized"}), 403

    try:
        users = UserOps.get_all_users()  # Annahme: Diese Methode existiert in UserOps
        
        # Entferne sensible Informationen und bereite die Ausgabe vor
        user_list = []
        for user in users:
            user_data = user.copy()
            user_data.pop("PasswordHash", None) # Passwort-Hash entfernen
            user_list.append(user_data)
            
        return jsonify(user_list), 200
    except Exception as e:
        return jsonify({"msg": "Error retrieving users", "error": str(e)}), 500