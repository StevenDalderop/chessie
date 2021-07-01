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
def new_game():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    cursor.execute("INSERT INTO games (fen) VALUES (?)", (chess.STARTING_FEN,))
    game_id = cursor.execute(f"SELECT MAX(id) FROM GAMES").fetchone()[0]
    db.commit()   
    return {"game_id": game_id}
    

@app.route("/make_move/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>", defaults={'promotion': None})
@app.route("/make_move/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>/<string:promotion>")
def make_move(game_id, row_start, col_start, row_end, col_end, promotion):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    game_id, fen, moves = cursor.execute("SELECT * FROM games WHERE id = ?", (game_id,)).fetchone()
    
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
    board = boards[str(game_id)] 
    promotion = chess.QUEEN
    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    if (human_move in board.legal_moves):
        return {"validated": "true"}
    return {"validated": "false"}

@app.route("/get_pc_move/<int:game_id>/<int:skill_level>")
def pc_move(game_id, skill_level):
    global boards
    board = boards[str(game_id)]
    stockfish.set_skill_level(skill_level)
    stockfish.set_fen_position(board.fen())
    move = stockfish.get_best_move_time(100)
    board.push(chess.Move.from_uci(move))
    init_board = chess.Board()
    moves_san = init_board.variation_san(board.move_stack)
    last_move = 1 if board.turn else 0 #board.turn returns 1 if it is white's turn on client side we use opposite
    stockfish.set_fen_position(board.fen())
    info = stockfish.get_evaluation()
    score = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
    result = None if not board.is_game_over() else board.result()
    fen = board.fen()
    return {
        "fen": fen,
        "uci": move,
        "moves_san": moves_san,
        "last_move": last_move,
        "score": score,
        "result": result
    }



@socketio.on("connect")
@socketio.on("refresh")
def connect():
    global users_online, games_available 
    for (index, dict) in enumerate(users_online):
        date = datetime.datetime.strptime(dict["last_seen"], "%a, %d %b %Y %H:%M:%S %Z")
        now = datetime.datetime.utcnow()
        diff = (now - date).total_seconds()
        if diff > 30:
            username = users_online[index]["username"]
            del users_online[index]
            for (index, dict) in enumerate(games_available):
                if username == dict["username"]:
                    del games_available[index]
    socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)
    socketio.emit("announce user", {"users_online": users_online}, broadcast=True)


@socketio.on("user online")
def online(data):
    global users_online
    for dict in users_online:
        if dict["username"] == data["username"]:
            dict["last_seen"] = data["datetime"]


@socketio.on("add user online")
def user_online(data):
    global users_online
    username = data["username"]
    usernames = []
    for dict in users_online:
        usernames.append(dict["username"])
    if username in usernames:
        socketio.emit("user already exist", room=request.sid)
    else:
        users_online.append({"username": username, "last_seen": data["time"]})
        socketio.emit("announce user", {"users_online": users_online}, broadcast=True)


@socketio.on("new game")
def new_game(data):
    global rooms, games_available
    username = data["username"]
    room = rooms
    for (index, dict) in enumerate(games_available):
        if dict["username"] == username:
            del games_available[index]
    games_available.append({"game_id": data["game_id"], "room": room, "username": username, "time": data["time"]})
    join_room(room)
    rooms += 1
    socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)


@socketio.on("join game")
def join_game(data):
    global boards, games_available
    boards[str(data["game_id"])] = chess.Board()
    game_id = data["game_id"]
    username = data["username"]
    for (index, dict) in enumerate(games_available):
        if int(dict["game_id"]) == int(game_id):
            username2 = dict["username"]
            room = dict["room"]
            time = dict["time"]
            join_room(room)
            socketio.emit("announce game starts", {"username": username, "username2": username2, "time": time, "game_id": game_id, "room": room}, room=room)
            del games_available[index]
            socketio.emit("announce games available", {"games_available": games_available}, broadcast=True)


@socketio.on("make move")
def make_move(data):
    socketio.emit("announce move", {"fen": data["fen"], "moved_squares": data["moved_squares"], "moves_san": data["moves_san"], "step": data["step"], "last_move": data["last_move"] , "score": data["score"], "times": data["times"], "result": data["result"]}, room=data["room"])

@socketio.on("resign")
def resign(data): 
    socketio.emit("announce resign", {"username": data["username"]}, room=data["room"])

@socketio.on("offer draw")
def offer_draw(data): 
    socketio.emit("announce draw offered", {"username": data["username"]}, room=data["room"])

@socketio.on("draw")
def draw(data): 
    socketio.emit("announce draw decision", {"accepted": data["accepted"]}, room=data["room"])