import functools
from flask import render_template, Flask, request, session, Response, redirect
from flask_socketio import SocketIO, join_room, leave_room
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
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
from .secret import secret_key

app = Flask(__name__)
socketio = SocketIO(app)

app.secret_key = secret_key

login_manager = LoginManager()
login_manager.init_app(app)

app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///test.db'
db = SQLAlchemy(app)

from .models import *
from .utils import * 

if __name__ == '__main__':
    socketio.run(app, debug = True)

if sys.platform == "linux":
    os.chmod(STOCKFISH_LINUX, stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    stockfish = Stockfish(STOCKFISH_LINUX)
else:
    stockfish = Stockfish(STOCKFISH_WINDOWS)


def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            socketio.disconnect()
        else:
            return f(*args, **kwargs)
    return wrapped
    

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
 

@login_manager.unauthorized_handler
def unauthorized():
    print("Unauthorized")
    return redirect("/login")

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
    
    new_user = User(name=name, password_hash=generate_password_hash(password), is_authenticated=True, is_active=True, is_anonymous=False, is_online = True)
    db.session.add(new_user)
    db.session.commit()
    return redirect("/")        
    

@app.route("/login", methods = ["GET", "POST"])
def login():
    if request.method == "GET":
        return render_template("index.html")
    
    name = request.json.get("name")
    password = request.json.get("password")

    user = User.query.filter_by(name=name).first()
    
    if not user or not check_password_hash(user.password_hash, password):
        return {"name": name, "is_authenticated": False}
    
    login_user(user)
    user.is_online = True
    db.session.commit()
    return {"name": user.name, "is_authenticated": True}
    

@app.route("/logout", methods = ["GET"])
@login_required
def logout():    
    current_user.is_online = False
    db.session.commit()
    logout_user()
    return redirect("/login")


@app.route("/is_authenticated")
def is_authenticated():
    logged_in = current_user.is_authenticated
    username = "" 
    if logged_in: 
        username = current_user.name
    return {"logged_in": logged_in, "username": username}


@app.route("/api/make_move/<int:game_id>/<string:uci>")
@login_required
def make_move(game_id, uci):    
    game = Game.query.get(game_id)
    
    board = chess.Board(game.fen)    

    move = chess.Move.from_uci(uci)
    
    if not (move in board.legal_moves):
        return {"valid": "false"}
        
    if game.moves: 
        moves = game.moves + " " + uci
    else:
        moves = uci
        
    board.push(move)
    fen = board.fen()
    
    game.fen = fen
    game.moves = moves
    
    db.session.commit()
    
    san = get_san(moves)
    turn = int(board.turn) 
    evaluation = get_evaluation(stockfish, fen)    
    result = None if not board.is_game_over() else board.result()
    
    if result:
        game.result_pk = result
        game.is_finished = True
        db.session.commit()        
    
    return {
        "valid": "true",
        "fen": fen,
        "san": san,
        "evaluation": evaluation,
        "result": result
    }

         
@app.route("/api/check_promotion_valid/<int:game_id>/<string:uci>")
@login_required
def check_promotion_valid(game_id, uci):
    game = Game.query.get(game_id) 
    
    board = chess.Board(game.fen) 
    human_move = chess.Move.from_uci(uci)
    
    if (human_move in board.legal_moves):
        return {"valid": "true"}
    return {"valid": "false"}


@app.route("/api/get_pc_move/<int:game_id>/<int:skill_level>")
@login_required
def get_pc_move(game_id, skill_level):
    game = Game.query.get(game_id)
    
    stockfish.set_skill_level(skill_level)
    stockfish.set_fen_position(game.fen)
    uci = stockfish.get_best_move_time(STOCKFISH_TIME_MS)
    
    board = chess.Board(game.fen)
    board.push(chess.Move.from_uci(uci))    
    fen = board.fen()
    
    if game.moves: 
        moves = game.moves + " " + uci
    else:
        moves = uci
        
    san = get_san(moves)
    turn = int(board.turn) 
    evaluation = get_evaluation(stockfish, fen)
    result = None if not board.is_game_over() else board.result()
    
    game.fen = fen
    game.moves = moves
    if result:
        game.result_pk = result
        game.is_finished = True
        db.session.commit() 
    db.session.commit()
    
    return {        
        "uci": uci,
        "fen": fen,
        "san": san,
        "evaluation": evaluation,
        "result": result
    }

 
@app.route("/api/games") 
@login_required   
def get_games_available():   
    online_games = get_online_games_available()   
    return {"games_available": online_games}, 200


@app.route("/api/users")
@login_required
def get_users():
    users = User.query.filter_by(is_online = True).all()
    names = [user.name for user in users]
    return {"users_online": names}, 200
    

@app.route("/api/me/game")
@login_required
def get_current_game():
    user_id = current_user.get_id()
    user_details = UserDetails.query.filter_by(user_id = user_id).all()
    
    games = [Game.query.get(user_detail.game_id) for user_detail in user_details]
    filtered_games = [game for game in games if not game.is_finished and game.type_pk != "human" and game.is_started]  

    if len(filtered_games) > 1:
        return {"error": "multiple current games"}, 400
        
    if len(filtered_games) == 0:
        return {"current_game": None}, 200
    
    current_game = filtered_games[0]
    
    return current_game.get_json(), 200
    
    
@app.route("/api/me/game", methods=["POST"])
@login_required
def create_new_game():   
    fen = chess.STARTING_FEN
    time = int(request.json["time"])
    vs = request.json["game_type"]
    username = request.json["username"]
    color = request.json.get("color")
    skill_level = request.json.get("skill_level")
    
    user = User.query.filter_by(name = username).first()
    game_type = GameType.query.get(vs)
    is_started = vs != "online"
    game = Game(time = time, fen = fen, type = game_type, is_started = is_started, is_finished = False)
    db.session.add(game)
    db.session.commit()
    
    if game_type.type == "pc":
        pc_game = PCGame(game_id = game.id, skill_level = skill_level)
        db.session.add(pc_game)
        db.session.commit()
    
    user_details = UserDetails(time = time, color = color, game_id = game.id, user_id = user.id)

    db.session.add(user_details)
    db.session.commit()
    
    return game.get_json(), 201


@app.route("/api/me/game/resign")
@login_required
def resign():           
    user_id = current_user.get_id()
    user_details = UserDetails.query.filter_by(user_id = user_id)
    
    games = [Game.query.get(user_detail.game_id) for user_detail in user_details.all()]
    filtered_games = [game for game in games if not game.is_finished and game.type_pk != "human" and game.is_started]

    if len(filtered_games) > 1:
        return {"error": "multiple current games"}, 400
        
    if len(filtered_games) == 0:
        return {"error": "no current game"}, 400
    
    current_game = filtered_games[0]
    
    color = user_details.filter_by(game_id = current_game.id).first().color
    
    current_game.is_finished = True
    current_game.result_pk = "1-0" if color == "black" else "0-1"
    db.session.commit()
    
    return current_game.get_json(), 200 
    

@app.route("/api/join-game", methods=["POST"])
@login_required
def join_game():
    game_id = request.json.get("game_id")

    game = Game.query.get(game_id)
    if not game:
        return {"error": "game does not exist"}, 400
    
    game.is_started = True
    user_details = UserDetails(color = "black", time = game.time, user_id = current_user.get_id(), game_id = game.id)
    
    db.session.add(user_details)
    db.session.commit()
    return "", 200
   

@app.route("/api/me/leave-games")
@login_required
def leave_games():       
    user_id = current_user.get_id()  
    delete_games(db, user_id)
    resign_games(db, user_id)    
    return "", 200  


@app.route("/api/me/results")
@login_required
def get_results():    
    current_user_id = current_user.get_id()
    user_details = UserDetails.query.filter_by(user_id = current_user.get_id()).all()
    
    games = []
    for user_detail in user_details:
        game = Game.query.get(user_detail.game_id)
        if not game.is_finished:
            continue
        
        if game.type_pk == "online":
            opponent_details = UserDetails.query.filter(UserDetails.user_id != current_user_id, UserDetails.game_id == game.id).first()
            opponent = User.query.get(opponent_details.user_id)
            opponent_username = opponent.name
        elif game.type_pk == "pc":
            pc_game = PCGame.query.filter_by(game_id = game.id).first()
            opponent_username = pc_game.get_username()
        else:
            opponent_username = "-"
            
        json = {
            "color": user_detail.color,
            "time": game.time,
            "moves": game.moves,
            "type": game.type_pk,
            "result": game.result_pk,
            "opponent": opponent_username
        }
        games.append(json)
    return {"results": games}       


    
    

@socketio.on("connect")
@authenticated_only
def connect():
    username = current_user.name
    socketio.emit("status change", {"username": username, "is_online": True}, broadcast = True)


@socketio.on("disconnect")
@authenticated_only
def disconnect():  
    username = current_user.name
    socketio.emit("status change", {"username": username, "is_online": False}, broadcast = True)
    user_id = current_user.get_id()
    delete_games(db, user_id)
    resign_games(db, user_id)
    announce_online_games(socketio)


@socketio.on("user online")
@authenticated_only
def user_online():   
    username = current_user.name
    socketio.emit("status change", {"username": username, "is_online": True}, broadcast = True)


@socketio.on("user offline")
@authenticated_only
def user_offline(data):
    socketio.emit("status change", {"username": data["username"], "is_online": False}, broadcast = True)


@socketio.on("new online game")
@authenticated_only
def new_online_game():  
    announce_online_games(socketio)
    
    
@socketio.on("join room")
@authenticated_only
def on_join_room(data):
    room = str(data["room"])
    join_room(room) 


@socketio.on("start game")
@authenticated_only
def start_game(data):    
    game_id = data["game_id"]
            
    game = Game.query.get(game_id)
    user_details_white = UserDetails.query.filter_by(game_id = game_id, color = "white").first()
    user_details_black = UserDetails.query.filter_by(game_id = game_id, color = "black").first()
    user_white = User.query.get(user_details_white.user_id)
    user_black = User.query.get(user_details_black.user_id)
    
    data = {
        "game_id": game_id,
        "fen": game.fen, 
        "username_white": user_white.name, 
        "username_black": user_black.name,
        "time_white": user_details_white.time, 
        "time_black": user_details_black.time
    }
    
    socketio.emit("announce game starts", data, to = str(game_id))
    

@socketio.on("make move")
@authenticated_only
def make_move(data):
    room = data.pop("room")
    socketio.emit("announce move", data, room = str(room))


@socketio.on("resign")
@authenticated_only
def resign(data): 
    socketio.emit("announce resign", {"username": data["username"]}, room=str(data["room"]))


@socketio.on("offer draw")
@authenticated_only
def offer_draw(data): 
    socketio.emit("announce draw offered", {"username": data["username"]}, room=str(data["room"]))


@socketio.on("draw")
@authenticated_only
def respond_to_draw_offer(data): 
    socketio.emit("announce draw decision", {"accepted": data["accepted"]}, room=str(data["room"]))
    