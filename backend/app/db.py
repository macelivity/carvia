import os
import sqlite3
import psycopg2
import json
from flask import g

# Use absolute path to ensure database is always in the backend directory
DB_FILENAME = os.path.join(os.path.dirname(__file__), "..", "database.db")

# Load configuration from config.json
with open(os.path.join(os.path.dirname(__file__), "../../config.json")) as config_file:
    config = json.load(config_file)

def get_db():
    """Liefert eine DB-Verbindung und speichert sie in Flask's g-Objekt"""
    if "db" not in g:
        env_type = config.get("ENV_TYPE", "Dev")
        if env_type in ["Dev", "Test"]:
            g.db = sqlite3.connect(DB_FILENAME)
            g.db.row_factory = sqlite3.Row  # Für dict-ähnlichen Zugriff
        elif env_type == "Prod":
            postgres_uri = config.get("POSTGRES_URI")
            g.db = psycopg2.connect(postgres_uri)
    return g.db

def close_db(e=None):
    """Schließt die DB-Verbindung am Ende der Anfrage"""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    """Erstellt die Tabellen, falls sie nicht existieren"""
    
    # get DB connection
    db = get_db()
    env_type = config.get("ENV_TYPE", "Dev")

    # Use different SQL syntax based on database type
    if env_type in ["Dev", "Test"]:  # SQLite
        primary_key = "INTEGER PRIMARY KEY AUTOINCREMENT"
        boolean_type = "INTEGER"  # SQLite doesn't have native BOOLEAN
        numeric_type = "REAL"
        double_precision = "REAL"
        timestamp_type = "TEXT"  # SQLite stores dates as TEXT
        date_type = "TEXT"
    else:  # PostgreSQL
        primary_key = "SERIAL PRIMARY KEY"
        boolean_type = "BOOLEAN"
        numeric_type = "NUMERIC"
        double_precision = "DOUBLE PRECISION"
        timestamp_type = "TIMESTAMP"
        date_type = "DATE"

    with db:
        # Tabelle: Modell
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Modell (
            ModellID {primary_key},
            ModellName TEXT,
            Hersteller TEXT,
            Fahrzeugtyp TEXT,
            Getriebeart TEXT,
            Kraftstoffart TEXT,
            Leistung INTEGER,
            Türen INTEGER,
            Sitze INTEGER,
            Kofferraumvolumen INTEGER,
            Stundenpreis {numeric_type} NOT NULL
        );
        """)

        # Tabelle: Fahrzeug
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Fahrzeug (
            FahrzeugID {primary_key},
            ModellID INTEGER NOT NULL,
            Kennzeichen TEXT UNIQUE,
            Reperaturzustand TEXT,
            Aktiv {boolean_type} NOT NULL,
            Reifen TEXT,
            Kilometerstand INTEGER NOT NULL,
            LetzterService {date_type},
            TuevDatum {date_type},
            ErstzulassungsDatum {date_type}
        );
        """)

        # Tabelle: Schaden
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Schaden (
            SchadenID {primary_key},
            FahrzeugID INTEGER NOT NULL,
            Beschreibung TEXT
        );
        """)
        # Tabelle: GeoDatum
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS GeoDatum (
            GeoDatumID {primary_key},
            FahrzeugID INTEGER NOT NULL,
            Longitude {double_precision},
            Latitude {double_precision},
            Zeit {timestamp_type}
        );
        """)

        # Tabelle: Rolle
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Rolle (
            RolleID {primary_key},
            Bedeutung TEXT NOT NULL
        );
        """)        # Tabelle: Nutzer
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Nutzer (
            UserID {primary_key},
            RolleID INTEGER NOT NULL,
            Username TEXT UNIQUE NOT NULL,
            PasswordHash TEXT NOT NULL,
            Vorname TEXT NOT NULL,
            Nachname TEXT NOT NULL,
            Email TEXT NOT NULL,
            Geburtsdatum {date_type} NOT NULL,
            BeitrittsDatum {date_type} NOT NULL,
            Führerschein TEXT,
            IBAN TEXT,
            BIC TEXT,
            HausNummer TEXT NOT NULL,
            PLZ TEXT NOT NULL,
            Ort TEXT NOT NULL,
            Strasse TEXT NOT NULL,
            Angenommen {boolean_type} NOT NULL DEFAULT 0
        );
        """)

        # Tabelle: Tarif
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Tarif (
            TarifID {primary_key},
            Name TEXT NOT NULL,
            Freikilometer INTEGER NOT NULL,
            Versicherungsschutz TEXT NOT NULL,
            Multiplikator {numeric_type} NOT NULL
        );
        """)

        # Tabelle: Rechnung
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Rechnung (
            RechnungID {primary_key},
            ReservierungID INTEGER NOT NULL,
            UserID INTEGER NOT NULL,
            FahrzeugID INTEGER NOT NULL,
            Preis {numeric_type} NOT NULL,
            Bezahlt {boolean_type},
            Austellungsdatum {date_type}
        );
        """)
        
        # Tabelle: Reservierung
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Reservierung (
            ReservierungID {primary_key},
            FahrzeugID INTEGER NOT NULL,
            UserID INTEGER NOT NULL,
            RechnungID INTEGER NOT NULL,
            TarifID INTEGER NOT NULL,
            StartDatum {date_type} NOT NULL,
            EndDatum {date_type} NOT NULL,
            Abholort TEXT NOT NULL,
            AbholPlz TEXT NOT NULL,
            Rueckgabeort TEXT NOT NULL,
            RueckgabePlz TEXT NOT NULL
        );
        """)
        
        # Insert default roles if they don't exist
        db.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (1, 'User')")
        db.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (2, 'Admin')")
        db.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (3, 'Manager')")
        db.execute("""INSERT OR IGNORE INTO Nutzer
                        (Username, PasswordHash, RolleID, Vorname, Nachname, Email,
                        Geburtsdatum, BeitrittsDatum, Führerschein, IBAN, BIC, 
                        HausNummer, PLZ, Ort, Strasse, Angenommen)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                        ('Admin', '$2b$12$lFA/3Gzzy.WOV0Rm8AZF6.5KyJJyLgii5Rrd2nA7ftKgzcY.W2mBe', 2, 'Admin', 'User', 'admin@example.com',
                        '1990-01-01', '1990-01-01', None, None, None,
                        '', '', '', '', True))
        db.commit()
    db.close()

def init_app(app):
    """Bindet DB-Initialisierung und Cleanup an die Flask-App"""
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()