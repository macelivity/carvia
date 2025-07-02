import sqlite3
from app.db import get_db 
from datetime import datetime

class ReservierungOps:

    @staticmethod
    def get_all():
        """Holt alle Reservierungen aus der Datenbank."""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def create(user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id, abholort, abholplz, rueckgabeort, rueckgabeplz):
        """Erstellt eine neue Reservierung."""
        try:
            with get_db() as conn:
                cursor = conn.execute("""
                    INSERT INTO Reservierung (UserID, FahrzeugID, StartDatum, EndDatum, RechnungID, TarifID, Abholort, AbholPlz, Rueckgabeort, RueckgabePlz)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id, abholort, abholplz, rueckgabeort, rueckgabeplz))
                reservierungs_id = cursor.lastrowid
                conn.commit()
                return reservierungs_id
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Erstellen der Reservierung: {e}")
            return None
        except Exception as e:
            print(f"Allgemeiner Fehler beim Erstellen der Reservierung: {e}")
            return None

    @staticmethod
    def update(reservierung_id, fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum, abholort, abholplz, rueckgabeort, rueckgabeplz):
        """Aktualisiert eine Reservierung"""
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
        """Löscht eine Reservierung"""
        with get_db() as conn:
            cursor = conn.execute("DELETE FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,))
            conn.commit()
            return cursor.rowcount if cursor.rowcount > 0 else None
            
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
    
    @staticmethod
    def get_by_reservation_id(reservierung_id):
        """Holt eine Reservierung anhand der ReservierungID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Reservierung WHERE ReservierungID = ?", (reservierung_id,)).fetchone()
        return dict(result) if result else None
