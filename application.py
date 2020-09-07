from flask import render_template, Flask, url_for
from flask_socketio import SocketIO, emit
import chess
import chess.engine
import chess.pgn
import asyncio

app = Flask(__name__)
socketio = SocketIO(app)
if __name__ == '__main__':
    socketio.run(app)

#engine = chess.engine.SimpleEngine.popen_uci("stockfish-11-win/stockfish-11-win/Windows/stockfish_20011801_x64.exe")
#engine = chess.engine.SimpleEngine.popen_uci("stockfish-11-linux/stockfish-11-linux/Linux/stockfish_20011801_x64")

#engine.configure({"UCI_LimitStrength": True, "UCI_Elo": 2850})
board = chess.Board()

async def main() -> None:
    transport, engine = await chess.engine.popen_uci("stockfish-11-linux/stockfish-11-linux/Linux/stockfish_20011801_x64")

    global board
    board = chess.Board()
    while not board.is_game_over():
        result = await engine.play(board, chess.engine.Limit(time=0.1))
        board.push(result.move)
        pc_move = result.move
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        socketio.emit("announce move pc", {"fen": board.fen(), "move": pc_move.uci(), "moves_san": moves_san})

    await engine.quit()

@app.route("/")
def index():
    global board
    board = chess.Board() # Reset board
    fen = board.fen()
    return render_template("index.html", board = fen)

@app.route("/2")
def index2():
    asyncio.set_event_loop_policy(chess.engine.EventLoopPolicy())
    asyncio.run(main())
    global board
    fen = board.fen()
    return render_template("index.html", board = fen)

@socketio.on("announce move human")
def move(data):
    global board
    global game

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
        result = engine.play(board, chess.engine.Limit(time=1))
        pc_move = result.move
        board.push(pc_move)
        init_board = chess.Board()
        moves_san = init_board.variation_san(board.move_stack)
        emit("announce move pc", {"fen": board.fen(), "move": pc_move.uci(), "moves_san": moves_san})

    if (board.is_game_over()):
        emit("announce game over", {"result": board.result()})

    #info = engine.analyse(board, chess.engine.Limit(time=0.5))
    #emit("announce score", {"score": info["score"].white().score()})

@socketio.on("new game")
def new_game(data):
    global board
    board = chess.Board()

@socketio.on("announce elo")
def configure(data):
    global engine
    engine.configure({"UCI_LimitStrength": True, "UCI_Elo": data["elo"]})
