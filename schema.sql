DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS games;

CREATE TABLE users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
	sid TEXT NOT NULL
);

CREATE TABLE games(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    fen TEXT NOT NULL, 
	moves TEXT
"    time INTEGER NOT NULL, 
    player1 TEXT, 
    player2 TEXT,
    FOREIGN KEY(player1) 
        REFERENCES users(id),
    FOREIGN KEY(player2)
        REFERENCES users(id)"
);

