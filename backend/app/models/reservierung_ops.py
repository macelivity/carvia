<<<<<<< HEAD
import sqlite3
from app.db import get_db # Korrigierter Importpfad
from datetime import datetime

class ReservierungOps:
    @staticmethod
    def create(user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id):
        """Erstellt eine neue Reservierung."""
        try:
            with get_db() as conn:
                cursor = conn.execute("""
                    INSERT INTO Reservierung (UserID, FahrzeugID, StartDatum, EndDatum, RechnungID, TarifID)
                    VALUES (?, ?, ?, ?, ?, ?)
                """, (user_id, fahrzeug_id, start_datum, end_datum, rechnung_id, tarif_id))
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
    def get_by_id(reservierungs_id):
        """Holt eine Reservierung anhand ihrer ID."""
        try:
            with get_db() as conn:
                result = conn.execute("SELECT * FROM Reservierung WHERE ReservierungID = ?", (reservierungs_id,)).fetchone()
            return dict(result) if result else None
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Abrufen der Reservierung (ID: {reservierungs_id}): {e}")
            return None

    @staticmethod
    def get_all():
        """Holt alle Reservierungen aus der Datenbank."""
        try:
            with get_db() as conn:
                # Sortierung nach StartDatum, da Erstellungsdatum nicht mehr existiert
                results = conn.execute("SELECT * FROM Reservierung ORDER BY StartDatum DESC").fetchall()
            return [dict(row) for row in results]
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Abrufen aller Reservierungen: {e}")
            return []

    @staticmethod
    def get_by_user_id(user_id):
        """Holt alle Reservierungen für einen bestimmten Nutzer."""
        try:
            with get_db() as conn:
                results = conn.execute("SELECT * FROM Reservierung WHERE UserID = ? ORDER BY StartDatum DESC", (user_id,)).fetchall()
            return [dict(row) for row in results]
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Abrufen der Reservierungen für Nutzer (ID: {user_id}): {e}")
            return []

    @staticmethod
    def get_by_fahrzeug_id(fahrzeug_id):
        """Holt alle Reservierungen für ein bestimmtes Fahrzeug."""
        try:
            with get_db() as conn:
                results = conn.execute("SELECT * FROM Reservierung WHERE FahrzeugID = ? ORDER BY StartDatum DESC", (fahrzeug_id,)).fetchall()
            return [dict(row) for row in results]
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Abrufen der Reservierungen für Fahrzeug (ID: {fahrzeug_id}): {e}")
            return []

    @staticmethod
    def update(reservierungs_id, user_id=None, fahrzeug_id=None, start_datum=None, end_datum=None, rechnung_id=None, tarif_id=None):
        """Aktualisiert eine bestehende Reservierung. Nur die übergebenen Felder werden geändert."""
        fields_to_update = {}
        if user_id is not None:
            fields_to_update['UserID'] = user_id
        if fahrzeug_id is not None:
            fields_to_update['FahrzeugID'] = fahrzeug_id
        if start_datum is not None:
            fields_to_update['StartDatum'] = start_datum
        if end_datum is not None:
            fields_to_update['EndDatum'] = end_datum
        if rechnung_id is not None:
            fields_to_update['RechnungID'] = rechnung_id
        if tarif_id is not None:
            fields_to_update['TarifID'] = tarif_id

        if not fields_to_update:
            return False # Keine Felder zum Aktualisieren

        set_clause = ", ".join([f"{key} = ?" for key in fields_to_update])
        values = list(fields_to_update.values())
        values.append(reservierungs_id)

        try:
            with get_db() as conn:
                print(f"Update SQL: UPDATE Reservierung SET {set_clause} WHERE ReservierungID = ?", tuple(values))
                conn.execute(f"UPDATE Reservierung SET {set_clause} WHERE ReservierungID = ?", tuple(values))
                conn.commit()
                return True
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Aktualisieren der Reservierung (ID: {reservierungs_id}): {e}")
            return False

    @staticmethod
    def delete(reservierungs_id):
        """Löscht eine Reservierung anhand ihrer ID."""
        try:
            with get_db() as conn:
                conn.execute("DELETE FROM Reservierung WHERE ReservierungID = ?", (reservierungs_id,))
                conn.commit()
                return True
        except sqlite3.Error as e:
            print(f"Datenbankfehler beim Löschen der Reservierung (ID: {reservierungs_id}): {e}")
            return False

    @staticmethod
    def get_overlapping_reservations(fahrzeug_id, start_zeit, end_zeit, exclude_reservierungs_id=None):
        """
        Prüft auf überlappende Reservierungen für ein Fahrzeug in einem gegebenen Zeitraum.
        `exclude_reservierungs_id` kann verwendet werden, um eine bestimmte Reservierung
        (z.B. die aktuell bearbeitete) von der Prüfung auszuschließen.
        Die Spalte 'Status' existiert nicht mehr, daher wurde die Bedingung 'Status != "storniert"' entfernt.
        """
        try:
            with get_db() as conn:
                query = """
                    SELECT * FROM Reservierung
                    WHERE FahrzeugID = ?
                    AND (
                        (StartDatum < ? AND EndDatum > ?) OR -- Überlappt komplett
                        (StartDatum >= ? AND StartDatum < ?) OR -- Startet innerhalb
                        (EndDatum > ? AND EndDatum <= ?) OR -- Endet innerhalb
                        (StartDatum <= ? AND EndDatum >= ?) -- Umfasst den Zeitraum
                    )
                """
                # Parameter angepasst an StartDatum und EndDatum
                params = [fahrzeug_id, end_zeit, start_zeit, start_zeit, end_zeit, start_zeit, end_zeit, start_zeit, end_zeit]
                
                if exclude_reservierungs_id:
                    query += " AND ReservierungsID != ?"
                    params.append(exclude_reservierungs_id)
                
                results = conn.execute(query, tuple(params)).fetchall()
            return [dict(row) for row in results]
        except sqlite3.Error as e:
            print(f"Datenbankfehler bei der Prüfung auf überlappende Reservierungen: {e}")
            return []
=======
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
>>>>>>> develop
