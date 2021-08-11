from .application import db
from .models import Color, GameResult, GameType 

def init_database():
    db.drop_all()
    db.create_all()

    color_white = Color(color = "white")
    color_black = Color(color = "black")
    db.session.add(color_white)
    db.session.add(color_black)
    result_win = GameResult(result = "1-0")
    result_loss = GameResult(result = "0-1")
    result_draw = GameResult(result = "1/2-1/2")
    db.session.add(result_win)
    db.session.add(result_loss)
    db.session.add(result_draw)
    type_human = GameType(type = "human")
    type_pc = GameType(type = "pc")
    type_online = GameType(type = "online")
    db.session.add(type_human)
    db.session.add(type_pc)
    db.session.add(type_online)
    db.session.commit()    