from flask import render_template, Flask
import chess
import chess.engine
import sys
import os
import stat
from stockfish import Stockfish

app = Flask(__name__)

if __name__ == '__main__':
    app.run(debug=False)

if sys.platform == "linux":
    os.chmod("./stockfish_20011801_x64", stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    stockfish = Stockfish("./stockfish_20011801_x64")
else:
    stockfish = Stockfish("./stockfish_20011801_x64.exe")

board = chess.Board()

@app.route("/")
def index():
    global board
    board = chess.Board() # Reset board
    fen = board.fen()
    return render_template("index.html", board = fen)

@app.route("/validated_move_info/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>", defaults={'promotion': None})
@app.route("/validated_move_info/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>/<string:promotion>")
def validated_move_info(row_start, col_start, row_end, col_end, promotion):
    global board

    if (promotion):
        pieces = {"queen": chess.QUEEN, "bishop": chess.BISHOP, "knight": chess.KNIGHT, "rook": chess.ROOK}
        promotion = pieces[promotion]

    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)

    if (human_move in board.legal_moves):
        board.push(human_move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        last_move = 0 if board.turn else 1
        stockfish.set_fen_position(board.fen())
        info = stockfish.get_evaluation()
        score = None if info["type"] != "cp" else info["value"]
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
    global board
    board = chess.Board()
    return {"new_game": "true"}

@app.route("/configure/<int:elo>")
def configure(elo):
    global engine
    engine.configure({"UCI_LimitStrength": True, "UCI_Elo": elo})
    return {"configured": "true"}

@app.route("/get_pc_move")
def pc_move():
    global board
    stockfish.set_fen_position(board.fen())
    move = stockfish.get_best_move_time(100)
    board.push(chess.Move.from_uci(move))
    init_board = chess.Board()
    moves_san = init_board.variation_san(board.move_stack)
    last_move = 0 if board.turn else 1
    stockfish.set_fen_position(board.fen())
    info = stockfish.get_evaluation()
    score = None if info["type"] != "cp" else info["value"]
    result = None if not board.is_game_over() else board.result()
    return {
        "fen": board.fen(),
        "moves_san": moves_san,
        "last_move": last_move,
        "score": score,
        "result": result
    }
