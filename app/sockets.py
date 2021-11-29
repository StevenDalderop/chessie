from app import socketio
from app.models import * 
from flask_socketio import join_room, leave_room, disconnect, ConnectionRefusedError

from app import login_manager
from flask_login import current_user

import functools


def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            disconnect()
        else:
            return f(*args, **kwargs)
    return wrapped
    

@socketio.on("connect")
def connect(auth):
    user = None
    
    if auth and "token" in auth:
        token = auth["token"]
        user = User.check_token(token)         
 
    if user is None:
        raise ConnectionRefusedError("ws user not authenticated")
    else:
        print("ws connected")


@socketio.on("disconnect")
@authenticated_only
def disconnect():
    print("disconnect")
    if current_user.is_authenticated:
        current_user.delete_unstarted_game()
        current_user.resign_current_game()
        current_user.is_online = False
        db.session.commit()
        socketio.emit("status change", {"user": current_user.to_dict(), "is_online": False}, broadcast = True)


@socketio.on("user online")
@authenticated_only
def user_online(data):
    print(current_user.name + " online")
    current_user.is_online = True
    db.session.commit()
    socketio.emit("status change", {"user": current_user.to_dict(), "is_online": True}, broadcast = True)
    
    
@socketio.on("user offline")
@authenticated_only
def user_offline(data):
    print(current_user.name + " offline")
    current_user.delete_unstarted_game()
    current_user.resign_current_game()
    current_user.is_online = False
    db.session.commit()
    socketio.emit("status change", {"user": current_user.to_dict(), "is_online": False}, broadcast = True)


@socketio.on("online game added")
@authenticated_only
def new_online_game():
    print("game added")
    unstarted_game = current_user.get_unstarted_game()
    if unstarted_game:
        socketio.emit("game added", {"game": unstarted_game.to_dict()}, broadcast = True)

    
@socketio.on("join room")
def on_join_room(data):
    room = data["room"]
    join_room(room) 
    

@socketio.on("start game")
def start_game(data):   
    print(data)
    game_id = data["game_id"]           
    game = Game.query.get(game_id)
    online_game = game.online[0]
    socketio.emit("announce game starts", game.to_dict(), room=online_game.room)
    

@socketio.on("make move")
def make_move(data):   
    socketio.emit("announce move", data, room = data["room"])


@socketio.on("resign")
def resign(data): 
    socketio.emit("announce resign", {"username": current_user.name}, room=data["room"])


@socketio.on("offer draw")
def offer_draw(data): 
    current_user.offer_draw()
    db.session.commit()
    socketio.emit("announce draw offered", {"username": current_user.name}, room=data["room"])


@socketio.on("draw")
def respond_to_draw_offer(data): 
    if data["accepted"] and current_user.is_draw_offered():
        current_user.accept_draw()
        accepted = True
    else:
        current_user.decline_draw()
        accepted = False
    db.session.commit()
    socketio.emit("announce draw decision", {"accepted": accepted}, room=data["room"])
    