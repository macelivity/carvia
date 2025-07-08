import sqlite3
import bcrypt
from datetime import date

# Path to your SQLite database
DB_PATH = "backend/database.db"

# Generate bcrypt hash for password '123456'
password = b"123456"
hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode()

# Use the correct RolleID for 'Mitarbeiter'
rolle_id = 2  # Change if needed

conn = sqlite3.connect(DB_PATH)
cur = conn.cursor()

# Insert roles if not exist
cur.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)", (1, "Mitglied"))
cur.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)", (3, "Mitarbeiter"))
cur.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)", (2, "Admin"))

# Insert users for each role
users = [
    (1, "mitglied", hashed, "Max", "Mitglied", "mitglied@example.com"),
    (3, "mitarbeiter", hashed, "Mia", "Mitarbeiter", "mitarbeiter@example.com"),
    (2, "admin", hashed, "Anna", "Admin", "admin@example.com")
]
for rolle_id, username, pw_hash, vorname, nachname, email in users:
    cur.execute("""
    INSERT OR IGNORE INTO Nutzer (
        RolleID, Username, PasswordHash, Vorname, Nachname, Email,
        Geburtsdatum, BeitrittsDatum, Führerschein, IBAN, BIC,
        HausNummer, PLZ, Ort, Strasse, Angenommen,
        identitycheck_valid, licensecheck_valid, credidworthycheck_valid
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        rolle_id, username, pw_hash, vorname, nachname, email,
        "1990-01-01", date.today().isoformat(), "", "", "",
        "1", "12345", "Teststadt", "Teststrasse", 1,
        1, 1, 1
    ))

# Add example models
cur.execute("""
INSERT OR IGNORE INTO Modell (ModellName, Hersteller, Fahrzeugtyp, Getriebeart, Kraftstoffart, Leistung, Türen, Sitze, Kofferraumvolumen, Stundenpreis)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", ("Golf", "Volkswagen", "Kompaktklasse", "Automatik", "Benzin", 110, 5, 5, 380, 12.5))
cur.execute("""
INSERT OR IGNORE INTO Modell (ModellName, Hersteller, Fahrzeugtyp, Getriebeart, Kraftstoffart, Leistung, Türen, Sitze, Kofferraumvolumen, Stundenpreis)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", ("Model 3", "Tesla", "Limousine", "Automatik", "Elektro", 200, 4, 5, 425, 18.0))
cur.execute("""
INSERT OR IGNORE INTO Modell (ModellName, Hersteller, Fahrzeugtyp, Getriebeart, Kraftstoffart, Leistung, Türen, Sitze, Kofferraumvolumen, Stundenpreis)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
""", ("Corsa", "Opel", "Kleinwagen", "Schaltgetriebe", "Benzin", 75, 3, 5, 285, 9.0))

# Get ModellIDs
cur.execute("SELECT ModellID FROM Modell WHERE ModellName = ?", ("Golf",))
golf_id = cur.fetchone()[0]
cur.execute("SELECT ModellID FROM Modell WHERE ModellName = ?", ("Model 3",))
tesla_id = cur.fetchone()[0]
cur.execute("SELECT ModellID FROM Modell WHERE ModellName = ?", ("Corsa",))
corsa_id = cur.fetchone()[0]

# Add example vehicles
cur.execute("""
INSERT INTO Fahrzeug (ModellID, Kennzeichen, Reperaturzustand, Aktiv, Reifen, Kilometerstand, LetzterService, TuevDatum, ErstzulassungsDatum)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (golf_id, "HB-GO1234", "Gut", 1, "Sommer", 25000, "2024-01-10", "2026-05-01", "2021-05-01"))
cur.execute("""
INSERT INTO Fahrzeug (ModellID, Kennzeichen, Reperaturzustand, Aktiv, Reifen, Kilometerstand, LetzterService, TuevDatum, ErstzulassungsDatum)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (tesla_id, "HB-TS300E", "Sehr gut", 1, "Ganzjahr", 12000, "2024-03-15", "2027-03-01", "2022-03-01"))
cur.execute("""
INSERT INTO Fahrzeug (ModellID, Kennzeichen, Reperaturzustand, Aktiv, Reifen, Kilometerstand, LetzterService, TuevDatum, ErstzulassungsDatum)
VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
""", (corsa_id, "HB-OP4567", "Befriedigend", 1, "Winter", 40000, "2023-11-20", "2025-11-01", "2020-11-01"))

# Get FahrzeugIDs for the inserted vehicles
cur.execute("SELECT FahrzeugID FROM Fahrzeug WHERE Kennzeichen = ?", ("HB-GO1234",))
golf_fahrzeug_id = cur.fetchone()[0]
cur.execute("SELECT FahrzeugID FROM Fahrzeug WHERE Kennzeichen = ?", ("HB-TS300E",))
tesla_fahrzeug_id = cur.fetchone()[0]
cur.execute("SELECT FahrzeugID FROM Fahrzeug WHERE Kennzeichen = ?", ("HB-OP4567",))
corsa_fahrzeug_id = cur.fetchone()[0]

# Add geolocation data for Bremen to each vehicle
for fahrzeug_id in [golf_fahrzeug_id, tesla_fahrzeug_id, corsa_fahrzeug_id]:
    cur.execute("""
    INSERT INTO GeoDatum (FahrzeugID, Longitude, Latitude, Zeit)
    VALUES (?, ?, ?, DATE('now'))
    """, (fahrzeug_id, 8.8017, 53.0793))

# Add example tariffs
cur.execute("""
INSERT OR IGNORE INTO Tarif (TarifID, Name, Freikilometer, Versicherungsschutz, Multiplikator)
VALUES (1, 'Standard', 100, 'Haftpflicht', 1.0)
""")
cur.execute("""
INSERT OR IGNORE INTO Tarif (TarifID, Name, Freikilometer, Versicherungsschutz, Multiplikator)
VALUES (2, 'Premium', 250, 'Vollkasko', 1.5)
""")
cur.execute("""
INSERT OR IGNORE INTO Tarif (TarifID, Name, Freikilometer, Versicherungsschutz, Multiplikator)
VALUES (3, 'Spar', 50, 'Teilkasko', 0.8)
""")

conn.commit()
conn.close()
print("Test Mitarbeiter and example data inserted.")
