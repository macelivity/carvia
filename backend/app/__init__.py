from flask import Flask, jsonify
import logging
from .db import init_app as init_db
from .routes.schaden_routes import bp as schaden_bp
from .routes.fahrzeug_routes import bp as fahrzeug_bp
from .routes.modell_routes import bp as modell_bp
from .routes.geodatum_routes import bp as geodatum_bp

def create_app():
    app = Flask(__name__)
    
    # Configure logging
    logging.basicConfig(level=logging.DEBUG)
    
    # Central error handler
    @app.errorhandler(Exception)
    def handle_exception(e):
        logging.exception("Unhandled exception occurred")
        return jsonify({"error": "Internal server error"}), 500
    
    init_db(app)
    
    # Register all blueprints
    app.register_blueprint(schaden_bp, url_prefix="/schaden")
    app.register_blueprint(fahrzeug_bp, url_prefix="/fahrzeug")
    app.register_blueprint(modell_bp, url_prefix="/modell")
    app.register_blueprint(geodatum_bp, url_prefix="/geodatum")

    return app