from app.db import get_db

class GeoDatumOps:
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
    def create(längengrad, breitengrad, zeit):
        """Erstellt ein neues GeoDatum"""
        with get_db() as conn:
            conn.execute("""
                INSERT INTO GeoDatum (Längengrad, Breitengrad, Zeit)
                VALUES (?, ?, ?)
            """, (längengrad, breitengrad, zeit))
            conn.commit()

    @staticmethod
    def update(geodatum_id, längengrad, breitengrad, zeit):
        """Aktualisiert ein GeoDatum"""
        with get_db() as conn:
            conn.execute("""
                UPDATE GeoDatum
                SET Längengrad = ?, Breitengrad = ?, Zeit = ?
                WHERE GeoDatumID = ?
            """, (längengrad, breitengrad, zeit, geodatum_id))
            conn.commit()

    @staticmethod
    def delete(geodatum_id):
        """Löscht ein GeoDatum"""
        with get_db() as conn:
            conn.execute("DELETE FROM GeoDatum WHERE GeoDatumID = ?", (geodatum_id,))
            conn.commit()
