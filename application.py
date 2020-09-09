from flask import render_template, Flask, url_for
import chess
import chess.engine
import chess.pgn
import sys
import os
import stat

app = Flask(__name__)

if __name__ == '__main__':
    app.run(debug=False)

if sys.platform == "linux":
    os.chmod("./stockfish_20011801_x64", stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    engine = chess.engine.SimpleEngine.popen_uci("./stockfish_20011801_x64")
else:
    engine = chess.engine.SimpleEngine.popen_uci("./stockfish_20011801_x64.exe")

board = chess.Board()

@app.route("/")
def index():
    global board
    board = chess.Board() # Reset board
    fen = board.fen()
    return render_template("index.html", board = fen)

# @app.route("/move/get/<fen>")
# def get_pc_move(fen):


@app.route("/validate_move/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>", defaults={'promotion': None})
@app.route("/validate_move/<int:row_start>/<int:col_start>/<int:row_end>/<int:col_end>/<string:promotion>")
def validate_move(row_start, col_start, row_end, col_end, promotion):
    global board
    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end))

    if (human_move in board.legal_moves):
        board.push(human_move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        last_move = 0 if board.turn else 1
        info = engine.analyse(board, chess.engine.Limit(time=0.5))
        return {
            "validated": "true",
            "fen": board.fen(),
            "moves_san": moves_san,
            "last_move": last_move,
            "score": info["score"].white().score()
        }
    else:
        return {"validated": "false"}




# @app.route("/get_score")
# def get_score(data):



# @socketio.on("announce move human")
# def move(data):
#     global board
#     global stockfish
#
#     promotion = None
#     if (data["promotion"]):
#         promotion = data["promotion"]
#     human_move = chess.Move(chess.square(data["col_start"], 7 - data["row_start"]), chess.square(data["col_end"], 7 - data["row_end"]), promotion)
#     if (human_move in board.legal_moves):
#         board.push(human_move)
#         init_board = chess.Board()
#         moves_san = init_board.variation_san(board.move_stack)
#         last_move = 0 if board.turn else 1
#         emit("announce validated move human", {"fen": board.fen(), "last_move": last_move, "moves_san": moves_san})
#     else:
#         return
#     if (board.is_game_over()):
#         emit("announce game over", {"result": board.result()})
#
#     if (data["vs"] == "pc"):
#         stockfish.set_fen_position(board.fen())
#         move_string = stockfish.get_best_move_time(1000)
#         move = chess.Move.from_uci(move_string)
#         board.push(move)
#         init_board = chess.Board()
#         moves_san = init_board.variation_san(board.move_stack)
#         emit("announce move pc", {"fen": board.fen(), "move": move.uci(), "moves_san": moves_san})
#
#     if (board.is_game_over()):
#         emit("announce game over", {"result": board.result()})
#
#     # info = engine.analyse(board, chess.engine.Limit(time=0.5))
#     # emit("announce score", {"score": info["score"].white().score()})
#
# @socketio.on("new game")
# def new_game(data):
#     global board
#     board = chess.Board()

# @socketio.on("announce elo")
# def configure(data):
#     global engine
#     engine.configure({"UCI_LimitStrength": True, "UCI_Elo": data["elo"]})
