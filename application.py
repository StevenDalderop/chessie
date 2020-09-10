from flask import render_template, Flask
import chess
import chess.engine
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
        info = engine.analyse(board, chess.engine.Limit(time=0.1))
        result = None if not board.is_game_over() else board.result()
        return {
            "validated": "true",
            "fen": board.fen(),
            "moves_san": moves_san,
            "last_move": last_move,
            "score": info["score"].white().score(),
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
    result = engine.play(board, chess.engine.Limit(time = 0.1))
    board.push(result.move)
    init_board = chess.Board()
    moves_san = init_board.variation_san(board.move_stack)
    last_move = 0 if board.turn else 1
    info = engine.analyse(board, chess.engine.Limit(time=0.1))
    result = None if not board.is_game_over() else board.result()
    return {
        "fen": board.fen(),
        "moves_san": moves_san,
        "last_move": last_move,
        "score": info["score"].white().score(),
        "result": result
    }


# @socketio.on("announce move human")
# def move(data):


#     if (data["vs"] == "pc"):
#         stockfish.set_fen_position(board.fen())
#         move_string = stockfish.get_best_move_time(1000)
#         move = chess.Move.from_uci(move_string)
#         board.push(move)
#         init_board = chess.Board()
#         moves_san = init_board.variation_san(board.move_stack)
#         emit("announce move pc", {"fen": board.fen(), "move": move.uci(), "moves_san": moves_san})
#
#     # info = engine.analyse(board, chess.engine.Limit(time=0.5))
#     # emit("announce score", {"score": info["score"].white().score()})



# @socketio.on("announce elo")
# def configure(data):
#     global engine
#     engine.configure({"UCI_LimitStrength": True, "UCI_Elo": data["elo"]})
