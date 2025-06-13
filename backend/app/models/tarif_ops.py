from app.db import get_db

class TarifOps:
    @staticmethod
    def get_all():
        """Holt alle Tarife aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Tarif").fetchall()
        return [dict(row) for row in result]

    @staticmethod
    def get_by_id(tarif_id):
        """Holt einen Tarif nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Tarif WHERE TarifID = ?", (tarif_id,)).fetchone()
        return dict(result) if result else None
        
    @staticmethod
    def create(name, freikilometer, versicherungsschutz):
        """Erstellt einen neuen Tarif"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Tarif (Name, Freikilometer, Versicherungsschutz)
                VALUES (?, ?, ?)
            """, (name, freikilometer, versicherungsschutz))
            tarif_id = cursor.lastrowid
            conn.commit()
            return tarif_id

    @staticmethod
    def update(tarif_id, name, freikilometer, versicherungsschutz):
        """Aktualisiert einen Tarif"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Tarif
                SET Name = ?, Freikilometer = ?, Versicherungsschutz = ?
                WHERE TarifID = ?
            """, (name, freikilometer, versicherungsschutz, tarif_id))
            conn.commit()

    @staticmethod
    def delete(tarif_id):
        """Löscht einen Tarif"""
        with get_db() as conn:
            conn.execute("DELETE FROM Tarif WHERE TarifID = ?", (tarif_id,))
            conn.commit()
