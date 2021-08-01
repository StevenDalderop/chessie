DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS games;

CREATE TABLE users(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
	password_hash TEXT, 
	is_online BOOLEAN
);

CREATE TABLE games(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    fen TEXT NOT NULL, 
	moves TEXT, 
	time1 INTEGER,
	time2 INTEGER,
    user_id_1 INTEGER, 
    user_id_2 INTEGER,
	is_online BOOLEAN,
    FOREIGN KEY(user_id_1) 
        REFERENCES users(id),
    FOREIGN KEY(user_id_2)
        REFERENCES users(id)
);

