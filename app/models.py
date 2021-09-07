from app import app, db, login_manager
from app.stockfish import stockfish
from flask_login import UserMixin
import datetime
from time import time
import chess
import string
import random
import jwt
from werkzeug.security import generate_password_hash, check_password_hash


def generate_unique_room():
    length = 10

    while True:
        room_id = ''.join(random.choices(string.ascii_lowercase, k=length))
        if OnlineGame.query.filter_by(room=room_id).count() == 0:
            break

    return room_id


def set_color(context):
    game_id = context.get_current_parameters()['game_id']
    
    user_details = UserDetails.query.filter_by(game_id = game_id).all()

    if len(user_details) == 0:
        color = random.choice(["white", "black"])
    
    if len(user_details) == 1:
        opponent = user_details[0]
        color_opponent = opponent.color
        if color_opponent == "white":
            color = "black"
        else:
            color = "white"

    return color


def is_game_started(context):
    game_type = context.get_current_parameters()['type']
    
    if game_type == "online":
        return False
    return True
    

@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))
    
    
class User(UserMixin, db.Model):    
    id = db.Column(db.Integer, primary_key=True) 
    name = db.Column(db.String(100), unique=True)
    email = db.Column(db.String(100), unique=True)
    password_hash = db.Column(db.String(100))
    is_online = db.Column(db.Boolean())
    details = db.relationship("UserDetails", cascade="all,delete", backref = "user", lazy="dynamic")
    games = db.relationship("Game", secondary="user_details", backref = "users", viewonly=True, lazy="dynamic")
    
    def __repr__(self):
        return '<User {}>'.format(self.name)
    
    def to_dict(self):
        data = {
            "id": self.id,
            "name": self.name,
            "is_online": self.is_online,
        }
        return data
        
    def get_password_reset_token(self, expires_in=600):
        token = jwt.encode(
                {"reset_password": self.id, "exp": time() + expires_in}, 
                app.config["SECRET_KEY"], algorithm="HS256")
        return token 
    
    @staticmethod
    def verify_password_reset_token(token):
        try:
            id = jwt.decode(token, app.config["SECRET_KEY"], algorithms=["HS256"])["reset_password"]
        except:
            return 
        return User.query.get(id)  

    def set_password(self, password):
        password_hash = generate_password_hash(password)
        self.password_hash = password_hash        
        
    def get_finished_games(self):
        games = self.games.filter_by(is_finished = True).all()
        return games
        
    def get_current_game(self):    
        current_game = self.games.filter_by(is_finished = False, is_started = True).first()                         
        return current_game
        
    def get_unstarted_game(self):   
        unstarted_game = self.games.filter_by(is_started = False).first()        
        return unstarted_game
        
    def resign_current_game(self):
        game = self.games.filter_by(is_finished = False, is_started = True).first()
        
        if game:
            color = game.details.filter_by(user_id = self.id).first().color
            game.is_finished = True
            game.result = "1-0" if color == "black" else "0-1"                  
            
    def delete_unstarted_game(self):  
        game = self.games.filter_by(is_started = False).first()
        
        if game:
            db.session.delete(game)
    
    def create_game(self, data):
        self.delete_unstarted_game()
        if self.get_current_game():
            return None
            
        game = Game(time = data['time'], type = data['game_type'])
        db.session.add(game)
       
        if game.type == "pc":
            pc_game = PCGame(game = game, skill_level = data['skill_level'])
            db.session.add(pc_game)
            
        if game.type == "online":
            online_game = OnlineGame(game = game)
            db.session.add(online_game)
        
        user_details = UserDetails(time = data['time'])
        game.details.append(user_details)
        self.details.append(user_details)
        return game
        
    def join_game(self, game):
        self.delete_unstarted_game()
        
        game.is_started = True
        user_details = UserDetails(time = game.time)
        
        self.details.append(user_details)
        game.details.append(user_details)           
        
           
class UserDetails(db.Model):
    __tablename__ = "user_details"
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    color = db.Column(db.String(100), db.ForeignKey('color.color'), nullable=False, default=set_color)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'))
    
    def to_dict(self):       
        data = self.user.to_dict()        
        data["time"] = self.time
        data["color"] = self.color        
        return data
        
  
class Game(db.Model):  
    id = db.Column(db.Integer, primary_key=True)
    time = db.Column(db.Integer)
    fen = db.Column(db.String(100), default=chess.STARTING_FEN)
    moves = db.Column(db.String(100))
    type = db.Column(db.String(100), db.ForeignKey('game_type.type'), nullable=False)
    is_started = db.Column(db.Boolean, default=is_game_started)
    is_finished = db.Column(db.Boolean, default=False)    
    result = db.Column(db.String(100), db.ForeignKey('game_result.result'))
    timestamp_start = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    details = db.relationship("UserDetails", cascade="all,delete", backref = "game", lazy="dynamic")
    
    def __repr__(self):
        return '<Game {}>'.format(self.type)
    
    def to_dict(self):
        user_details = self.details 
        users = [user.to_dict() for user in user_details]
    
        data = {
            "id": self.id,
            "users": users,
            "time": self.time,
            "fen": self.fen,
            "moves": self.moves,
            "type": self.type,
            "is_started": self.is_started,
            "is_finished": self.is_finished,
            "result": self.result,
            "timestamp": self.timestamp_start.replace(microsecond=0).isoformat()
        }    

        if self.type == "pc":
            pc_game = self.pc[0]
            data["skill_level"] = pc_game.skill_level
            data["pc_name"] = pc_game.get_username()
        
        if self.type == "online":
            online_game = self.online[0]
            data["room"] = online_game.room
           
        return data                     
        
    def is_valid_move(self, uci):
        board = chess.Board(self.fen) 
        move = chess.Move.from_uci(uci)
    
        if move in board.legal_moves:
            return True
        return False
        
    def get_san(self):
        starting_board = chess.Board()
        
        if self.moves:
            move_stack = [chess.Move.from_uci(uci) for uci in self.moves.split()]
        else:
            move_stack = []
            
        san = starting_board.variation_san(move_stack)
        return san 
        
    def get_evaluation(self):
        stockfish.set_fen_position(self.fen)
        info = stockfish.get_evaluation()
        evaluation = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
        return evaluation        
        
    def make_move(self, uci):
        board = chess.Board(self.fen)    
        move = chess.Move.from_uci(uci)
        board.push(move)
        fen = board.fen()
        self.fen = fen 
        
        if self.moves:
            self.moves = self.moves + " " + uci
        else: 
            self.moves = uci
            
        if board.is_game_over():
            self.result = board.result()
            self.is_finished = True  

    def get_ai_move(self, time=100):
        stockfish.set_skill_level(self.pc[0].skill_level)
        stockfish.set_fen_position(self.fen)
        uci = stockfish.get_best_move_time(time)
        return uci


class PCGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    game = db.relationship("Game", backref="pc")    
    skill_level = db.Column(db.Integer)
    
    def get_username(self):
        return f"Stockfish (level: {self.skill_level})"
        

class OnlineGame(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    game_id = db.Column(db.Integer, db.ForeignKey('game.id', ondelete="CASCADE"))
    game = db.relationship("Game", backref="online")
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