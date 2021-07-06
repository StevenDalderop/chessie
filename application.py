from flask import render_template, Flask, request
from flask_socketio import SocketIO, join_room, leave_room
import chess
import sys
import os
import stat
from stockfish import Stockfish
import datetime
from chessie.constants import *
import sqlite3
from chessie.utils import * 

app = Flask(__name__)
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app, debug = True)

if sys.platform == "linux":
    os.chmod(STOCKFISH_LINUX, stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    stockfish = Stockfish(STOCKFISH_LINUX)
else:
    stockfish = Stockfish(STOCKFISH_WINDOWS)

boards = {}
game_id_last = 0
users_online = []
rooms = 0
games_available = []

@app.route("/")
def index():
    return render_template("index.html")


@app.route("/new_game")
def create_new_game():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    cursor.execute("INSERT INTO games (fen, is_online) VALUES (?, ?)", (chess.STARTING_FEN, False))
    game_id = cursor.execute(f"SELECT MAX(id) FROM GAMES").fetchone()[0]
    db.commit()   
    return {"game_id": game_id}
    

@app.route("/make_move/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>", defaults={'promotion': None})
@app.route("/make_move/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>/<string:promotion>")
def make_move(game_id, row_start, col_start, row_end, col_end, promotion):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    game_id, fen, moves = cursor.execute("SELECT id, fen, moves FROM games WHERE id = ?", (game_id,)).fetchone()
    
    board = chess.Board(fen)    

    move = get_move(row_start, col_start, row_end, col_end, promotion)
    uci = move.uci()
    
    if not (move in board.legal_moves):
        return {"valid": "false"}
        
    if moves: 
        moves = moves + " " + uci
    else:
        moves = uci
        
    board.push(move)
    fen = board.fen()
    
    cursor.execute('''UPDATE games SET fen = ? , moves = ? WHERE id = ? ''', (fen, moves, game_id))
    
    db.commit()
    
    san = get_san(moves)
    turn = int(board.turn) 
    evaluation = get_evaluation(stockfish, fen)    
    result = None if not board.is_game_over() else board.result()
    
    return {
        "valid": "true",
        "fen": fen,
        "san": san,
        "turn": turn,
        "evaluation": evaluation,
        "result": result
    }

         
@app.route("/check_promotion_valid/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>")
def check_promotion_valid(game_id, row_start, col_start, row_end, col_end):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    game_id, fen, moves = cursor.execute("SELECT id, fen, moves FROM games WHERE id = ?", (game_id,)).fetchone() 
    board = chess.Board(fen) 
    promotion = chess.QUEEN
    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    if (human_move in board.legal_moves):
        return {"valid": "true"}
    return {"valid": "false"}


@app.route("/get_pc_move/<int:game_id>/<int:skill_level>")
def get_pc_move(game_id, skill_level):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    game_id, fen, moves = cursor.execute("SELECT id, fen, moves FROM games WHERE id = ?", (game_id,)).fetchone() 
    
    stockfish.set_skill_level(skill_level)
    stockfish.set_fen_position(fen)
    uci = stockfish.get_best_move_time(STOCKFISH_TIME_MS)
    
    board = chess.Board(fen)
    board.push(chess.Move.from_uci(uci))    
    fen = board.fen()
    
    if moves: 
        moves = moves + " " + uci
    else:
        moves = uci
        
    san = get_san(moves)
    turn = board.turn 
    evaluation = get_evaluation(stockfish, fen)
    result = None if not board.is_game_over() else board.result()
    
    cursor.execute('''UPDATE games SET fen = ? , moves = ? WHERE id = ? ''', (fen, moves, game_id))
    db.commit()
    
    return {        
        "uci": uci,
        "fen": fen,
        "san": san,
        "turn": turn,
        "evaluation": evaluation,
        "result": result
    }


@socketio.on("disconnect")
def disconnect():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    sid = request.sid
    cursor.execute("DELETE FROM users WHERE sid = ?", (sid,))
    db.commit()
    
    users_online = [user[0] for user in cursor.execute("SELECT name FROM users").fetchall()]
    socketio.emit("announce user", {"users_online": users_online}, broadcast=True)


@socketio.on("add user online")
def add_user_online(data):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    username = data["username"]
    sid = request.sid
    
    result = cursor.execute("SELECT * FROM users WHERE name = ?", (username,)).fetchone() 
    
    if result:
        socketio.emit("user already exist", room=request.sid)
        return 

    cursor.execute("INSERT INTO users (name, sid) VALUES (?, ?)", (username, sid))
    db.commit()
    users_online = [user[0] for user in cursor.execute("SELECT name FROM users").fetchall()]
    socketio.emit("announce user", {"users_online": users_online}, broadcast=True)
            

@socketio.on("new game")
def new_online_game(data):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()

    fen = chess.STARTING_FEN
    time = int(data["time"])
    user_id_1 = get_user_id(db, data["username"])
    
    result = cursor.execute("SELECT id FROM games WHERE user_id_1 = ? OR user_id_2 = ?" ,(user_id_1, user_id_1)).fetchone()
    if result:
        room = result[0]
        leave_room(room)
    
    cursor.execute("DELETE FROM games WHERE user_id_1 = ? OR user_id_2 = ?", (user_id_1, user_id_1))
    
    cursor.execute("INSERT INTO games (fen, time1, time2, user_id_1, is_online) VALUES (?,?,?,?,?)", (fen, time, time, user_id_1, True))
    game_id = cursor.execute(f"SELECT MAX(id) FROM GAMES").fetchone()[0]

    join_room(game_id)    
    
    games_available = get_online_games_available(db)
        
    db.commit()     
       
    socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)
    socketio.emit("announce new game", {"game_id": game_id}, room=request.sid)


@socketio.on("join game")
def join_game(data):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    
    game_id = int(data["game_id"])

    join_room(game_id)
    
    username = data["username"]
    user_id = get_user_id(db, username)
    
    cursor.execute("UPDATE games SET user_id_2 = ? WHERE id = ?", (user_id, game_id))
    
    user_id_1, time = cursor.execute("SELECT user_id_1, time1 FROM games WHERE id = ?", (game_id,)).fetchone()
    username_1 = get_username(db, user_id_1)
       
    socketio.emit("announce game starts", {"username": username_1, "username2": username, "time": time, "game_id": game_id, "room": game_id}, room=game_id)

    cursor.execute("DELETE FROM games WHERE user_id_1 = ?", (user_id,))
    
    games_available = get_online_games_available(db)
    
    db.commit()

    socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)
    

@socketio.on("make move")
def make_move(data):
    json = {
        "fen": data["fen"], 
        "moved_squares": data["moved_squares"], 
        "san": data["moves_san"], 
        "step": data["step"], 
        "turn": data["turn"] , 
        "score": data["score"], 
        "times": data["times"], 
        "result": data["result"]
    }
    socketio.emit("announce move", json, room=data["room"])

@socketio.on("resign")
def resign(data): 
    socketio.emit("announce resign", {"username": data["username"]}, room=data["room"])

@socketio.on("offer draw")
def offer_draw(data): 
    socketio.emit("announce draw offered", {"username": data["username"]}, room=data["room"])

@socketio.on("draw")
def respond_to_draw_offer(data): 
    socketio.emit("announce draw decision", {"accepted": data["accepted"]}, room=data["room"])