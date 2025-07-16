from flask import Blueprint, Flask, jsonify
import logging
import json
import os
import sqlite3
import bcrypt
from datetime import date
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from .db import init_app as init_db
from .routes.schaden_routes import bp as schaden_bp
from .routes.fahrzeug_routes import bp as fahrzeug_bp
from .routes.reservierung_routes import bp as reservierung_bp
from .routes.modell_routes import bp as modell_bp
from .routes.geodatum_routes import bp as geodatum_bp
from .routes.auth_routes import bp as auth_bp
from .routes.rolle_routes import bp as rolle_bp
from .routes.tarif_routes import bp as tarif_bp
from .routes.rechnung_routes import bp as rechnung_bp
from .routes.user_routes import bp as user_bp
from .routes.account_applications_routes import bp as account_applications_bp


FRONTEND_DIRECTORY = os.path.abspath(os.path.join(os.path.dirname(__file__), '../frontend_build'))


def create_app():
    """
    Factory-Funktion zur Erstellung der Flask-Anwendung.
    Konfiguriert alle notwendigen Komponenten für das Carsharing-Backend.
    """
    app = Flask(__name__, static_folder=FRONTEND_DIRECTORY, static_url_path="/")

    # CORS-Konfiguration für Frontend-Zugriff
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

    # Konfiguration aus externer JSON-Datei laden
    # Try multiple config file locations for Docker and local development
    config_paths = [
        "/app/config.json",  # Docker mount location
        os.path.join(os.path.dirname(__file__), "../../config.json"),  # Root level
        os.path.join(os.path.dirname(__file__), "../../config.local.json"),  # Local development
        os.path.join(os.path.dirname(__file__), "../config.json")  # Backend level fallback
    ]

    config = None
    for config_path in config_paths:
        if os.path.exists(config_path):
            with open(config_path) as config_file:
                config = json.load(config_file)
            break

    if config is None:
        # Fallback configuration if no config file is found
        config = {
            "ENV_TYPE": "Dev",
            "JWT_SECRET_KEY": "fallback-secret-key",
            "SECRET_KEY": "fallback-secret"
        }
    
    # JWT-Konfiguration für Authentifizierung
    app.config["JWT_SECRET_KEY"] = config.get("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # Tokens laufen nicht ab
    
    # JWT Manager initialisieren
    jwt = JWTManager(app)

    # Logging-Konfiguration
    logging.basicConfig(level=logging.DEBUG)
    
    # JWT-Fehlerbehandlung definieren
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": "Invalid token"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": "Authorization token is required"}), 401
    

    @app.route("/", strict_slashes=False, methods=['GET'])
    def index():
        return app.send_static_file('index.html')

    @app.errorhandler(404)
    def frontend_proxy(path):
        logging.debug("Proxying to frontend...")
        return app.send_static_file('index.html')
    
    @app.route("/health")
    def health():
        return jsonify({"status": "healthy"})
    
    # Datenbank initialisieren
    init_db(app)
    
    # Entwicklungsumgebung: Beispieldaten erstellen (nach DB-Initialisierung)
    # Nur im Hauptprozess ausführen, nicht bei Flask-Reloader
    with app.app_context():
        env_type = config.get("ENV_TYPE", "Dev")
        if (env_type == "Dev" or os.environ.get('DATABASE_URL')) and not os.environ.get('WERKZEUG_RUN_MAIN'):
            setup_dev_data(app)

    # API-Blueprint erstellen
    api = Blueprint("api", __name__)

    # Alle Route-Blueprints registrieren
    api.register_blueprint(auth_bp)  # Auth-Routes ohne Prefix
    api.register_blueprint(schaden_bp, url_prefix="/damages")
    api.register_blueprint(fahrzeug_bp, url_prefix="/cars")
    api.register_blueprint(modell_bp, url_prefix="/models")
    api.register_blueprint(geodatum_bp, url_prefix="/geodatum")
    api.register_blueprint(rolle_bp, url_prefix="/roles")
    api.register_blueprint(tarif_bp, url_prefix="/tariffs")
    api.register_blueprint(rechnung_bp, url_prefix="/invoices")
    api.register_blueprint(reservierung_bp, url_prefix="/reservations")
    api.register_blueprint(user_bp, url_prefix="/accounts")
    api.register_blueprint(account_applications_bp, url_prefix="/account-applications")

    # API-Blueprint mit Hauptanwendung registrieren
    app.register_blueprint(api, url_prefix="/api")

    return app

