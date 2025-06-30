from flask import Blueprint, Flask, jsonify
import logging
import json
import os

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
from .routes.reservierung_routes import bp as reservierung_bp
from .routes.accout_routes import bp as accounts_bp

def create_app():
    app = Flask(__name__)
    CORS(app, supports_credentials=True, resources={r"/api/*": {"origins": "*"}})

    # Load configuration
    config_path = os.path.join(os.path.dirname(__file__), "../../config.json")
    with open(config_path) as config_file:
        config = json.load(config_file)
    
    # Configure Flask-JWT-Extended
    app.config["JWT_SECRET_KEY"] = config.get("JWT_SECRET_KEY")
    app.config["JWT_ACCESS_TOKEN_EXPIRES"] = False  # Tokens won't expire (customize as needed)
    
    # Initialize JWT Manager
    jwt = JWTManager(app)

    # Configure logging
    logging.basicConfig(level=logging.DEBUG)
    
    # JWT error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({"msg": "Token has expired"}), 401
    
    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({"msg": "Invalid token"}), 401
    
    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({"msg": "Authorization token is required"}), 401
    
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({"error": "Not found"}), 404

    # Central error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        logging.exception("Unhandled exception occurred")
        return jsonify({"error": "Internal server error"}), 500
    
    init_db(app)

    api = Blueprint("api", __name__)

    # Register all blueprints
    api.register_blueprint(auth_bp)  # Auth routes at /auth
    api.register_blueprint(schaden_bp, url_prefix="/schaden")
    api.register_blueprint(fahrzeug_bp, url_prefix="/fahrzeug")
    api.register_blueprint(modell_bp, url_prefix="/modell")
    api.register_blueprint(geodatum_bp, url_prefix="/geodatum")
    api.register_blueprint(rolle_bp, url_prefix="/rolle")
    api.register_blueprint(tarif_bp, url_prefix="/tarif")
    api.register_blueprint(rechnung_bp, url_prefix="/rechnung")
    api.register_blueprint(reservierung_bp, url_prefix="/reservations")
    api.register_blueprint(accounts_bp)  # Accounts routes

    app.register_blueprint(api, url_prefix="/api")

    return app