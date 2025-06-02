from app.db import get_db

class SchadenOps:
    @staticmethod
    def get_all():
        """Holt alle Schäden aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Schaden").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(schaden_id):
        """Holt einen Schaden nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Schaden WHERE SchadenID = ?", (schaden_id,)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def create(fahrzeug_id, beschreibung):
        """Erstellt einen neuen Schaden"""
        with get_db() as conn:
            conn.execute("""
                INSERT INTO Schaden (FahrzeugID, Beschreibung)
                VALUES (?, ?)
            """, (fahrzeug_id, beschreibung))
            conn.commit()

    @staticmethod
    def update(schaden_id, fahrzeug_id, beschreibung):
        """Aktualisiert einen Schaden"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Schaden
                SET FahrzeugID = ?, Beschreibung = ?
                WHERE SchadenID = ?
            """, (fahrzeug_id, beschreibung, schaden_id))
            conn.commit()

    @staticmethod
    def delete(schaden_id):
        """Löscht einen Schaden"""
        with get_db() as conn:
            conn.execute("DELETE FROM Schaden WHERE SchadenID = ?", (schaden_id,))
            conn.commit()
