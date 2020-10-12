from flask import render_template, Flask, request
from flask_socketio import SocketIO, join_room, leave_room
import chess
import sys
import os
import stat
from stockfish import Stockfish
import datetime
import threading 

app = Flask(__name__)
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app, debug = True)

if sys.platform == "linux":
    os.chmod("./stockfish_20011801_x64", stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    stockfish = Stockfish("./stockfish_20011801_x64")
else:
    stockfish = Stockfish("./stockfish_20011801_x64.exe")

boards = {}
game_id_last = 0
users_online = []
rooms = 0
games_available = []
lock = threading.Lock()

@app.route("/")
def index():
    global boards, game_id_last
    game_id_last += 1
    if (game_id_last == 100): # Keep only 100 boards in memory then overwrite first.
        game_id_last = 0
    boards[str(game_id_last)] =  chess.Board() # Reset board
    fen = boards[str(game_id_last)].fen()
    return render_template("index.html", board = fen, game_id = game_id_last)

@app.route("/check_promotion_valid/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>")
def check_promotion_valid(game_id, row_start, col_start, row_end, col_end):
    board = boards[str(game_id)] # Reference not copy
    promotion = chess.QUEEN
    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    if (human_move in board.legal_moves):
        return {"validated": "true"}
    else:
        return {"validated": "false"}

@app.route("/validated_move_info/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>", defaults={'promotion': None})
@app.route("/validated_move_info/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>/<string:promotion>")
def validated_move_info(game_id, row_start, col_start, row_end, col_end, promotion):
    lock.acquire()
    global boards
    board = boards[str(game_id)] # Reference not copy

    if (promotion):
        pieces = {"queen": chess.QUEEN, "bishop": chess.BISHOP, "knight": chess.KNIGHT, "rook": chess.ROOK}
        promotion = pieces[promotion]

    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    if (human_move in board.legal_moves):
        board.push(human_move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        last_move = 1 if board.turn else 0 #board.turn returns 1 if it is white's turn on client side we use opposite
        stockfish.set_fen_position(board.fen())
        info = stockfish.get_evaluation()
        score = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
        result = None if not board.is_game_over() else board.result()
        fen = board.fen()
        lock.release()
        return {
            "validated": "true",
            "fen": fen,
            "moves_san": moves_san,
            "last_move": last_move,
            "score": score,
            "result": result
        }
    else:
        lock.release()
        return {"validated": "false"}

@app.route("/new_game")
def new_game():
    global boards, game_id_last
    game_id_last += 1
    if (game_id_last == 100): # Keep only 100 boards in memory then overwrite first.
        game_id_last = 0
    boards[str(game_id_last)] = chess.Board()
    return {"new_game": "true", "game_id": game_id_last}

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
    global users_online, games_available # possible race condition
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