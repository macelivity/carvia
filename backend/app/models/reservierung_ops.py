from app.db import get_db

class ReservierungOps:
    @staticmethod
    def get_all():
        """Alle Reservierungen aus der Datenbank abrufen."""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def create(user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id, abholort, abholplz, rueckgabeort, rueckgabeplz):
        """Neue Reservierung anlegen."""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Reservierung (UserID, FahrzeugID, StartDatum, EndDatum, RechnungID, TarifID, Abholort, AbholPlz, Rueckgabeort, RueckgabePlz)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id, abholort, abholplz, rueckgabeort, rueckgabeplz))
            reservierungs_id = cursor.lastrowid
            conn.commit()
            return reservierungs_id

    @staticmethod
    def update(reservierung_id, fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum, abholort, abholplz, rueckgabeort, rueckgabeplz):
        """Reservierung aktualisieren."""
        with get_db() as conn:
            cursor = conn.execute("""
                UPDATE Reservierung
                SET FahrzeugID = ?, UserID = ?, RechnungID = ?, TarifID = ?, StartDatum = ?, EndDatum = ?, Abholort = ?, AbholPlz = ?, Rueckgabeort = ?, RueckgabePlz = ?
                WHERE ReservierungID = ?
            """, (fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum, abholort, abholplz, rueckgabeort, rueckgabeplz, reservierung_id))
            conn.commit()
            return cursor.rowcount if cursor.rowcount > 0 else None

    @staticmethod
    def delete(reservierung_id):
        """Reservierung anhand der ID löschen."""
        with get_db() as conn:
            cursor = conn.execute("DELETE FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,))
            conn.commit()
            return cursor.rowcount if cursor.rowcount > 0 else None

    @staticmethod
    def get_by_id(reservierung_id):
        """Reservierung anhand der ID abrufen."""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def get_by_user_id(user_id):
        """Alle Reservierungen für einen bestimmten Benutzer abrufen."""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE UserID = ?", (user_id,)).fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_fahrzeug_id(fahrzeug_id):
        """Alle Reservierungen für ein bestimmtes Fahrzeug abrufen."""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE FahrzeugID = ?", (fahrzeug_id,)).fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_reservation_id(reservierung_id):
        """Reservierung anhand der ReservierungID abrufen (Alias für get_by_id)."""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,)).fetchone()
        return dict(result) if result else None
