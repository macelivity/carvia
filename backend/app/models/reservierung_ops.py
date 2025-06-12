from app.db import get_db

class ReservierungOps:
    @staticmethod
    def get_all():
        """Holt alle Reservierungen aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(reservierung_id):
        """Holt eine Reservierung nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,)).fetchone()
        return dict(result) if result else None
        
    @staticmethod
    def create(fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum):
        """Erstellt eine neue Reservierung"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Reservierung (FahrzeugID, UserID, RechnungID, TarifID, StartDatum, EndDatum)
                VALUES (?, ?, ?, ?, ?, ?)
            """, (fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum))
            reservierung_id = cursor.lastrowid
            conn.commit()
            return reservierung_id

    @staticmethod
    def update(reservierung_id, fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum):
        """Aktualisiert eine Reservierung"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Reservierung
                SET FahrzeugID = ?, UserID = ?, RechnungID = ?, TarifID = ?, StartDatum = ?, EndDatum = ?
                WHERE ReservierungID = ?
            """, (fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum, reservierung_id))
            conn.commit()

    @staticmethod
    def delete(reservierung_id):
        """Löscht eine Reservierung"""
        with get_db() as conn:
            conn.execute("DELETE FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,))
            conn.commit()
            
    @staticmethod
    def get_by_user_id(user_id):
        """Holt alle Reservierungen für einen Benutzer"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE UserID = ?", (user_id,)).fetchall()
        return [dict(row) for row in result]
        
    @staticmethod
    def get_by_fahrzeug_id(fahrzeug_id):
        """Holt alle Reservierungen für ein Fahrzeug"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE FahrzeugID = ?", (fahrzeug_id,)).fetchall()
        return [dict(row) for row in result]