def setup_dev_data(app):
    """
    Erstellt Beispieldaten für die Entwicklungsumgebung.
    Fügt Rollen, Benutzer, Fahrzeugmodelle und Fahrzeuge hinzu.
    """
    from .db import get_db
    
    try:
        db = get_db()
        
        # Passwort für Beispielbenutzer erstellen
        password = b"123456"
        hashed = bcrypt.hashpw(password, bcrypt.gensalt()).decode()
        
        with db:
            # Rollen erstellen falls sie nicht existieren
            db.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)", (1, "Mitglied"))
            db.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)", (2, "Admin"))
            db.execute("INSERT OR IGNORE INTO Rolle (RolleID, Bedeutung) VALUES (?, ?)", (3, "Mitarbeiter"))
            
            # Beispielbenutzer für jede Rolle erstellen
            users = [
                (1, "mitglied", hashed, "Max", "Mitglied", "mitglied@example.com"),
                (2, "admin", hashed, "Anna", "Admin", "admin@example.com"),
                (3, "mitarbeiter", hashed, "Mia", "Mitarbeiter", "mitarbeiter@example.com")
            ]
            
            for rolle_id, username, pw_hash, vorname, nachname, email in users:
                db.execute("""
                INSERT OR IGNORE INTO Nutzer (
                    RolleID, Username, PasswordHash, Vorname, Nachname, Email,
                    Geburtsdatum, BeitrittsDatum, Führerschein, IBAN, BIC,
                    HausNummer, PLZ, Ort, Strasse, Angenommen,
                    identitycheck_valid, licensecheck_valid, credidworthycheck_valid
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    rolle_id, username, pw_hash, vorname, nachname, email,
                    "1990-01-01", date.today().isoformat(), "B123456789", "DE89370400440532013000", "COBADEFFXXX",
                    "1", "28195", "Bremen", "Beispielstraße", 1,
                    1, 1, 1
                ))
            
            # Beispiel-Fahrzeugmodelle hinzufügen
            modelle = [
                ("Golf", "Volkswagen", "Kompaktklasse", "Automatik", "Benzin", 110, 5, 5, 380, 12.5),
                ("Model 3", "Tesla", "Limousine", "Automatik", "Elektro", 200, 4, 5, 425, 18.0),
                ("Corsa", "Opel", "Kleinwagen", "Schaltgetriebe", "Benzin", 75, 3, 5, 285, 9.0)
            ]
            
            for modell_data in modelle:
                db.execute("""
                INSERT OR IGNORE INTO Modell (ModellName, Hersteller, Fahrzeugtyp, Getriebeart, 
                                            Kraftstoffart, Leistung, Türen, Sitze, Kofferraumvolumen, Stundenpreis)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, modell_data)
            
            # Modell-IDs abrufen
            modell_ids = {}
            for modell_name in ["Golf", "Model 3", "Corsa"]:
                cursor = db.execute("SELECT ModellID FROM Modell WHERE ModellName = ?", (modell_name,))
                result = cursor.fetchone()
                if result:
                    modell_ids[modell_name] = result[0]
            
            # Beispielfahrzeuge hinzufügen (in Bremen)
            if modell_ids:
                fahrzeuge = [
                    (modell_ids.get("Golf"), "HB-GO1234", "Gut", 1, "Sommer", 25000, "2024-01-10", "2026-05-01", "2021-05-01"),
                    (modell_ids.get("Model 3"), "HB-TS300E", "Sehr gut", 1, "Ganzjahr", 12000, "2024-03-15", "2027-03-01", "2022-03-01"),
                    (modell_ids.get("Corsa"), "HB-OP4567", "Befriedigend", 1, "Winter", 40000, "2023-11-20", "2025-11-01", "2020-11-01")
                ]
                
                for fahrzeug_data in fahrzeuge:
                    if fahrzeug_data[0]:  # Nur wenn Modell-ID existiert
                        db.execute("""
                        INSERT OR IGNORE INTO Fahrzeug (ModellID, Kennzeichen, Reperaturzustand, Aktiv, 
                                                      Reifen, Kilometerstand, LetzterService, TuevDatum, ErstzulassungsDatum)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                        """, fahrzeug_data)
                
                # GPS-Daten für Bremen (Marktplatz) hinzufügen
                bremen_longitude = 8.8017
                bremen_latitude = 53.0793
                current_time = date.today().isoformat() + "T12:00:00"
                
                for kennzeichen in ["HB-GO1234", "HB-TS300E", "HB-OP4567"]:
                    cursor = db.execute("SELECT FahrzeugID FROM Fahrzeug WHERE Kennzeichen = ?", (kennzeichen,))
                    result = cursor.fetchone()
                    if result:
                        fahrzeug_id = result[0]
                        db.execute("""
                        INSERT OR IGNORE INTO GeoDatum (FahrzeugID, Longitude, Latitude, Zeit)
                        VALUES (?, ?, ?, ?)
                        """, (fahrzeug_id, bremen_longitude, bremen_latitude, current_time))
            
            # Beispiel-Tarife hinzufügen
            tarife = [
                (1, 'Standard', 100, 'Haftpflicht', 1.0),
                (2, 'Premium', 250, 'Vollkasko', 1.5),
                (3, 'Spar', 50, 'Teilkasko', 0.8)
            ]
            
            for tarif_data in tarife:
                db.execute("""
                INSERT OR IGNORE INTO Tarif (TarifID, Name, Freikilometer, Versicherungsschutz, Multiplikator)
                VALUES (?, ?, ?, ?, ?)
                """, tarif_data)
        
        db.commit()
        
        app.logger.info("Entwicklungsumgebung: Beispieldaten erfolgreich erstellt")
        app.logger.info("Verfügbare Testkonten:")
        app.logger.info("  - Admin: admin / 123456")
        app.logger.info("  - Mitarbeiter: mitarbeiter / 123456") 
        app.logger.info("  - Mitglied: mitglied / 123456")
        app.logger.info("Beispielfahrzeuge in Bremen (28195) erstellt")
        
    except Exception as e:
        app.logger.error(f"Fehler beim Erstellen der Entwicklungsdaten: {e}")