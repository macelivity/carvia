"""
Datenbankmodul für die Carvia Carsharing-Anwendung

Dieses Modul verwaltet die SQLite-Datenbankverbindung und -initialisierung.
Es unterstützt sowohl lokale Entwicklung als auch Docker-Deployment.

Autor: Carvia Development Team
Version: 1.0
"""

import os
import sqlite3
import json
from flask import g


class DatabaseConfig:
    """Konfigurationsklasse für Datenbankeinstellungen"""
    
    def __init__(self):
        """Lädt die Konfiguration aus verschiedenen möglichen Pfaden"""
        self.config = self._load_config()
    
    def _load_config(self):
        """
        Lädt die Konfiguration aus JSON-Dateien in prioritärer Reihenfolge:
        1. Docker-Umgebung: ../../config.json
        2. Lokale Entwicklung: ../../config.local.json  
        3. Backend-Fallback: ../config.json
        """
        config_paths = [
            os.path.join(os.path.dirname(__file__), "../../config.json"),
            os.path.join(os.path.dirname(__file__), "../../config.local.json"),
            os.path.join(os.path.dirname(__file__), "../config.json")
        ]

        for config_path in config_paths:
            if os.path.exists(config_path):
                try:
                    with open(config_path, 'r', encoding='utf-8') as config_file:
                        return json.load(config_file)
                except (json.JSONDecodeError, IOError) as e:
                    print(f"Fehler beim Laden der Konfiguration aus {config_path}: {e}")
                    continue

        # Fallback-Konfiguration wenn keine Datei gefunden wird
        return {
            "ENV_TYPE": "Dev",
            "DB_PATH": "database.db",
            "TEST_DB_PATH": "test_database.db"
        }
    
    def get(self, key, default=None):
        """Gibt einen Konfigurationswert zurück"""
        return self.config.get(key, default)


# Globale Konfigurationsinstanz
db_config = DatabaseConfig()


def get_db():
    """
    Stellt eine Datenbankverbindung bereit und speichert sie im Flask g-Objekt.
    
    Die Funktion erkennt automatisch die Umgebung (Docker vs. lokal) und
    wählt den entsprechenden Datenbankpfad.
    
    Returns:
        sqlite3.Connection: Datenbankverbindung mit Row-Factory
    """
    if "db" not in g:
        env_type = db_config.get("ENV_TYPE", "Dev")
        is_docker = _is_docker_environment()
        
        if env_type == "Test":
            db_path = _get_test_database_path(is_docker)
        else:
            db_path = _get_production_database_path(is_docker)
        
        # Datenbankverbindung erstellen
        g.db = sqlite3.connect(db_path)
        g.db.row_factory = sqlite3.Row  # Ermöglicht dict-ähnlichen Zugriff auf Zeilen
        
    return g.db


def _is_docker_environment():
    """
    Erkennt ob die Anwendung in einem Docker-Container läuft.
    
    Returns:
        bool: True wenn Docker-Umgebung erkannt wird
    """
    return (os.path.exists('/.dockerenv') or 
            os.environ.get('FLASK_ENV') == 'development')


def _get_test_database_path(is_docker):
    """
    Bestimmt den Pfad für die Test-Datenbank.
    
    Args:
        is_docker (bool): Ob die Anwendung in Docker läuft
    
    Returns:
        str: Pfad zur Test-Datenbank
    """
    if is_docker:
        return db_config.get("TEST_DB_PATH")
    else:
        return os.path.join(os.path.dirname(__file__), "../test_database.db")


def _get_production_database_path(is_docker):
    """
    Bestimmt den Pfad für die Produktions-Datenbank.
    
    Args:
        is_docker (bool): Ob die Anwendung in Docker läuft
    
    Returns:
        str: Pfad zur Produktions-Datenbank
    """
    if is_docker:
        return db_config.get("DB_PATH")
    else:
        local_db_path = os.path.join(os.path.dirname(__file__), "../database.db")
        # Stelle sicher, dass das Verzeichnis existiert
        os.makedirs(os.path.dirname(local_db_path), exist_ok=True)
        return local_db_path

def close_db(e=None):
    """
    Schließt die Datenbankverbindung am Ende einer Flask-Anfrage.
    
    Diese Funktion wird automatisch von Flask aufgerufen, um sicherzustellen,
    dass Datenbankverbindungen ordnungsgemäß geschlossen werden.
    
    Args:
        e: Exception-Objekt (wird von Flask bereitgestellt, falls vorhanden)
    """
    db = g.pop("db", None)
    if db is not None:
        db.close()


