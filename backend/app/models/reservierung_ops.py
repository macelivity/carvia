import sqlite3
from app.db import get_db 
from datetime import datetime

class ReservierungOps:
    @staticmethod
    def create(user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id, abholort, rueckgabeort):
        """Erstellt eine neue Reservierung."""
        try:
            with get_db() as conn:
                cursor = conn.execute("""
                    INSERT INTO Reservierung (UserID, FahrzeugID, StartDatum, EndDatum, RechnungID, TarifID, Abholort, Rueckgabeort)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id, abholort, rueckgabeort))
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
    def update(reservierung_id, fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum, abholort, rueckgabeort):
        """Aktualisiert eine Reservierung"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Reservierung
                SET FahrzeugID = ?, UserID = ?, RechnungID = ?, TarifID = ?, StartDatum = ?, EndDatum = ?, Abholort = ?, Rueckgabeort = ?
                WHERE ReservierungID = ?
            """, (fahrzeug_id, user_id, rechnung_id, tarif_id, start_datum, end_datum, abholort, rueckgabeort, reservierung_id))
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
