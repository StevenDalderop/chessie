import sqlite3

db = sqlite3.connect("chess.db")

with open('schema.sql', 'r') as f:
    db.executescript(f.read())
    
cursor = db.cursor()

cursor.execute("INSERT INTO users (name) VALUES (\"test\")")
db.commit()

res = cursor.execute("SELECT * FROM users").fetchall()
print(res)