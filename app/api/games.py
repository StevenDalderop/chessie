from app.api import bp
from app.api.errors import error_response
from app.api.auth import token_auth
from app.models import Game, User
from app import db

from flask import request

from datetime import datetime, timedelta


@bp.route("/games") 
@token_auth.login_required
def get_games(): 
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 10)), 100)
    
    is_started = request.args.get('is_started')
    type = request.args.get('type')
   
    games = Game.query
    if is_started is not None:
        games = Game.query.filter_by(is_started = is_started)
    if type is not None:
        games = games.filter_by(type = type)
    
    user_online = request.args.get('user_online', False)
    if user_online:
        games.filter((Game.timestamp_start > datetime.utcnow() - timedelta(seconds = 300)) & User.is_online)
    
    data = Game.to_collection_dict(games, page, per_page, 'api.get_games')
    return data


@bp.route("/games/<int:id>", methods=["GET"])
@token_auth.login_required
def get_game(id):
    game = Game.query.get_or_404().to_dict()
    return game


@bp.route("/users/<int:id>/games", methods=["GET"])
@token_auth.login_required
def get_user_games(id):
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 10)), 100)
    
    user = User.query.get_or_404(id)

    data = Game.to_collection_dict(user.games, page, per_page, 'api.get_user_games', id=id)
    return data
    
    
@bp.route("/me/games", methods=["GET"])
@token_auth.login_required
def get_my_games():  
    page = int(request.args.get('page', 1))
    per_page = min(int(request.args.get('per_page', 10)), 100)
    is_finished = request.args.get('is_finished')
    
    user = token_auth.current_user()
    
    query = user.games
    if is_finished is not None:
        query = query.filter_by(is_finished = is_finished)
    
    query = query.order_by(Game.timestamp_start.desc())
    data = Game.to_collection_dict(query, page, per_page, 'api.get_my_games')
    return data      
    
       
@bp.route("/me/games/current")
@token_auth.login_required
def get_current_game():    
    current_game = current_user.get_current_game()
    if current_game:    
        return current_game.to_dict()
    return "", 204

 
@bp.route("/me/games", methods=["POST"])
@token_auth.login_required
def create_new_game():  
    data = request.get_json() or {}
    
    if 'time' not in data or 'game_type' not in data:
        return error_response(400, 'provide time and game_type')
    if data['game_type'] == "pc" and 'skill_level' not in data:
        return error_response(400, 'provide pc skill level')
        
    if token_auth.current_user().get_current_game():
        return error_response(400, "already game in progress")
        
    game = token_auth.current_user().create_game(data)        
    db.session.commit()
    
    return game.to_dict(), 201 


@bp.route("/me/games/resign")
@token_auth.login_required
def resign():               
    token_auth.current_user().resign_current_game()
    db.session.commit()   
    return "", 204
    
    
@bp.route("/games/<int:id>/join-game", methods=["PUT"])
@token_auth.login_required
def join_game(id):
    current_user = token_auth.current_user()
    
    if current_user.get_current_game():
        return error_response(400, "user is playing other game")
    
    game = Game.query.get(id)
    if not game:
        return error_response(400, "game does not exist")   
    
    if game.is_started:
        return error_response(400, "game is already started")

    current_user.join_game(game)
    db.session.commit()
    
    return game.to_dict(), 200
   

@bp.route("/me/leave-games")
@token_auth.login_required
def leave_games(): 
    current_user = token_auth.current_user()
    current_user.delete_unstarted_game()
    current_user.resign_current_game()    
    db.session.commit()
    return "", 204      
    