from app import app, db
from app.models import *
from app.constants import *

from flask import render_template, request, Response, redirect, url_for
from flask_login import login_required, current_user  

@app.route("/")
@login_required
def index():
    return render_template("index.html")


@app.route("/api/make_move/<int:game_id>/<string:uci>")
@login_required
def make_move(game_id, uci):    
    game = current_user.get_current_game()
    if game is None:
        return {"message": "user is currently not playing"}, 400
    
    if not game.is_valid_move(uci):
        return {"message": "invalid move"}, 400
                
    game.make_move(uci)    
    db.session.commit()      
    
    return {
        "valid": "true",
        "fen": game.fen,
        "san": game.get_san(),
        "evaluation": game.get_evaluation(),
        "result": game.result
    }

         
@app.route("/api/check_promotion_valid/<int:game_id>/<string:uci>")
@login_required
def check_promotion_valid(game_id, uci):
    game = current_user.get_current_game()
    if game is None:
        return {"message": "user is currently not playing"}, 400
    
    if game.is_valid_move(uci):
        return {"valid": "true"}
    return {"valid": "false"}


@app.route("/api/get_pc_move/<int:game_id>/<int:skill_level>")
@login_required
def get_pc_move(game_id, skill_level):
    game = current_user.get_current_game()
    if game is None:
        return {"message": "user is currently not playing"}, 400
    
    uci = game.get_ai_move(STOCKFISH_TIME_MS)
    game.make_move(uci)
    db.session.commit()
    
    return {        
        "uci": uci,
        "fen": game.fen,
        "san": game.get_san(),
        "evaluation": game.get_evaluation(),
        "result": game.result
    }

 
@app.route("/api/games") 
@login_required   
def get_games_available():   
    games = Game.query.filter_by(is_started = False, type = "online").all()
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
    data = request.get_json() or {}
    
    if 'time' not in data or 'game_type' not in data:
        return 'provide time and game_type', 400
    if data['game_type'] == "pc" and 'skill_level' not in data:
        return 'provide pc skill level', 400 
        
    if current_user.get_current_game():
        return "already game in progress", 400
        
    game = current_user.create_game(data)        
    db.session.commit()
    
    return game.to_dict(), 201


@app.route("/api/me/game/resign")
@login_required
def resign():               
    current_user.resign_current_game()
    db.session.commit()   
    return "", 200 
    

@app.route("/api/join-game", methods=["POST"])
@login_required
def join_game():
    game_id = request.json.get("game_id")
    
    if current_user.get_current_game():
        return {"error": "user is playing other game"}, 400
    
    game = Game.query.get(game_id)
    if not game:
        return {"error": "game does not exist"}, 400    
    
    if game.is_started:
        return {"error": "game is already started"}, 400
        
    current_user.join_game(game)
    db.session.commit()
    
    return game.to_dict(), 200
   

@app.route("/api/me/leave-games")
@login_required
def leave_games():       
    current_user.delete_unstarted_game()
    current_user.resign_current_game()    
    db.session.commit()
    return "", 200  


@app.route("/api/me/results")
@login_required
def get_results():    
    games = current_user.get_finished_games()
    results = [game.to_dict() for game in games]
    return {"results": results}       
    