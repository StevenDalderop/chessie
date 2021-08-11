from .application import db
from flask_login import UserMixin
import datetime

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) 
    name = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(100))
    is_authenticated = db.Column(db.Boolean())
    is_active = db.Column(db.Boolean)
    is_anonymous = db.Column(db.Boolean)
    is_online = db.Column(db.Boolean())

class UserDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    color = db.Column(db.String(100), db.ForeignKey('color.color'))
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    game = db.relationship("Game", backref = db.backref("details", cascade = "all,delete"))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id', ondelete="CASCADE"))

class Color(db.Model):
    __tablename__ = "color"
    color = db.Column(db.String(100), primary_key=True)
    
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    fen = db.Column(db.String(100))
    moves = db.Column(db.String(100))
    type_pk = db.Column(db.String(100), db.ForeignKey('game_type.type'), nullable=False)
    type = db.relationship("GameType")  
    is_started = db.Column(db.Boolean)
    is_finished = db.Column(db.Boolean)    
    result_pk = db.Column(db.String, db.ForeignKey('game_result.result'))
    result = db.relationship("GameResult")
    timestamp_start = db.Column(db.DateTime, default=datetime.datetime.utcnow)

    def get_json(self):
        json = {
            "id": self.id,
            "time": self.time,
            "fen": self.fen,
            "moves": self.moves,
            "type": self.type_pk,
            "is_started": self.is_started,
            "is_finished": self.is_finished,
            "result": self.result_pk,
            "timestamp": self.timestamp_start
        }
        
        if self.type_pk == "pc": 
            json["skill_level"] = PCGame.query.filter_by(game_id = self.id).first().skill_level
        
        return json
        

class PCGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    skill_level = db.Column(db.Integer)
    
    def get_username(self):
        return f"Stockfish (level: {self.skill_level})"
    
class GameResult(db.Model):  
    __tablename__ = "game_result"
    result = db.Column(db.String(100), primary_key=True)
    
class GameType(db.Model):
    __tablename__ = "game_type"
    type = db.Column(db.String(100), primary_key=True)