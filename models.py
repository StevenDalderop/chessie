from .application import db
from flask_login import UserMixin

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True) 
    name = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(100))
    is_authenticated = db.Column(db.Boolean())
    is_active = db.Column(db.Boolean)
    is_anonymous = db.Column(db.Boolean)

class UserDetails(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    color = db.Column(db.String(100), db.ForeignKey('color.color'))
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))

class Color(db.Model):
    __tablename__ = "color"
    color = db.Column(db.String(100), primary_key=True)
    
class Game(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    fen = db.Column(db.String(100))
    moves = db.Column(db.String(100))
    type_pk = db.Column(db.String(100), db.ForeignKey('game_type.type'), nullable=False)
    type = db.relationship("GameType")    
    is_finished = db.Column(db.Boolean)    
    result_pk = db.Column(db.String, db.ForeignKey('game_result.result'))
    result = db.relationship("GameResult")    
    
class GameResult(db.Model):  
    __tablename__ = "game_result"
    result = db.Column(db.String(100), primary_key=True)
    
class GameType(db.Model):
    __tablename__ = "game_type"
    type = db.Column(db.String(100), primary_key=True)