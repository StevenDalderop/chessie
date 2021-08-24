from app import db, login_manager
from flask_login import UserMixin
import datetime
import chess
import string
import random


def generate_unique_room():
    length = 10

    while True:
        room_id = ''.join(random.choices(string.ascii_lowercase, k=length))
        if OnlineGame.query.filter_by(room=room_id).count() == 0:
            break

    return room_id


@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
    
    
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) 
    name = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(100))
    is_online = db.Column(db.Boolean())
    
    def to_dict(self):
        data = {
            "id": self.id,
            "name": self.name,
            "is_online": self.is_online,
        }
        return data
        
    def get_current_game(self):
        user_details = UserDetails.query.filter_by(user_id = self.id).all()
    
        games = [Game.query.get(user_detail.game_id) for user_detail in user_details]
        current_games = [game for game in games if not game.is_finished and game.is_started]  
            
        if len(current_games) == 0:
            return None
            
        return current_games[0]
        
    def resign_current_games(self):       
        user_details = UserDetails.query.filter_by(user_id = self.id).all()
              
        for user_detail in user_details:
            color = user_detail.color
            game = Game.query.get(user_detail.game_id)
            
            if game and game.is_started and not game.is_finished:
                game.is_finished = True
                game.result_pk = "1-0" if color == "black" else "0-1"                 
        
    def get_unstarted_game(self):
        user_details = UserDetails.query.filter_by(user_id = self.id).all()
    
        games = [Game.query.get(user_detail.game_id) for user_detail in user_details]
        unstarted_games = [game for game in games if not game.is_started]
        
        if len(unstarted_games) == 0:
            return None
        
        return unstarted_games[0]
        
    def delete_unstarted_games(self):
        user_details = UserDetails.query.filter_by(user_id = self.id).all()
    
        for user_detail in user_details:
            game = Game.query.get(user_detail.game_id)
            if game and not game.is_started:
                db.session.delete(game)
                



class UserDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    color = db.Column(db.String(100), db.ForeignKey('color.color'))
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    game = db.relationship("Game", backref = db.backref("details", cascade = "all,delete"))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"))
    
    def set_color(self):
        user_count = len(UserDetails.query.filter_by(game_id = self.game_id).all())

        if user_count == 1:
            self.color = random.choice(["white", "black"])
        
        if user_count == 2:
            opponent = UserDetails.query.filter(UserDetails.game_id == self.game_id).filter(UserDetails.user_id != self.user_id).first()
            color_opponent = opponent.color
            if color_opponent == "white":
                self.color = "black"
            else:
                self.color = "white" 

    def to_dict(self):
        user = User.query.get(self.user_id)
        
        data = user.to_dict()
        
        data["time"] = self.time
        data["color"] = self.color
        
        return data
        
    
class Game(db.Model):   
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    fen = db.Column(db.String(100), default=chess.STARTING_FEN)
    moves = db.Column(db.String(100))
    type_pk = db.Column(db.String(100), db.ForeignKey('game_type.type'), nullable=False)
    type = db.relationship("GameType")  
    is_started = db.Column(db.Boolean)
    is_finished = db.Column(db.Boolean, default=False)    
    result_pk = db.Column(db.String, db.ForeignKey('game_result.result'))
    result = db.relationship("GameResult")
    timestamp_start = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def to_dict(self):
        user_details = self.details 
        users = [user.to_dict() for user in user_details]
    
        data = {
            "id": self.id,
            "users": users,
            "time": self.time,
            "fen": self.fen,
            "moves": self.moves,
            "type": self.type_pk,
            "is_started": self.is_started,
            "is_finished": self.is_finished,
            "result": self.result_pk,
            "timestamp": self.timestamp_start.replace(microsecond=0).isoformat()
        }    

        if self.type_pk == "pc":
            pc_game = self.pc[0]
            data["skill_level"] = pc_game.skill_level
            data["pc_name"] = pc_game.get_username()
        
        if self.type_pk == "online":
            online_game = self.online[0]
            data["room"] = online_game.room
           
        return data                     
        

class PCGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    game = db.relationship("Game", backref=db.backref("pc", cascade = "all,delete"))    
    skill_level = db.Column(db.Integer)
    
    def get_username(self):
        return f"Stockfish (level: {self.skill_level})"
        

class OnlineGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    game = db.relationship("Game", backref=db.backref("online", cascade = "all,delete"))
    room = db.Column(db.String(10), default=generate_unique_room)


class Color(db.Model):
    __tablename__ = "color"
    color = db.Column(db.String(100), primary_key=True)       
  
  
class GameResult(db.Model):  
    __tablename__ = "game_result"
    result = db.Column(db.String(100), primary_key=True)
 
 
class GameType(db.Model):
    __tablename__ = "game_type"
    type = db.Column(db.String(100), primary_key=True)