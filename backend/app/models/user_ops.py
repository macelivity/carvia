from app.db import get_db
from app.models.rolle_ops import RolleOps
from flask_jwt_extended import jwt_required
import bcrypt
from datetime import date

class UserOps:
    @staticmethod
    def create_user(username, password, rolle_id, email, vorname, nachname, geburtsdatum, 
                   fuehrerschein=None, iban=None, bic=None, hausnummer="", plz="", ort="", strasse="", angenommen=False):
        """Neuen Nutzer mit gehashtem Passwort anlegen"""
        db = get_db()
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        with db:
            cursor = db.execute("""
                INSERT INTO Nutzer (Username, PasswordHash, RolleID, Vorname, Nachname, Email,
                                  Geburtsdatum, BeitrittsDatum, Führerschein, IBAN, BIC, 
                                  HausNummer, PLZ, Ort, Strasse, Angenommen)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (username, hashed_password.decode('utf-8'), rolle_id, vorname, nachname, email,
                  geburtsdatum, date.today().isoformat(), fuehrerschein, iban, bic,
                  hausnummer, plz, ort, strasse, angenommen))
            user_id = cursor.lastrowid
            db.commit()
            return user_id
    
    @staticmethod
    def approve_user(user_id):
        """Nutzer als akzeptiert markieren"""
        db = get_db()
        with db:
            db.execute("UPDATE Nutzer SET Angenommen = 1 WHERE UserID = ?", (user_id,))
            db.commit()

    @staticmethod
    def get_user_by_username(username):
        """Nutzer anhand des Nutzernamens abrufen"""
        db = get_db()
        user = db.execute("SELECT * FROM Nutzer WHERE Username = ?", (username,)).fetchone()
        return dict(user) if user else None

    @staticmethod
    def get_user_by_id(user_id):
        """Nutzer anhand der ID abrufen"""
        db = get_db()
        user = db.execute("SELECT * FROM Nutzer WHERE UserID = ?", (user_id,)).fetchone()
        return dict(user) if user else None

    @staticmethod
    def get_all_users():
        """Alle Nutzer aus der Datenbank abrufen"""
        db = get_db()
        result = db.execute("SELECT * FROM Nutzer").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def check_password(hashed_password, plain_password):
        """Passwort gegen Hash prüfen"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    @staticmethod
    def update_user(user_id, **kwargs):
        """Nutzerdaten aktualisieren (dynamisch)"""
        db = get_db()
        fields = []
        values = []
        for key, value in kwargs.items():
            if key == 'password':
                hashed_password = bcrypt.hashpw(value.encode('utf-8'), bcrypt.gensalt())
                fields.append("PasswordHash = ?")
                values.append(hashed_password.decode('utf-8'))
            elif key in ['Username', 'RolleID', 'Vorname', 'Nachname', 'Email', 'Geburtsdatum', 
                        'Führerschein', 'IBAN', 'BIC', 'HausNummer', 'PLZ', 'Ort', 'Strasse']:
                fields.append(f"{key} = ?")
                values.append(value)
        if not fields:
            return False
        values.append(user_id)
        query = f"UPDATE Nutzer SET {', '.join(fields)} WHERE UserID = ?"
        with db:
            db.execute(query, values)
            db.commit()
        return True

    @staticmethod
    def delete_user(user_id):
        """Nutzer anhand der ID löschen"""
        db = get_db()
        with db:
            db.execute("DELETE FROM Nutzer WHERE UserID = ?", (user_id,))
            db.commit()

    @staticmethod
    def username_exists(username):
        """Prüfen, ob ein Nutzername bereits existiert"""
        db = get_db()
        user = db.execute("SELECT UserID FROM Nutzer WHERE Username = ?", (username,)).fetchone()
        return user is not None

    @staticmethod
    def search_users(vorname, nachname):
        """Nutzer anhand von Vor- und Nachname suchen (LIKE, beide optional)"""
        db = get_db()
        query = "SELECT * FROM Nutzer WHERE 1=1"
        params = []
        if vorname:
            query += " AND Vorname LIKE ?"
            params.append(f"%{vorname}%")
        if nachname:
            query += " AND Nachname LIKE ?"
            params.append(f"%{nachname}%")
        users = db.execute(query, params).fetchall()
        return [dict(row) for row in users]
    
    @staticmethod
    @jwt_required()
    def is_authorized(jwt_identity, accepted_roles):
        """Prüft, ob ein Nutzer eine akzeptierte Rolle hat (JWT)"""
        if not jwt_identity:
            return False
        role_entry = RolleOps.get_by_user_id(int(jwt_identity))
        return role_entry and role_entry['Bedeutung'] in accepted_roles

    @staticmethod
    def identitycheck(user_id, id_data, name):
        """Setzt den Identitätscheck für einen Nutzer auf gültig"""
        db = get_db()
        with db:
            db.execute("UPDATE Nutzer SET identitycheck_valid = 1 WHERE UserID = ?", (user_id,))
            db.commit()
        return True

    @staticmethod
    def licencecheck(user_id, license_data):
        """Setzt den Führerscheincheck für einen Nutzer auf gültig"""
        db = get_db()
        with db:
            db.execute("UPDATE Nutzer SET licencecheck_valid = 1 WHERE UserID = ?", (user_id,))
            db.commit()
        return True

    @staticmethod
    def creditworthycheck(user_id, name, bic, iban):
        """Setzt den Bonitätscheck für einen Nutzer auf gültig"""
        db = get_db()
        with db:
            db.execute("UPDATE Nutzer SET creditworthycheck_valid = 1 WHERE UserID = ?", (user_id,))
            db.commit()
        return True

    @staticmethod
    def get_pending_applications():
        """Alle offenen Nutzeranträge abrufen"""
        db = get_db()
        result = db.execute("SELECT * FROM Nutzer WHERE Angenommen = 0").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def set_application_status(user_id, accepted):
        """Status eines Nutzerantrags setzen (angenommen/abgelehnt)"""
        db = get_db()
        with db:
            if accepted:
                db.execute("UPDATE Nutzer SET Angenommen = 1 WHERE UserID = ?", (user_id,))
            else:
                db.execute("DELETE FROM Nutzer WHERE UserID = ?", (user_id,))
            db.commit()
