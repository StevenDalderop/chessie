from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_login import LoginManager

app = Flask(__name__, static_folder="../static")
app.config.from_object(Config)
db = SQLAlchemy(app)
socketio = SocketIO(app)

login_manager = LoginManager()
login_manager.init_app(app)

from app import routes, models