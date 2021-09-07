from app import socketio, login_manager
from app.models import * 
from flask_socketio import join_room, leave_room, disconnect
from flask_login import current_user
import functools


def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        if not current_user.is_authenticated:
            print("not authenticated")
            disconnect()
        else:
            return f(*args, **kwargs)
    return wrapped
    
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
    