class DatabaseSchema:
    """Klasse zur Verwaltung des Datenbankschemas"""
    
    # SQLite-Datentypen für konsistente Schema-Definition
    PRIMARY_KEY = "INTEGER PRIMARY KEY AUTOINCREMENT"
    BOOLEAN_TYPE = "INTEGER"  # SQLite hat keinen nativen BOOLEAN-Typ
    NUMERIC_TYPE = "REAL"
    DOUBLE_PRECISION = "REAL"
    TIMESTAMP_TYPE = "TEXT"  # SQLite speichert Datumsangaben als TEXT
    DATE_TYPE = "TEXT"
    
    @classmethod
    def create_tables(cls, db):
        """
        Erstellt alle benötigten Tabellen für die Carvia-Anwendung.
        
        Args:
            db: SQLite-Datenbankverbindung
        """
        with db:
            cls._create_modell_table(db)
            cls._create_fahrzeug_table(db)
            cls._create_schaden_table(db)
            cls._create_geodatum_table(db)
            cls._create_rolle_table(db)
            cls._create_nutzer_table(db)
            cls._create_tarif_table(db)
            cls._create_rechnung_table(db)
            cls._create_reservierung_table(db)
            cls._insert_default_roles(db)
            db.commit()
    
    @classmethod
    def _create_modell_table(cls, db):
        """Erstellt die Modell-Tabelle für Fahrzeugmodelle"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Modell (
            ModellID {cls.PRIMARY_KEY},
            ModellName TEXT NOT NULL,
            Hersteller TEXT NOT NULL,
            Fahrzeugtyp TEXT,
            Getriebeart TEXT,
            Kraftstoffart TEXT,
            Leistung INTEGER,
            Türen INTEGER,
            Sitze INTEGER,
            Kofferraumvolumen INTEGER,
            Stundenpreis {cls.NUMERIC_TYPE} NOT NULL,
            UNIQUE(ModellName, Hersteller)
        );
        """)
    
    @classmethod
    def _create_fahrzeug_table(cls, db):
        """Erstellt die Fahrzeug-Tabelle für einzelne Fahrzeuge"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Fahrzeug (
            FahrzeugID {cls.PRIMARY_KEY},
            ModellID INTEGER NOT NULL,
            Kennzeichen TEXT UNIQUE NOT NULL,
            Reperaturzustand TEXT,
            Aktiv {cls.BOOLEAN_TYPE} NOT NULL DEFAULT 1,
            Reifen TEXT,
            Kilometerstand INTEGER NOT NULL DEFAULT 0,
            LetzterService {cls.DATE_TYPE},
            TuevDatum {cls.DATE_TYPE},
            ErstzulassungsDatum {cls.DATE_TYPE},
            FOREIGN KEY (ModellID) REFERENCES Modell(ModellID)
        );
        """)
    
    @classmethod
    def _create_schaden_table(cls, db):
        """Erstellt die Schaden-Tabelle für Fahrzeugschäden"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Schaden (
            SchadenID {cls.PRIMARY_KEY},
            FahrzeugID INTEGER NOT NULL,
            Beschreibung TEXT NOT NULL,
            Datum {cls.DATE_TYPE} DEFAULT CURRENT_DATE,
            FOREIGN KEY (FahrzeugID) REFERENCES Fahrzeug(FahrzeugID)
        );
        """)
    
    @classmethod
    def _create_geodatum_table(cls, db):
        """Erstellt die GeoDatum-Tabelle für GPS-Daten"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS GeoDatum (
            GeoDatumID {cls.PRIMARY_KEY},
            FahrzeugID INTEGER NOT NULL,
            Longitude {cls.DOUBLE_PRECISION},
            Latitude {cls.DOUBLE_PRECISION},
            Zeit {cls.TIMESTAMP_TYPE} DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (FahrzeugID) REFERENCES Fahrzeug(FahrzeugID)
        );
        """)
    
    @classmethod
    def _create_rolle_table(cls, db):
        """Erstellt die Rolle-Tabelle für Benutzerrollen"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Rolle (
            RolleID {cls.PRIMARY_KEY},
            Bedeutung TEXT UNIQUE NOT NULL
        );
        """)
    
    @classmethod
    def _create_nutzer_table(cls, db):
        """Erstellt die Nutzer-Tabelle für Benutzerkonten"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Nutzer (
            UserID {cls.PRIMARY_KEY},
            RolleID INTEGER NOT NULL,
            Username TEXT UNIQUE NOT NULL,
            PasswordHash TEXT NOT NULL,
            Vorname TEXT NOT NULL,
            Nachname TEXT NOT NULL,
            Email TEXT UNIQUE NOT NULL,
            Geburtsdatum {cls.DATE_TYPE} NOT NULL,
            BeitrittsDatum {cls.DATE_TYPE} NOT NULL DEFAULT CURRENT_DATE,
            Führerschein TEXT,
            IBAN TEXT,
            BIC TEXT,
            HausNummer TEXT NOT NULL,
            PLZ TEXT NOT NULL,
            Ort TEXT NOT NULL,
            Strasse TEXT NOT NULL,
            Angenommen {cls.BOOLEAN_TYPE} NOT NULL DEFAULT 0,
            identitycheck_valid {cls.BOOLEAN_TYPE} NOT NULL DEFAULT 0,
            licensecheck_valid {cls.BOOLEAN_TYPE} NOT NULL DEFAULT 0,
            credidworthycheck_valid {cls.BOOLEAN_TYPE} NOT NULL DEFAULT 0,
            FOREIGN KEY (RolleID) REFERENCES Rolle(RolleID)
        );
        """)
    
    @classmethod
    def _create_tarif_table(cls, db):
        """Erstellt die Tarif-Tabelle für Preismodelle"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Tarif (
            TarifID {cls.PRIMARY_KEY},
            Name TEXT UNIQUE NOT NULL,
            Freikilometer INTEGER NOT NULL DEFAULT 0,
            Versicherungsschutz TEXT NOT NULL,
            Multiplikator {cls.NUMERIC_TYPE} NOT NULL DEFAULT 1.0
        );
        """)
    
    @classmethod
    def _create_rechnung_table(cls, db):
        """Erstellt die Rechnung-Tabelle für Abrechnungen"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Rechnung (
            RechnungID {cls.PRIMARY_KEY},
            ReservierungID INTEGER NOT NULL,
            UserID INTEGER NOT NULL,
            FahrzeugID INTEGER NOT NULL,
            Preis {cls.NUMERIC_TYPE} NOT NULL,
            Bezahlt {cls.BOOLEAN_TYPE} DEFAULT 0,
            Austellungsdatum {cls.DATE_TYPE} DEFAULT CURRENT_DATE,
            FOREIGN KEY (ReservierungID) REFERENCES Reservierung(ReservierungID),
            FOREIGN KEY (UserID) REFERENCES Nutzer(UserID),
            FOREIGN KEY (FahrzeugID) REFERENCES Fahrzeug(FahrzeugID)
        );
        """)
    
    @classmethod
    def _create_reservierung_table(cls, db):
        """Erstellt die Reservierung-Tabelle für Buchungen"""
        db.execute(f"""
        CREATE TABLE IF NOT EXISTS Reservierung (
            ReservierungID {cls.PRIMARY_KEY},
            FahrzeugID INTEGER NOT NULL,
            UserID INTEGER NOT NULL,
            RechnungID INTEGER,
            TarifID INTEGER NOT NULL,
            StartDatum {cls.DATE_TYPE} NOT NULL,
            EndDatum {cls.DATE_TYPE} NOT NULL,
            Abholort TEXT NOT NULL,
            AbholPlz TEXT NOT NULL,
            Rueckgabeort TEXT NOT NULL,
            RueckgabePlz TEXT NOT NULL,
            Erstellt {cls.TIMESTAMP_TYPE} DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (FahrzeugID) REFERENCES Fahrzeug(FahrzeugID),
            FOREIGN KEY (UserID) REFERENCES Nutzer(UserID),
            FOREIGN KEY (TarifID) REFERENCES Tarif(TarifID)
        );
        """)
    
    @classmethod
    def _insert_default_roles(cls, db):
        """Fügt die Standard-Benutzerrollen ein"""
        default_roles = [
            (1, 'Mitglied'),
            (2, 'Admin'),
            (3, 'Mitarbeiter'),
            (4, 'Vehicle')
        ]
        
        for role_id, bedeutung in default_roles:
            db.execute(
                "INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)",
                (role_id, bedeutung)
            )


def init_db():
    """
    Initialisiert die Datenbank und erstellt alle erforderlichen Tabellen.
    
    Diese Funktion wird beim Start der Anwendung aufgerufen und stellt sicher,
    dass alle benötigten Tabellen existieren.
    """
    try:
        db = get_db()
        DatabaseSchema.create_tables(db)
        print("Datenbank erfolgreich initialisiert")
    except Exception as e:
        print(f"Fehler bei der Datenbankinitialisierung: {e}")
        raise
    finally:
        if 'db' in g:
            db.close()


def init_app(app):
    """
    Integriert die Datenbankfunktionalität in die Flask-Anwendung.
    
    Diese Funktion registriert die notwendigen Teardown-Handler und
    initialisiert die Datenbank im Anwendungskontext.
    
    Args:
        app: Flask-Anwendungsinstanz
    """
    # Registriere Cleanup-Handler für Anfragen
    app.teardown_appcontext(close_db)
    
    # Initialisiere Datenbank im Anwendungskontext
    with app.app_context():
        init_db()