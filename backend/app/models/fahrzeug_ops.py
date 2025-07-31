from datetime import datetime, timedelta
from app.db import get_db
from app.models.geodatum_ops import GeodatumOps

COMPANY_ABREVIATIONS = {
    "VW": "Volkswagen",
    "Mercedes": "Mercedes-Benz"
}

class FahrzeugOps:
    @staticmethod
    def get_all():
        """Alle Fahrzeuge aus der Datenbank abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Fahrzeug").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(fahrzeug_id):
        """Fahrzeug anhand der ID abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Fahrzeug WHERE FahrzeugID = ?", (fahrzeug_id,)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def create(modell_id, kennzeichen, reperaturzustand, aktiv, reifen, kilometerstand, letzter_service, tuev_datum, erstzulassungs_datum):
        """Neues Fahrzeug anlegen"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Fahrzeug (ModellID, Kennzeichen, Reperaturzustand, Aktiv, Reifen, Kilometerstand, LetzterService, TuevDatum, ErstzulassungsDatum)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (modell_id, kennzeichen, reperaturzustand, aktiv, reifen, kilometerstand, letzter_service, tuev_datum, erstzulassungs_datum))
            fahrzeug_id = cursor.lastrowid
            conn.commit()
            return fahrzeug_id

    @staticmethod
    def update(fahrzeug_id, modell_id, kennzeichen, reperaturzustand, aktiv, reifen, kilometerstand, letzter_service, tuev_datum, erstzulassungs_datum):
        """Fahrzeugdaten aktualisieren"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Fahrzeug
                SET ModellID = ?, Kennzeichen = ?, Reperaturzustand = ?, Aktiv = ?, Reifen = ?, Kilometerstand = ?, LetzterService = ?, TuevDatum = ?, ErstzulassungsDatum = ?
                WHERE FahrzeugID = ?
            """, (modell_id, kennzeichen, reperaturzustand, aktiv, reifen, kilometerstand, letzter_service, tuev_datum, erstzulassungs_datum, fahrzeug_id))
            conn.commit()

    @staticmethod
    def delete(fahrzeug_id):
        """Fahrzeug löschen"""
        with get_db() as conn:
            conn.execute("DELETE FROM Fahrzeug WHERE FahrzeugID = ?", (fahrzeug_id,))  

    @staticmethod
    def get_all_detailed():
        """Alle Fahrzeuge mit Modellinformationen abrufen"""
        with get_db() as conn:
            result = conn.execute("""
                SELECT Fahrzeug.*, Modell.Hersteller, Modell.ModellName, Modell.Hersteller, Modell.Fahrzeugtyp, Modell.Getriebeart, Modell.Kraftstoffart, Modell.Leistung, Modell.Türen, Modell.Sitze, Modell.Kofferraumvolumen, Modell.Stundenpreis
                FROM Fahrzeug
                JOIN Modell ON Fahrzeug.ModellID = Modell.ModellID
            """).fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id_detailed(fahrzeug_id):
        """Fahrzeug mit Modellinformationen anhand der ID abrufen"""
        with get_db() as conn:
            result = conn.execute("""
                SELECT Fahrzeug.*, Modell.Hersteller, Modell.ModellName, Modell.Fahrzeugtyp, Modell.Getriebeart, Modell.Kraftstoffart, Modell.Leistung, Modell.Türen, Modell.Sitze, Modell.Kofferraumvolumen, Modell.Stundenpreis
                FROM Fahrzeug
                JOIN Modell ON Fahrzeug.ModellID = Modell.ModellID
                WHERE FahrzeugID = ?
            """, (fahrzeug_id,)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def is_booked_at_time(fahrzeug_id, time):
        """Prüft, ob ein Fahrzeug zu einem bestimmten Zeitpunkt reserviert ist"""
        with get_db() as conn:
            query = """
                SELECT * FROM Reservierung
                WHERE FahrzeugID = ? AND (
                    StartDatum < ? AND EndDatum > ?
                )
            """
            result = conn.execute(query, (fahrzeug_id, time, time)).fetchone()
        return result is not None

    @staticmethod
    def get_filtered(start_datum, end_datum, hersteller=None, fahrzeugtyp=None, getriebeart=None, sitze=None, stundenpreis=None, modell=None):
        """Filtert Fahrzeuge nach Kriterien und Verfügbarkeit"""
        query = "SELECT * FROM Fahrzeug JOIN Modell ON Fahrzeug.ModellID = Modell.ModellID"

        # Filterkriterien dynamisch hinzufügen
        if any([hersteller, fahrzeugtyp, getriebeart, sitze, stundenpreis]):
            query += " WHERE "
            if hersteller:
                # Einheitliche Herstellerbezeichnung
                if hersteller in COMPANY_ABREVIATIONS:
                    hersteller = COMPANY_ABREVIATIONS[hersteller]
                query += f"Modell.Hersteller = '{hersteller}' AND "
            if fahrzeugtyp:
                query += f"Modell.Fahrzeugtyp = '{fahrzeugtyp}' AND "
            if getriebeart:
                query += f"Modell.Getriebeart = '{getriebeart}' AND "
            if sitze:
                query += f"Modell.Sitze >= '{sitze}' AND "
            if stundenpreis:
                query += f"Modell.Stundenpreis <= '{stundenpreis}' AND "
            query = query.rstrip(" AND ")
        
        with get_db() as conn:
            vehicles = [dict(row) for row in conn.execute(query).fetchall()]
            available_vehicles = []

            for vehicle in vehicles:
                # Reservierungen für das Fahrzeug abrufen
                query = f"SELECT * FROM Reservierung JOIN Fahrzeug ON Reservierung.FahrzeugID = {vehicle['FahrzeugID']} ORDER BY Reservierung.StartDatum ASC"
                reservations = [dict(row) for row in conn.execute(query).fetchall()]
                is_available = True
                for reservation in reservations:
                    # Prüfen, ob das Fahrzeug im gewünschten Zeitraum reserviert ist
                    if ((start_datum < reservation['EndDatum'] and start_datum > reservation['StartDatum']) or (end_datum > reservation['StartDatum'] and end_datum < reservation['EndDatum'])):
                        is_available = False
                        break
                if is_available:
                    available_vehicles.append(vehicle)

            return available_vehicles

    @staticmethod
    def get_target_destination(fahrzeug_id, date):
        """Erwarteten Standort eines Fahrzeugs zu einem bestimmten Datum ermitteln"""
        # Wenn das Datum im aktuellen Zeitfenster liegt, aktuelle Geodaten verwenden
        if (datetime.now() - timedelta(minutes=15)) <= datetime.fromisoformat(date) <= (datetime.now() + timedelta(minutes=30)):
            geolocation = GeodatumOps.get_location_of_vehicle(fahrzeug_id)
            if not geolocation:
                return {"type": "None"}
            return {"type": "geolocation", "longitude": geolocation['Longitude'], "latitude": geolocation['Latitude']}

        with get_db() as conn:
            result = conn.execute("""
                SELECT RueckgabePlz, Rueckgabeort FROM Reservierung
                WHERE FahrzeugID = ? AND EndDatum <= ?
                ORDER BY EndDatum DESC
            """, (fahrzeug_id, date)).fetchone()
        
        if result:
            # Rückgabeort und PLZ aus letzter Reservierung zurückgeben
            return {"type": "plz", "plz": result['RueckgabePlz'], "ort": result['Rueckgabeort']}
        else:
            geolocation = GeodatumOps.get_location_of_vehicle(fahrzeug_id)
            if not geolocation:
                return {"type": "None"}
            return {"type": "geolocation", "longitude": geolocation['Longitude'], "latitude": geolocation['Latitude']}