import chess

def get_evaluation(stockfish, fen):
    stockfish.set_fen_position(fen)
    info = stockfish.get_evaluation()
    evaluation = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
    return evaluation

    
def get_san(moves):
    starting_board = chess.Board()
    if moves:
        move_stack = [chess.Move.from_uci(uci) for uci in moves.split()]
    else:
        move_stack = []
    moves_san = starting_board.variation_san(move_stack)
    return moves_san
   

def get_online_games_available(db):
    cursor = db.cursor()
    
    games_available = []
    for game in cursor.execute("SELECT id, user_id_1, time1 FROM games WHERE is_online = 1 AND user_id_2 IS NULL").fetchall():
        user_id = game[1]
        username = get_username(db, user_id)
        games_available.append({"game_id": game[0], "room": game[0], "username": username, "time": game[2]})
    return games_available


def announce_online_games(db, socketio):
    games_available = get_online_games_available(db)
    socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)
    

def get_user_id(db, username):
    cursor = db.cursor()
    
    user_id = cursor.execute("SELECT id FROM users WHERE name = ?", (username,)).fetchone()
    if user_id:
        return user_id[0]
    return user_id 

    
def get_username(db, index):
    cursor = db.cursor()
    
    username = cursor.execute("SELECT name FROM users WHERE id = ?", (index,)).fetchone()
    if username:
        return username[0]
    return username  

    
def get_online_users(db):
    cursor = db.cursor()
    users_online = [user[0] for user in cursor.execute("SELECT name FROM users WHERE is_online = 1").fetchall()]
    return users_online

    
def announce_users_online(db, socketio):
    users_online = get_online_users(db)
    socketio.emit("announce users", {"users_online": users_online}, broadcast=True)  


def set_user_offline(db, user_id):
    cursor = db.cursor()    
    cursor.execute("UPDATE users SET is_online = ? WHERE id = ?", (False, user_id))
    db.commit()
    
def delete_games(db, user_id):
    cursor = db.cursor()
    cursor.execute("DELETE FROM games WHERE user_id_1 = ? OR user_id_2 = ?", (user_id, user_id))
    db.commit()
    
