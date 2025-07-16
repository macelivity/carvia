from app.db import get_db

class ModellOps:
    @staticmethod
    def get_all():
        """Alle Modelle aus der Datenbank abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Modell").fetchall()
            return [dict(row) for row in result]

    @staticmethod
    def get_by_id(modell_id):
        """Modell anhand der ID abrufen"""
        with get_db() as conn:
            result = conn.execute("SELECT * FROM Modell WHERE ModellID = ?", (modell_id,)).fetchone()
            return dict(result) if result else None
    
    @staticmethod
    def create(modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis):
        """Neues Modell anlegen (legt nur an, wenn noch nicht vorhanden)"""
        # Einheitliche Herstellerbezeichnung
        if hersteller == "VW":
            hersteller = "Volkswagen"
        with get_db() as conn:
            # Prüfen, ob das Modell bereits existiert
            existing_modell = conn.execute(
                "SELECT * FROM Modell WHERE ModellName = ? AND Hersteller = ? AND Fahrzeugtyp = ? AND Getriebeart = ? AND Kraftstoffart = ? AND Leistung = ? AND Türen = ? AND Sitze = ? AND Kofferraumvolumen = ? AND Stundenpreis = ?",
                (modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis)
            ).fetchone()
            if existing_modell:
                return existing_modell['ModellID']  # Gibt die ID des existierenden Modells zurück
            cursor = conn.execute("""
                INSERT INTO Modell (ModellName, Hersteller, Fahrzeugtyp, Getriebeart, Kraftstoffart, Leistung, Türen, Sitze, Kofferraumvolumen, Stundenpreis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis))
            modell_id = cursor.lastrowid
            conn.commit()
            return modell_id

    @staticmethod
    def update(modell_id, modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis):
        """Modell aktualisieren"""
        if hersteller == "VW":
            hersteller = "Volkswagen"
        with get_db() as conn:
            conn.execute("""
                UPDATE Modell
                SET ModellName = ?, Hersteller = ?, Fahrzeugtyp = ?, Getriebeart = ?, Kraftstoffart = ?, Leistung = ?, Türen = ?, Sitze = ?, Kofferraumvolumen = ?, Stundenpreis = ?
                WHERE ModellID = ?
            """, (modell_name, hersteller, fahrzeugtyp, getriebeart, kraftstoffart, leistung, türen, sitze, kofferraumvolumen, stundenpreis, modell_id))
            conn.commit()

    @staticmethod
    def delete(modell_id):
        """Modell anhand der ID löschen"""
        with get_db() as conn:
            conn.execute("DELETE FROM Modell WHERE ModellID = ?", (modell_id,))
            conn.commit()
