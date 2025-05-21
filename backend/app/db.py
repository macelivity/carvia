import sqlite3
from flask import g
import os

DB_FILENAME = "movies.db"

def get_db():
    """Liefert eine DB-Verbindung und speichert sie in Flask's g-Objekt"""
    if "db" not in g:
        g.db = sqlite3.connect(DB_FILENAME)
        g.db.row_factory = sqlite3.Row  # Für dict-ähnlichen Zugriff
    return g.db

def close_db(e=None):
    """Schließt die DB-Verbindung am Ende der Anfrage"""
    db = g.pop("db", None)
    if db is not None:
        db.close()

def init_db():
    """Erstellt die Tabellen, falls sie nicht existieren"""
    db = sqlite3.connect(DB_FILENAME)
    with db:
        db.execute("""
            CREATE TABLE IF NOT EXISTS movies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                title TEXT NOT NULL,
                year INTEGER
            )
        """)
    db.close()

def init_app(app):
    """Bindet DB-Initialisierung und Cleanup an die Flask-App"""
    app.teardown_appcontext(close_db)
    with app.app_context():
        init_db()