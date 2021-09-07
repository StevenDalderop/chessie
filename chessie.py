from app import app, socketio, db 
from app.models import User, UserDetails, Game, PCGame, OnlineGame, GameType, GameResult, Color

if __name__ == '__main__':
    socketio.run(app, debug = True)
    
@app.shell_context_processor
def make_shell_context():
    return {'db': db, 'User': User, 'Game': Game, 'UserDetails': UserDetails, 'PCGame': PCGame, 'OnlineGame': OnlineGame, 'GameType': GameType,
            'GameResult': GameResult, 'Color': Color}