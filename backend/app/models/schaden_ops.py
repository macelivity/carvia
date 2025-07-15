from app.db import get_db

class SchadenOps:
    @staticmethod
    def get_all():
        """Alle Schäden aus der Datenbank abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Schaden").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(schaden_id):
        """Schaden anhand der ID abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Schaden WHERE SchadenID = ?", (schaden_id,)).fetchone()
        return dict(result) if result else None
    
    @staticmethod
    def create(fahrzeug_id, beschreibung):
        """Neuen Schaden anlegen"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Schaden (FahrzeugID, Beschreibung)
                VALUES (?, ?)
            """, (fahrzeug_id, beschreibung))
            schaden_id = cursor.lastrowid
            conn.commit()
            return schaden_id

    @staticmethod
    def update(schaden_id, fahrzeug_id, beschreibung):
        """Schaden aktualisieren"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Schaden
                SET FahrzeugID = ?, Beschreibung = ?
                WHERE SchadenID = ?
            """, (fahrzeug_id, beschreibung, schaden_id))
            conn.commit()

    @staticmethod
    def delete(schaden_id):
        """Schaden anhand der ID löschen"""
        with get_db() as conn:
            conn.execute("DELETE FROM Schaden WHERE SchadenID = ?", (schaden_id,))
            conn.commit()
