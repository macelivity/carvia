from app.db import get_db

class ModellOps:
    @staticmethod
    def get_all():
        """Holt alle Modelle aus der Datenbank"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Modell").fetchall()
            return [dict(row) for row in result]

    @staticmethod
    def get_by_id(modell_id):
        """Holt ein Modell nach ID"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Modell WHERE ModellID = ?", (modell_id,)).fetchone()
            return dict(result) if result else None
        
    @staticmethod
    def create(modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis):
        """Erstellt ein neues Modell"""
        with get_db() as conn:
            cursor = conn.execute("""
                INSERT INTO Modell (ModellName, Hersteller, Fahrzeugtyp, Getriebeart, Kraftstoffart, Leistung, Türen, Sitze, Kofferraumvolumen, Stundenpreis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis))
            modell_id = cursor.lastrowid
            conn.commit()
            return modell_id

    @staticmethod
    def update(modell_id, modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis):
        """Aktualisiert ein Modell"""
        with get_db() as conn:
            conn.execute("""
                UPDATE Modell
                SET ModellName = ?, Hersteller = ?, Fahrzeugtyp = ?, Getriebeart = ?, Kraftstoffart = ?, Leistung = ?, Türen = ?, Sitze = ?, Kofferraumvolumen = ?, Stundenpreis = ?
                WHERE ModellID = ?
            """, (modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis, modell_id))
            conn.commit()

    @staticmethod
    def delete(modell_id):
        """Löscht ein Modell"""
        with get_db() as conn:
            conn.execute("DELETE FROM Modell WHERE ModellID = ?", (modell_id,))
            conn.commit()
