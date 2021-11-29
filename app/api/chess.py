from app.api.auth import token_auth
from app.api import bp
from app.api.errors import error_response

from app import db

@bp.route("/make_move/<string:uci>")
@token_auth.login_required
def make_move(uci):    
    game = token_auth.current_user().get_current_game()
    if game is None:
        return error_response(400, "user is currently not playing")
    
    if not game.is_valid_move(uci):
        return error_response(400, "invalid move")
                
    game.make_move(uci)    
    db.session.commit()      
    
    return {
        "valid": "true",
        "fen": game.fen,
        "san": game.get_san(),
        "evaluation": game.get_evaluation(),
        "result": game.result
    }

         
@bp.route("/check_move_valid/<string:uci>")
@token_auth.login_required
def check_move_valid(uci):
    game = token_auth.current_user().get_current_game()
    if game is None:
        return error_response(400, "user is currently not playing")
    
    if game.is_valid_move(uci):
        return {"valid": "true"}
    return {"valid": "false"}


@bp.route("/get_pc_move")
@token_auth.login_required
def get_pc_move():
    game = token_auth.current_user().get_current_game()
    if game is None:
        return error_response(400, "user is currently not playing")
    
    uci = game.get_ai_move()
    game.make_move(uci)
    db.session.commit()
    
    return {        
        "uci": uci,
        "fen": game.fen,
        "san": game.get_san(),
        "evaluation": game.get_evaluation(),
        "result": game.result
    }