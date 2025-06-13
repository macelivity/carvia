from app.db import get_db

class FahrzeugOps:
    @staticmethod
    def get_all():
        """Holt alle Fahrzeuge aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Fahrzeug").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(fahrzeug_id):
        """Holt ein Fahrzeug nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Fahrzeug WHERE FahrzeugID = ?", (fahrzeug_id,)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def create(modell_id, kennzeichen, reperaturzustand, aktiv, reifen, kilometerstand, letzter_service, tuev_datum, erstzulassungs_datum):
        """Erstellt ein neues Fahrzeug"""
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
        """Aktualisiert ein Fahrzeug"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Fahrzeug
                SET ModellID = ?, Kennzeichen = ?, Reperaturzustand = ?, Aktiv = ?, Reifen = ?, Kilometerstand = ?, LetzterService = ?, TuevDatum = ?, ErstzulassungsDatum = ?
                WHERE FahrzeugID = ?
            """, (modell_id, kennzeichen, reperaturzustand, aktiv, reifen, kilometerstand, letzter_service, tuev_datum, erstzulassungs_datum, fahrzeug_id))
            conn.commit()

    @staticmethod
    def delete(fahrzeug_id):
        """Löscht ein Fahrzeug"""
        with get_db() as conn:
            conn.execute("DELETE FROM Fahrzeug WHERE FahrzeugID = ?", (fahrzeug_id,))
            conn.commit()
 
    @staticmethod
    def get_filtered(start_datum, end_datum, hersteller=None, fahrzeugtyp=None, getriebeart=None, sitze=None, stundenpreis=None, abholort=None, rueckgabeort=None):
        query = "SELECT * FROM Fahrzeug JOIN Modell ON Fahrzeug.ModellID = Modell.ModellID"

        if any([hersteller, fahrzeugtyp, getriebeart, sitze, stundenpreis]):
            query += " WHERE "
            if hersteller:
                query += "Modell.Hersteller = '{}' AND ".format(hersteller)
            if fahrzeugtyp:
                query += "Modell.Fahrzeugtyp = '{}' AND ".format(fahrzeugtyp)
            if getriebeart:
                query += "Modell.Getriebeart = '{}' AND ".format(getriebeart)
            if sitze:
                query += "Modell.Sitze >= '{}' AND ".format(sitze)
            if stundenpreis:
                query += "Modell.Stundenpreis <= '{}' AND ".format(stundenpreis)
            query = query.rstrip(" AND ")
        
        with get_db() as conn:
            vehicles = [dict(row) for row in conn.execute(query).fetchall()]

            if not any([start_datum, end_datum, abholort, rueckgabeort]):
                return vehicles
            
            available_vehicles = []

            for vehicle in vehicles:
                query = "SELECT * FROM Reservierung JOIN Fahrzeug ON Reservierung.FahrzeugID = {} ORDER BY Reservierung.StartDatum ASC".format(vehicle['FahrzeugID'])
                reservations = [dict(row) for row in conn.execute(query).fetchall()]
                is_available = True
                for reservation in reservations:
                    if ((start_datum < reservation['EndDatum'] and start_datum > reservation['StartDatum']) or (end_datum > reservation['StartDatum'] and end_datum < reservation['EndDatum'])):
                        # Check if the vehicle is reserved during the requested period
                        is_available = False
                        break
                
                if abholort:
                    for i in range(len(reservations) - 1, 0, -1):
                        # Check if the vehicle is at the correct location
                        if reservations[i]['EndDatum'] > start_datum:
                            continue
                        if reservations[i]['Rueckgabeort'] != abholort:
                            is_available = False
                            break
                        break

                if rueckgabeort:
                    for i in range(len(reservations) - 1):
                        # Check if the vehicle will be given back at the correct location
                        if reservations[i]['StartDatum'] < end_datum:
                            continue
                        if reservations[i]['Abholort'] != rueckgabeort:
                            is_available = False
                            break
                        break

                if is_available:
                    available_vehicles.append(vehicle)

            return available_vehicles
