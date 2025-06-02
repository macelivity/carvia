import os
import sqlite3
import psycopg2
import json
from flask import g

DB_FILENAME = "movies.db"

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
    db= get_db()

    with db:
        db.execute(""" 
        -- Tabelle: Modell
        CREATE TABLE IF NOT EXISTS Modell (
            ModellID SERIAL PRIMARY KEY,
            ModellName TEXT,
            Hersteller TEXT,
            Fahrzeugtyp TEXT,
            Getriebeart TEXT,
            Kraftstoffart TEXT,
            Leistung INTEGER,
            Türen INTEGER,
            Sitze INTEGER,
            Kofferraumvolumen INTEGER,
            Stundenpreis NUMERIC NOT NULL
        );
        -- Tabelle: Schaden
        CREATE TABLE IF NOT EXISTS Schaden (
            SchadenID SERIAL PRIMARY KEY,
            FahrzeugID INTEGER NOT NULL REFERENCES Fahrzeug(FahrzeugID) ON DELETE RESTRICT ON UPDATE CASCADE,
            Beschreibung TEXT   
        );

        -- Tabelle: Fahrzeug
        CREATE TABLE IF NOT EXISTS Fahrzeug (
            FahrzeugID SERIAL PRIMARY KEY,
            ModellID INTEGER NOT NULL REFERENCES Modell(ModellID) ON DELETE RESTRICT ON UPDATE CASCADE,
            Kennzeichen TEXT UNIQUE,
            Reperaturzustand TEXT,
            Aktiv BOOLEAN NOT NULL,
            Reifen TEXT,
            Kilometerstand INTEGER NOT NULL,
            LetzterService DATE,
            TuevDatum DATE,
            ErstzulassungsDatum DATE
        );
        -- Tabelle: GeoDatum
        CREATE TABLE IF NOT EXISTS GeoDatum (
            GeoDatumID SERIAL PRIMARY KEY,
            Längengrad DOUBLE PRECISION,
            Breitengrad DOUBLE PRECISION,
            Zeit TIMESTAMP
        );               

        -- Tabelle: Rechnung
        CREATE TABLE IF NOT EXISTS Rechnung (
            RechnungID SERIAL PRIMARY KEY,
            FahrzeugID INTEGER NOT NULL REFERENCES Fahrzeug(FahrzeugID) ON DELETE RESTRICT ON UPDATE CASCADE,
            Bezahlt BOOLEAN,
            Austellungsdatum DATE
        );

        -- Tabelle: Tarif
        CREATE TABLE IF NOT EXISTS Tarif (
            TarifID SERIAL PRIMARY KEY,
            Name TEXT NOT NULL,
            Freikilometer INTEGER NOT NULL,
            Versicherungsschutz TEXT NOT NULL
        );
                   
        -- Tabelle: Rolle
        CREATE TABLE IF NOT EXISTS Rolle (
            RolleID SERIAL PRIMARY KEY,
            Bedeutung TEXT NOT NULL
        );
        -- Tabelle: User
        CREATE TABLE IF NOT EXISTS Nutzer (
            UserID SERIAL PRIMARY KEY,
            RolleID INTEGER NOT NULL REFERENCES Rolle(RolleID) ON DELETE RESTRICT ON UPDATE CASCADE,
            Vorname TEXT NOT NULL,
            Nachname TEXT NOT NULL,
            Geburtsdatum DATE NOT NULL,
            BeitrittsDatum DATE NOT NULL,
            Führerschein TEXT,
            IBAN TEXT,
            BIC TEXT,
            HausNummer TEXT NOT NULL,
            PLZ TEXT NOT NULL,
            Ort TEXT NOT NULL,
            Strasse TEXT NOT NULL
        );

        -- Tabelle: Reservierung
        CREATE TABLE IF NOT EXISTS Reservierung (
            ReservierungID SERIAL PRIMARY KEY,
            FahrzeugID INTEGER NOT NULL REFERENCES Fahrzeug(FahrzeugID) ON DELETE RESTRICT ON UPDATE CASCADE,
            UserID INTEGER NOT NULL REFERENCES Nutzer(UserID) ON DELETE RESTRICT ON UPDATE CASCADE,
            RechnungID INTEGER NOT NULL REFERENCES Rechnung(RechnungID) ON DELETE RESTRICT ON UPDATE CASCADE,
            TarifID INTEGER NOT NULL REFERENCES Tarif(TarifID) ON DELETE RESTRICT ON UPDATE CASCADE,
            StartDatum DATE NOT NULL,
            EndDatum DATE NOT NULL       
        );"""
)
    db.close()

def init_app(app):
    """Bindet DB-Initialisierung und Cleanup an die Flask-App"""
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()