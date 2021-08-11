import chess
from .models import * 

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
   

def get_online_games_available():
    type_online = GameType.query.get("online")
    games = Game.query.filter_by(is_started = False, type = type_online).all()
    res = []
    for game in games:
        user_details = UserDetails.query.filter_by(game_id = game.id).first()
        username = User.query.get(user_details.user_id).name
        json = {"game_id": game.id , "room": game.id , "username": username, "time": game.time}
        res.append(json)
    return res


def announce_online_games(socketio):
    games_available = get_online_games_available()
    socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)

    
def delete_games(db, user_id):
    user_details = UserDetails.query.filter_by(user_id = user_id).all()
    
    for user_detail in user_details:
        game = Game.query.get(user_detail.game_id)
        if game and game.type == "online" and not game.is_started:
            db.session.delete(game)
    
    db.session.commit()           
    
def resign_games(db, user_id):
    user_details = UserDetails.query.filter_by(user_id = user_id).all()
    
    for user_detail in user_details:
        color = user_detail.color
        game = Game.query.get(user_detail.game_id)
        
        if game and game.is_started and not game.is_finished:
            game.is_finished = True
            game.result_pk = "1-0" if color == "black" else "0-1"                 
        
    db.session.commit()
            
    