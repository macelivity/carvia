from app.db import get_db

class RechnungOps:
    @staticmethod
    def get_all():
        """Alle Rechnungen aus der Datenbank abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(rechnung_id):
        """Rechnung anhand der ID abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung WHERE RechnungID = ?", (rechnung_id,)).fetchone()
        return dict(result) if result else None
    
    @staticmethod
    def create(reservierung_id, user_id, fahrzeug_id, preis, bezahlt, austellungsdatum):
        """Neue Rechnung anlegen"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Rechnung (ReservierungID, UserID, FahrzeugID, Preis, Bezahlt, Austellungsdatum)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (reservierung_id, user_id, fahrzeug_id, preis, bezahlt, austellungsdatum))
            rechnung_id = cursor.lastrowid
            conn.commit()
            return rechnung_id

    @staticmethod
    def update(rechnung_id, reservierung_id, user_id, fahrzeug_id, preis, bezahlt, austellungsdatum):
        """Rechnung aktualisieren"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Rechnung
                SET ReservierungID = ?, UserID = ?, FahrzeugID = ?, Preis = ?, Bezahlt = ?, Austellungsdatum = ?
                WHERE RechnungID = ?
            """, (reservierung_id, user_id, fahrzeug_id, preis, bezahlt, austellungsdatum, rechnung_id))
            conn.commit()

    @staticmethod
    def delete(rechnung_id):
        """Rechnung anhand der ID löschen"""
        with get_db() as conn:
            conn.execute("DELETE FROM Rechnung WHERE RechnungID = ?", (rechnung_id,))
            conn.commit()
    
    @staticmethod
    def get_by_reservierung_id(reservierung_id):
        """Rechnung zu einer bestimmten Reservierung abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung WHERE ReservierungID = ?", (reservierung_id,)).fetchone()
        return dict(result) if result else None
    
    @staticmethod
    def get_by_fahrzeug_id(fahrzeug_id):
        """Alle Rechnungen für ein bestimmtes Fahrzeug abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Rechnung WHERE FahrzeugID = ?", (fahrzeug_id,)).fetchall()
        return [dict(row) for row in result]
