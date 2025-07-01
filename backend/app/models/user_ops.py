from app.db import get_db
import bcrypt
from datetime import date

class UserOps:
    @staticmethod
    def create_user(username, password, rolle_id, vorname, nachname, geburtsdatum, 
                   fuehrerschein=None, iban=None, bic=None, hausnummer="", plz="", ort="", strasse=""):
        """Erstellt einen neuen Nutzer mit gehashtem Passwort"""
        db = get_db()
        
        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
        
        with db:
            cursor = db.execute("""
                INSERT INTO Nutzer (Username, PasswordHash, RolleID, Vorname, Nachname, 
                                  Geburtsdatum, BeitrittsDatum, Führerschein, IBAN, BIC, 
                                  HausNummer, PLZ, Ort, Strasse)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (username, hashed_password.decode('utf-8'), rolle_id, vorname, nachname, 
                  geburtsdatum, date.today().isoformat(), fuehrerschein, iban, bic, 
                  hausnummer, plz, ort, strasse))
            user_id = cursor.lastrowid
            db.commit()
            return user_id

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
            elif key in ['Username', 'RolleID', 'Vorname', 'Nachname', 'Geburtsdatum', 
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
    def update_user_fields(user_id, fields_dict):
        """
        Aktualisiert beliebige Felder eines Nutzers anhand eines Dictionarys.
        :param user_id: Die ID des Nutzers
        :param fields_dict: Dictionary mit zu ändernden Feldern
        :return: True bei Erfolg, False sonst
        """
        if not fields_dict:
            return False

        db = get_db()
        set_clauses = []
        values = []
        for key, value in fields_dict.items():
            if key == "password":
                # Passwort muss gehasht werden
                import bcrypt
                hashed_password = bcrypt.hashpw(value.encode('utf-8'), bcrypt.gensalt())
                set_clauses.append("PasswordHash = ?")
                values.append(hashed_password.decode('utf-8'))
            elif key in ['Username', 'RolleID', 'Vorname', 'Nachname', 'Geburtsdatum', 
                         'Führerschein', 'IBAN', 'BIC', 'HausNummer', 'PLZ', 'Ort', 'Strasse']:
                set_clauses.append(f"{key} = ?")
                values.append(value)
        if not set_clauses:
            return False

        values.append(user_id)
        query = f"UPDATE Nutzer SET {', '.join(set_clauses)} WHERE UserID = ?"
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
        return user is not None

    @staticmethod
    def get_users_by_role_bedeutung(bedeutungen):
        """
        Gibt alle Nutzer zurück, deren Rolle.Bedeutung in der übergebenen Liste ist.
        :param bedeutungen: Liste von Rollenbezeichnungen (z.B. ["Manager", "Customer Support"])
        :return: Liste von Nutzer-Dictionaries
        """
        db = get_db()
        # Hole alle Nutzer, deren RolleID zu einer Rolle mit passender Bedeutung gehört
        query = """
            SELECT n.*
            FROM Nutzer n
            INNER JOIN Rolle r ON n.RolleID = r.RolleID
            WHERE r.Bedeutung IN ({})
        """.format(','.join(['?'] * len(bedeutungen)))
        result = db.execute(query, bedeutungen).fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_role_bedeutung_by_id(rolle_id):
        """
        Gibt die Rollenbezeichnung (Bedeutung) zu einer RolleID zurück.
        :param rolle_id: Die ID der Rolle
        :return: String mit der Rollenbezeichnung oder None
        """
        db = get_db()
        row = db.execute("SELECT Bedeutung FROM Rolle WHERE RolleID = ?", (rolle_id,)).fetchone()
        return row["Bedeutung"] if row else None