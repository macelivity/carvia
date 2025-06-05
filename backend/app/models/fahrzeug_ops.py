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
