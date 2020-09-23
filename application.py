from flask import render_template, Flask
from flask_socketio import SocketIO, join_room, leave_room
import chess
import sys
import os
import stat
from stockfish import Stockfish

app = Flask(__name__)
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app)

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

@app.route("/")
def index():
    global boards, game_id_last
    game_id_last += 1
    if (game_id_last == 100): # Keep only 100 boards in memory then overwrite first.
        game_id_last = 0
    boards[str(game_id_last)] =  chess.Board() # Reset board
    fen = boards[str(game_id_last)].fen()
    return render_template("index.html", board = fen, game_id = game_id_last)

@app.route("/validated_move_info/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>", defaults={'promotion': None})
@app.route("/validated_move_info/<int:game_id>/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>/<string:promotion>")
def validated_move_info(game_id, row_start, col_start, row_end, col_end, promotion):
    global boards
    board = boards[str(game_id)] # Reference not copy

    if (promotion):
        pieces = {"queen": chess.QUEEN, "bishop": chess.BISHOP, "knight": chess.KNIGHT, "rook": chess.ROOK}
        promotion = pieces[promotion]

    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    print(human_move)
    if (human_move in board.legal_moves):
        board.push(human_move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        last_move = 0 if board.turn else 1
        stockfish.set_fen_position(board.fen())
        info = stockfish.get_evaluation()
        score = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
        result = None if not board.is_game_over() else board.result()
        return {
            "validated": "true",
            "fen": board.fen(),
            "moves_san": moves_san,
            "last_move": last_move,
            "score": score,
            "result": result
        }
    else:
        return {"validated": "false"}

@app.route("/new_game")
def new_game():
    global boards, game_id_last
    game_id_last += 1
    if (game_id_last == 100): # Keep only 100 boards in memory then overwrite first.
        game_id_last = 0
    boards[str(game_id_last)] = chess.Board()
    return {"new_game": "true", "game_id": game_id_last}

@app.route("/configure/<int:elo>")
def configure(elo):
    global engine
    engine.configure({"UCI_LimitStrength": True, "UCI_Elo": elo})
    return {"configured": "true"}

@app.route("/get_pc_move/<int:game_id>")
def pc_move(game_id):
    global boards
    board = boards[str(game_id)]
    stockfish.set_fen_position(board.fen())
    move = stockfish.get_best_move_time(100)
    board.push(chess.Move.from_uci(move))
    init_board = chess.Board()
    moves_san = init_board.variation_san(board.move_stack)
    last_move = 0 if board.turn else 1
    stockfish.set_fen_position(board.fen())
    info = stockfish.get_evaluation()
    score = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
    result = None if not board.is_game_over() else board.result()
    return {
        "fen": board.fen(),
        "moves_san": moves_san,
        "last_move": last_move,
        "score": score,
        "result": result
    }

# @socketio.on('connect')
# def test_connect():
#     print('Client connected')
#
# @socketio.on('disconnect')
# def test_disconnect():
#     print('Client disconnected') # Takes one minute

@socketio.on("add user online")
def user_online(data):
    global users_online
    username = data["username"]
    users_online.append(username)
    socketio.emit("announce user", {"users_online": users_online}, broadcast=True)

@socketio.on("new game")
def new_game(data):
    global rooms, games_available
    username = data["username"]
    room = rooms
    games_available.append({"room": room, "username": username, "time": data["time"]})
    join_room(room)
    rooms += 1
    socketio.emit("announce new game", {"games_available": games_available}, broadcast=True)

@socketio.on("join game")
def join_game(data):
    global boards
    boards[str(data["game_id"])] = chess.Board()
    join_room(data["room"])
    username = data["username"]
    username2 = data["username2"]
    socketio.emit("announce game starts", {"username": username, "username2": username2, "game_id": data["game_id"], "room": data["room"]}, room=data["room"])

@socketio.on("make move")
def make_move(data):
    print("make move")
    socketio.emit("announce move", {"fen": data["fen"], "moves_san": data["moves_san"], "step": data["step"], "last_move": data["last_move"] , "score": data["score"], "result": data["result"]}, room=data["room"])
