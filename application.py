import functools
from flask import render_template, Flask, request, session, Response, redirect, url_for
from flask_socketio import SocketIO, join_room, leave_room, disconnect
from flask_login import LoginManager, login_required, login_user, logout_user, current_user
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash
import chess
import sys
import os
import stat
from stockfish import Stockfish
import datetime
import sqlite3
from .config import Config
from .constants import *

app = Flask(__name__)
app.config.from_object(Config)
socketio = SocketIO(app)

login_manager = LoginManager()
login_manager.init_app(app)

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
            print("not authenticated")
            disconnect()
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
        return redirect(url_for("signup"))
    
    new_user = User(name=name, password_hash=generate_password_hash(password), is_online = True)
    db.session.add(new_user)
    db.session.commit()
    return redirect(url_for("not_found"))        
    

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
    return redirect(url_for("login"))


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
    games = Game.query.filter_by(is_started = False, type_pk = "online").all()
    data = [game.to_dict() for game in games]  
    return {"games_available": data}, 200


@app.route("/api/users")
@login_required
def get_users():
    users = User.query.filter_by(is_online = True).all()
    data = [user.to_dict() for user in users]
    return {"users_online": data}, 200
    

@app.route("/api/me/game")
@login_required
def get_current_game():    
    current_game = current_user.get_current_game()
    return {"current_game": current_game.to_dict()}, 200
    
    
@app.route("/api/me/game", methods=["POST"])
@login_required
def create_new_game(): 
    user_id = current_user.get_id()  
    
    time = int(request.json["time"])
    vs = request.json["game_type"]
    skill_level = request.json.get("skill_level")
    
    game_type = GameType.query.get(vs)
    is_started = vs != "online"
    game = Game(time = time, type = game_type, is_started = is_started, is_finished = False)
    db.session.add(game)
    db.session.commit()
    
    if game_type.type == "pc":
        pc_game = PCGame(game_id = game.id, skill_level = skill_level)
        db.session.add(pc_game)
        db.session.commit()
        
    if game_type.type == "online":
        online_game = OnlineGame(game_id = game.id, game = game)
        db.session.add(online_game)
        db.session.commit()
    
    user_details = UserDetails(time = time, game_id = game.id, user_id = user_id)
    db.session.add(user_details)
    db.session.commit()
    user_details.set_color()
    db.session.commit()
    
    return game.to_dict(), 201


@app.route("/api/me/game/resign")
@login_required
def resign():               
    current_user.resign_current_games()
    db.session.commit()
    
    return "", 200 
    

@app.route("/api/join-game", methods=["POST"])
@login_required
def join_game():
    game_id = request.json.get("game_id")

    game = Game.query.get(game_id)
    if not game:
        return {"error": "game does not exist"}, 400
    
    game.is_started = True
    user_details = UserDetails(time = game.time, user_id = current_user.get_id(), game_id = game.id)    
    db.session.add(user_details)
    db.session.commit()
    
    user_details.set_color()
    db.session.commit()
    return game.to_dict(), 200
   

@app.route("/api/me/leave-games")
@login_required
def leave_games():       
    current_user.delete_unstarted_games()
    current_user.resign_current_games()    
    db.session.commit()
    return "", 200  


@app.route("/api/me/results")
@login_required
def get_results():    
    current_user_id = current_user.get_id()
    user_details = UserDetails.query.filter_by(user_id = current_user.get_id()).all()
    
    games = []
    for user_detail in user_details:
        game = Game.query.get(user_detail.game_id)
        if not game.is_finished or game.type_pk == "human":
            continue
        
        games.append(game.to_dict())
    return {"results": games}       


@socketio.on("connect")
def connect():
    pass

@socketio.on("disconnect")
def disconnect():
    pass

#@socketio.on("disconnect")
#@authenticated_only
#def disconnect():
#    print("disconnect")

 #   current_game = current_user.get_current_game()
  #  if current_game and not current_game.is_started and current_game.type_pk == "online":
   #     socketio.emit("game change", {"game": current_game.to_dict(), "added": False}, broadcast = True)
   # current_user.delete_unstarted_games()
   # current_user.resign_current_game()    
   # db.session.commit()


@socketio.on("user online")
def user_online(data):
    username = data["username"]
    print(f"user {username} online")
    user = User.query.filter_by(name = username).first()
    
    if user:
        socketio.emit("status change", {"user": user.to_dict(), "is_online": True}, broadcast = True)
    
    
@socketio.on("user offline")
def user_offline(data):
    username = data["username"]
    print(f"user {username} offline")
    user = User.query.filter_by(name = username).first()
    
    if user:
        socketio.emit("status change", {"user": user.to_dict(), "is_online": False}, broadcast = True)


@socketio.on("online game added")
@authenticated_only
def new_online_game():
    print("game added")
    unstarted_game = current_user.get_unstarted_game()
    if unstarted_game:
        socketio.emit("game added", {"game": unstarted_game.to_dict()}, broadcast = True)

    
@socketio.on("join room")
@authenticated_only
def on_join_room(data):
    room = data["room"]
    join_room(room) 


@socketio.on("leave room")
@authenticated_only
def on_leave_room(data):
    room = data["room"]
    leave_room(room)
    

@socketio.on("start game")
@authenticated_only
def start_game(data):    
    game_id = data["game_id"]           
    game = Game.query.get(game_id)
    online_game = game.online[0]
    socketio.emit("announce game starts", game.to_dict(), room=online_game.room)
    

@socketio.on("make move")
@authenticated_only
def make_move(data):   
    socketio.emit("announce move", data, room = data["room"])


@socketio.on("resign")
@authenticated_only
def resign(data): 
    socketio.emit("announce resign", {"username": data["username"]}, room=data["room"])


@socketio.on("offer draw")
@authenticated_only
def offer_draw(data): 
    socketio.emit("announce draw offered", {"username": data["username"]}, room=data["room"])


@socketio.on("draw")
@authenticated_only
def respond_to_draw_offer(data): 
    socketio.emit("announce draw decision", {"accepted": data["accepted"]}, room=data["room"])
    