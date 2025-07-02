from app.db import get_db
from app.models.rolle_ops import RolleOps
from flask_jwt_extended import jwt_required
import bcrypt
from datetime import date

class UserOps:
    @staticmethod
    def create_user(username, password, rolle_id, email, vorname, nachname, geburtsdatum, 
                   fuehrerschein=None, iban=None, bic=None, hausnummer="", plz="", ort="", strasse="", angenommen=False):
        """Erstellt einen neuen Nutzer mit gehashtem Passwort"""
        db = get_db()
        
        # Hash the password
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
        """Akzeptiert einen Nutzer"""
        db = get_db()
        with db:
            db.execute("UPDATE Nutzer SET Angenommen = 1 WHERE UserID = ?", (user_id,))
            db.commit()

    @staticmethod
    def get_user_by_username(username):
        """Holt einen Nutzer anhand des Nutzernamens"""
        db = get_db()
        user = db.execute("SELECT * FROM Nutzer WHERE Username = ?", (username,)).fetchone()
        return dict(user) if user else None

    @staticmethod
    def get_user_by_id(user_id):
        """Holt einen Nutzer anhand der ID"""
        db = get_db()
        user = db.execute("SELECT * FROM Nutzer WHERE UserID = ?", (user_id,)).fetchone()
        return dict(user) if user else None

    @staticmethod
    def get_all_users():
        """Holt alle Nutzer aus der Datenbank"""
        db = get_db()
        result = db.execute("SELECT * FROM Nutzer").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_all_not_approved_users():
        """Holt alle nicht akzeptierten Nutzer aus der Datenbank"""
        db = get_db()
        result = db.execute("SELECT * FROM Nutzer WHERE Angenommen = 0").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def check_password(hashed_password, plain_password):
        """Überprüft ein Passwort gegen den Hash"""
        return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

    @staticmethod
    def update_user(user_id, **kwargs):
        """Aktualisiert Nutzerdaten"""
        db = get_db()
        
        # Build dynamic update query
        fields = []
        values = []
        for key, value in kwargs.items():
            if key == 'password':
                # Hash new password
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
        """Löscht einen Nutzer"""
        db = get_db()
        with db:
            db.execute("DELETE FROM Nutzer WHERE UserID = ?", (user_id,))
            db.commit()

    @staticmethod
    def username_exists(username):
        """Überprüft, ob ein Nutzername bereits existiert"""
        db = get_db()
        user = db.execute("SELECT UserID FROM Nutzer WHERE Username = ?", (username,)).fetchone()
        return user is not None#
    

    @staticmethod
    @jwt_required()
    def is_authorized(user_id, accepted_roles):
        role_entry = RolleOps.get_by_user_id(user_id)
        return role_entry and role_entry['Bedeutung'] in accepted_roles