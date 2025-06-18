from app.db import get_db

class RolleOps:
    @staticmethod
    def get_all():
        """Holt alle Rollen aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rolle").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(rolle_id):
        """Holt eine Rolle nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rolle WHERE RolleID = ?", (rolle_id,)).fetchone()
        return dict(result) if result else None
        
    @staticmethod
    def get_by_user_id(user_id):
        """Holt die Rolle eines Nutzers anhand der UserID"""
        with get_db() as conn:
            result = conn.execute("""
                SELECT Rolle.*
                FROM Rolle
                JOIN Nutzer ON Rolle.RolleID = Nutzer.RolleID
                WHERE Nutzer.UserID = ?
            """, (user_id,)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def create(bedeutung):
        """Erstellt eine neue Rolle"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Rolle (Bedeutung)
                VALUES (?)
            """, (bedeutung,))
            rolle_id = cursor.lastrowid
            conn.commit()
            return rolle_id

    @staticmethod
    def update(rolle_id, bedeutung):
        """Aktualisiert eine Rolle"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Rolle
                SET Bedeutung = ?
                WHERE RolleID = ?
            """, (bedeutung, rolle_id))
            conn.commit()

    @staticmethod
    def delete(rolle_id):
        """Löscht eine Rolle"""
        with get_db() as conn:
            conn.execute("DELETE FROM Rolle WHERE RolleID = ?", (rolle_id,))
            conn.commit()
