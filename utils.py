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
    
def get_move(row_start, col_start, row_end, col_end, promotion):
    if (promotion):
        pieces = {"queen": chess.QUEEN, "bishop": chess.BISHOP, "knight": chess.KNIGHT, "rook": chess.ROOK}
        promotion = pieces[promotion]

    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    return human_move
    
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

def get_online_games_available(db):
    cursor = db.cursor()
    
    games_available = []
    for game in cursor.execute("SELECT id, user_id_1, time1, time2 FROM games WHERE is_online = 1").fetchall():
        user_id = game[1]
        username = get_username(db, user_id)
        games_available.append({"game_id": game[0], "room": game[0], "username": username, "time": [game[2], game[3]]})
    return games_available