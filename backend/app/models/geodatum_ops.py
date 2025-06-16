from app.db import get_db

class GeodatumOps:
    @staticmethod
    def get_all():
        """Holt alle GeoDaten aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM GeoDatum").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(geodatum_id):
        """Holt ein GeoDatum nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM GeoDatum WHERE GeoDatumID = ?", (geodatum_id,)).fetchone()
        return dict(result) if result else None
    
    @staticmethod
    def get_location_of_vehicle(fahrzeug_id):
        with get_db() as conn:
            result = conn.execute("""
                SELECT * FROM GeoDatum
                WHERE FahrzeugID = ?
                AND Zeit = (
                    SELECT MAX(Zeit) FROM GeoDatum
                    WHERE FahrzeugID = ?
                )
                """, (fahrzeug_id, fahrzeug_id)).fetchone()
        return dict(result) if result else None

    @staticmethod
    def get_by_vehicle_id(fahrzeug_id):
        """Holt GeoDaten für ein bestimmtes Fahrzeug"""
        with get_db() as conn:
            result = conn.execute("""
                SELECT * FROM GeoDatum
                WHERE FahrzeugID = ?
            """, (fahrzeug_id,)).fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def create(vehicle_id, longitude, latitude, zeit):
        """Erstellt ein neues GeoDatum"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO GeoDatum (FahrzeugID, Longitude, Latitude, Zeit)
                VALUES (?, ?, ?, ?)
            """, (vehicle_id, longitude, latitude, zeit))
            geodatum_id = cursor.lastrowid
            conn.commit()
            return geodatum_id
    @staticmethod
    def update(geodatum_id, vehicle_id, longitude, latitude, zeit):
        """Aktualisiert ein GeoDatum"""
        with get_db() as conn:
            conn.execute("""
                UPDATE GeoDatum
                SET FahrzeugID = ?, Longitude = ?, Latitude = ?, Zeit = ?
                WHERE GeoDatumID = ?
            """, (vehicle_id, longitude, latitude, zeit, geodatum_id))
            conn.commit()

    @staticmethod
    def delete(geodatum_id):
        """Löscht ein GeoDatum"""
        with get_db() as conn:
            conn.execute("DELETE FROM GeoDatum WHERE GeoDatumID = ?", (geodatum_id,))
            conn.commit()
