from flask import render_template, Flask, url_for
from flask_socketio import SocketIO, emit
import chess
import chess.engine
import chess.pgn
import sys
from stockfish import Stockfish

app = Flask(__name__)
socketio = SocketIO(app)

if __name__ == '__main__':
    socketio.run(app, debug=False)

if sys.platform == "linux":
    stockfish = Stockfish("./stockfish_20090216_x64") # stockfish 12
else:
    stockfish = Stockfish("stockfish-11-win/stockfish-11-win/Windows/stockfish_20011801_x64.exe")

board = chess.Board()

@app.route("/")
def index():
    global board
    board = chess.Board() # Reset board
    fen = board.fen()
    return render_template("index.html", board = fen)

@socketio.on("announce move human")
def move(data):
    global board
    global stockfish

    promotion = None
    if (data["promotion"]):
        promotion = data["promotion"]
    human_move = chess.Move(chess.square(data["col_start"], 7 - data["row_start"]), chess.square(data["col_end"], 7 - data["row_end"]), promotion)
    if (human_move in board.legal_moves):
        board.push(human_move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        last_move = 0 if board.turn else 1
        emit("announce validated move human", {"fen": board.fen(), "last_move": last_move, "moves_san": moves_san})
    else:
        return
    if (board.is_game_over()):
        emit("announce game over", {"result": board.result()})

    if (data["vs"] == "pc"):
        stockfish.set_fen_position(board.fen())
        move_string = stockfish.get_best_move_time(1000)
        move = chess.Move.from_uci(move_string)
        board.push(move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        emit("announce move pc", {"fen": board.fen(), "move": move.uci(), "moves_san": moves_san})

    if (board.is_game_over()):
        emit("announce game over", {"result": board.result()})

    # info = engine.analyse(board, chess.engine.Limit(time=0.5))
    # emit("announce score", {"score": info["score"].white().score()})

@socketio.on("new game")
def new_game(data):
    global board
    board = chess.Board()

# @socketio.on("announce elo")
# def configure(data):
#     global engine
#     engine.configure({"UCI_LimitStrength": True, "UCI_Elo": data["elo"]})
