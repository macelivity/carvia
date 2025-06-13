from app.db import get_db

class RechnungOps:
    @staticmethod
    def get_all():
        """Holt alle Rechnungen aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(rechnung_id):
        """Holt eine Rechnung nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung WHERE RechnungID = ?", (rechnung_id,)).fetchone()
        return dict(result) if result else None
        
    @staticmethod
    def create(fahrzeug_id, bezahlt, austellungsdatum):
        """Erstellt eine neue Rechnung"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Rechnung (FahrzeugID, Bezahlt, Austellungsdatum)
                VALUES (?, ?, ?)
            """, (fahrzeug_id, bezahlt, austellungsdatum))
            rechnung_id = cursor.lastrowid
            conn.commit()
            return rechnung_id

    @staticmethod
    def update(rechnung_id, fahrzeug_id, bezahlt, austellungsdatum):
        """Aktualisiert eine Rechnung"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Rechnung
                SET FahrzeugID = ?, Bezahlt = ?, Austellungsdatum = ?
                WHERE RechnungID = ?
            """, (fahrzeug_id, bezahlt, austellungsdatum, rechnung_id))
            conn.commit()

    @staticmethod
    def delete(rechnung_id):
        """Löscht eine Rechnung"""
        with get_db() as conn:
            conn.execute("DELETE FROM Rechnung WHERE RechnungID = ?", (rechnung_id,))
            conn.commit()
            
    @staticmethod
    def get_by_fahrzeug_id(fahrzeug_id):
        """Holt alle Rechnungen für ein Fahrzeug"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung WHERE FahrzeugID = ?", (fahrzeug_id,)).fetchall()
        return [dict(row) for row in result]
