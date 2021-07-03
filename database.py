import sqlite3

db = sqlite3.connect("chess.db")

with open('schema.sql', 'r') as f:
    db.executescript(f.read())
    
