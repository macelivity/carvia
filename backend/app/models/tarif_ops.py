from app.db import get_db

class TarifOps:
    @staticmethod
    def get_all():
        """Alle Tarife aus der Datenbank abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Tarif").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(tarif_id):
        """Tarif anhand der ID abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Tarif WHERE TarifID = ?", (tarif_id,)).fetchone()
        return dict(result) if result else None
    
    @staticmethod
    def create(name, freikilometer, versicherungsschutz, multiplikator):
        """Neuen Tarif anlegen"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Tarif (Name, Freikilometer, Versicherungsschutz, Multiplikator)
                VALUES (?, ?, ?, ?)
            """, (name, freikilometer, versicherungsschutz, multiplikator))
            tarif_id = cursor.lastrowid
            conn.commit()
            return tarif_id

    @staticmethod
    def update(tarif_id, name, freikilometer, versicherungsschutz, multiplikator):
        """Tarif aktualisieren"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Tarif
                SET Name = ?, Freikilometer = ?, Versicherungsschutz = ?, Multiplikator = ?
                WHERE TarifID = ?
            """, (name, freikilometer, versicherungsschutz, multiplikator, tarif_id))
            conn.commit()

    @staticmethod
    def delete(tarif_id):
        """Tarif anhand der ID löschen"""
        with get_db() as conn:
            conn.execute("DELETE FROM Tarif WHERE TarifID = ?", (tarif_id,))
            conn.commit()
