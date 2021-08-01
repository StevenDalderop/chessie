from flask import render_template, Flask, request, session, Response, redirect
from flask_socketio import SocketIO, join_room, leave_room
from flask_login import LoginManager, login_required, login_user, logout_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import json
import chess
import sys
import os
import stat
from stockfish import Stockfish
import datetime
import sqlite3

from .constants import *
from .utils import * 
from .secret import secret_key

app = Flask(__name__)
socketio = SocketIO(app)

app.secret_key = secret_key

login_manager = LoginManager()
login_manager.init_app(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)

from .models import User, UserDetails, Color, Game, GameResult, GameType

if __name__ == '__main__':
    socketio.run(app, debug = True)

if sys.platform == "linux":
    os.chmod(STOCKFISH_LINUX, stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    stockfish = Stockfish(STOCKFISH_LINUX)
else:
    stockfish = Stockfish(STOCKFISH_WINDOWS)


@login_manager.user_loader
def load_user(user_id):
    print(user_id)
    return User.query.get(int(user_id))
 
 
@app.errorhandler(404)
@login_required
def not_found(e):
    return render_template("index.html")


@app.route("/signup", methods = ["GET", "POST"])
def signup():
    if request.method == "GET":
        return render_template("index.html")

    name = request.form.get("name")
    password = request.form.get("password")
    
    user = User.query.filter_by(name=name).first()
    
    if user:
        return redirect("/signup")
    
    new_user = User(name=name, password_hash=generate_password_hash(password), is_authenticated=True, is_active=True, is_anonymous=False)
    db.session.add(new_user)
    db.session.commit()
    return redirect("/login")        
    

@app.route("/login", methods = ["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("index.html")

    name = request.form.get("name")
    password = request.form.get("password")

    user = User.query.filter_by(name=name).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return redirect("/login")
    
    login_user(user)
    return redirect("/")
    

@app.route("/logout", methods = ["GET"])
@login_required
def logout():       
    logout_user()
    return redirect("/login")
    

@app.route("/api/make_move/<int:game_id>/<string:uci>")
def make_move(game_id, uci):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    game_id, fen, moves = cursor.execute("SELECT id, fen, moves FROM games WHERE id = ?", (game_id,)).fetchone()
    
    board = chess.Board(fen)    

    move = chess.Move.from_uci(uci)
    
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
        "evaluation": evaluation,
        "result": result
    }

         
@app.route("/api/check_promotion_valid/<int:game_id>/<string:uci>")
def check_promotion_valid(game_id, uci):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    game_id, fen, moves = cursor.execute("SELECT id, fen, moves FROM games WHERE id = ?", (game_id,)).fetchone() 
    board = chess.Board(fen) 
    human_move = chess.Move.from_uci(uci)
    if (human_move in board.legal_moves):
        return {"valid": "true"}
    return {"valid": "false"}


@app.route("/api/get_pc_move/<int:game_id>/<int:skill_level>")
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
    turn = int(board.turn) 
    evaluation = get_evaluation(stockfish, fen)
    result = None if not board.is_game_over() else board.result()
    
    cursor.execute('''UPDATE games SET fen = ? , moves = ? WHERE id = ? ''', (fen, moves, game_id))
    db.commit()
    
    return {        
        "uci": uci,
        "fen": fen,
        "san": san,
        "evaluation": evaluation,
        "result": result
    }

    
@app.route("/api/get_games")    
def get_games_available():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    games_available = get_online_games_available(db)
    return {"games_available": games_available}, 200


@app.route("/api/new_game", methods=["POST"])
def create_new_game():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    fen = chess.STARTING_FEN
    time = int(request.json["time"])
    is_online = request.json["is_online"]
    username_white = request.json["username_white"]
    
    user_id_1 = get_user_id(db, username_white)
    
    cursor.execute("INSERT INTO games (fen, time1, time2, is_online, user_id_1) VALUES (?, ?, ?, ?, ?)",\
        (fen, time, time, is_online, user_id_1))
        
    result = cursor.execute("SELECT * FROM games ORDER BY id DESC LIMIT 1").fetchone()
    db.commit()   
    
    game = {
        "id": result[0],
        "fen": result[1],
        "moves": result[2],
        "time1": result[3],
        "time2": result[4],
        "username_white": get_username(db, result[5]),
        "username_black": get_username(db, result[6]),
        "is_online": result[7]
    }
    
    return game, 201


@app.route("/api/game", methods=["PATCH"])
def update_game():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()

    game_id = request.json["game_id"]
    username_black = request.json["username_black"]
    user_id_black = get_user_id(db, username_black)
    
    cursor.execute("UPDATE games SET user_id_2 = ? WHERE id = ?", (user_id_black, game_id))
    db.commit()
    return "", 200
   

@app.route("/api/leave-games", methods=["POST"])
def leave_games():
    db = sqlite3.connect(DATABASE)
    
    username = request.json["username"]
    user_id = get_user_id(db, username)
    
    delete_games(db, user_id)
    return "", 200  


@app.route("/api/get_users")
def get_users():
    db = sqlite3.connect(DATABASE)
    users_online = get_online_users(db)
    return {"users_online": users_online}, 200


@app.route("/api/users/exists")
def username_exists():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    username = request.args.get("username")
    
    if not username:
        return "No username provided", 400
    
    result = cursor.execute("SELECT name FROM users WHERE name = ?", (username,)).fetchone()
    
    if result:
        return json.dumps(True), 200
    return json.dumps(False), 200
    

@app.route("/api/create_new_user", methods=["POST"])
def create_new_user():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    username = request.json["username"]
    sid = request.json["sid"]
    is_online = request.json["is_online"]

    cursor.execute("INSERT INTO users (name, sid, is_online) VALUES (?, ?, ?)", (username, sid, is_online))
    db.commit()  
    session["username"] = username
    return "", 201


@app.route("/api/user_online", methods=["PATCH"])
def user_online():
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
   
    username = request.json["username"]
    sid = request.json["sid"]
    is_online = request.json["is_online"]

    cursor.execute("UPDATE users SET sid = ? , is_online = ? WHERE name = ?", (sid, is_online, username))   
    db.commit()  
    
    return "", 200
    

@socketio.on('connect')
def connect():
    print("connected")


@socketio.on("disconnect")
def disconnect():
    db = sqlite3.connect(DATABASE) 
    cursor = db.cursor()
        
    if "username" in session:
        res = cursor.execute("SELECT id FROM users WHERE name = ?", (session["username"],)).fetchone()
        
        if res:
            user_id = res[0]
            delete_games(db, user_id)    
        
        db.commit()
        
        set_user_offline(db, user_id)    
        announce_users_online(db, socketio)
        announce_online_games(db, socketio)
    
    print("disconnected")


@socketio.on("new user")
def new_user():
    db = sqlite3.connect(DATABASE)
    announce_users_online(db, socketio)


@socketio.on("new online game")
def new_online_game(data):
    db = sqlite3.connect(DATABASE)       
    announce_online_games(db, socketio)
    
    
@socketio.on("join room")
def on_join_room(data):
    room = str(data["room"])
    join_room(room) 


@socketio.on("start game")
def start_game(data):
    db = sqlite3.connect(DATABASE)
    cursor = db.cursor()
    
    game_id = data["game_id"]
            
    res = cursor.execute("SELECT fen, user_id_1, user_id_2, time1, time2 FROM games WHERE id = ?", (game_id,)).fetchone()
    fen, user_id_1, user_id_2, time_white, time_black = res
    username_white = get_username(db, user_id_1)  
    username_black = get_username(db, user_id_2)
    
    data = {
        "game_id": game_id,
        "fen": fen, 
        "username_white": username_white, 
        "username_black": username_black,
        "time_white": time_white, 
        "time_black": time_black
    }
    
    socketio.emit("announce game starts", data, to = str(game_id))
    

@socketio.on("make move")
def make_move(data):
    room = data.pop("room")
    socketio.emit("announce move", data, room = str(room))


@socketio.on("resign")
def resign(data): 
    socketio.emit("announce resign", {"username": data["username"]}, room=str(data["room"]))


@socketio.on("offer draw")
def offer_draw(data): 
    socketio.emit("announce draw offered", {"username": data["username"]}, room=str(data["room"]))


@socketio.on("draw")
def respond_to_draw_offer(data): 
    socketio.emit("announce draw decision", {"accepted": data["accepted"]}, room=str(data["room"]))
    