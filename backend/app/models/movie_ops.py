import sqlite3
from app.db import get_db

def __init__(self, title, year, movie_id=None):
    self.id = movie_id
    self.title = title
    self.year = year

def get_all():
    """Holt alle Filme aus der Datenbank"""
    with get_db() as conn:
        result = conn.execute("SELECT * FROM movies").fetchall()
    return [dict(row) for row in result]

def get_by_id(movie_id):
    """Holt einen Film nach ID"""
    with get_db() as conn:
        result = conn.execute("SELECT * FROM movies WHERE id = ?", (movie_id,)).fetchone()
    return dict(result) if result else None

def create(title, year):
    """Erstellt einen neuen Film"""
    with get_db() as conn:
        conn.execute("INSERT INTO movies (title, year) VALUES (?, ?)", (title, year))
        conn.commit()

def update(movie_id, title, year):
    """Aktualisiert einen Film"""
    with get_db() as conn:
        conn.execute("UPDATE movies SET title = ?, year = ? WHERE id = ?", (title, year, movie_id))
        conn.commit()

def delete(movie_id):
    """Löscht einen Film"""
    with get_db() as conn:
        conn.execute("DELETE FROM movies WHERE id = ?", (movie_id,))
        conn.commit()