from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate

app = Flask(__name__, static_folder="../static")
app.config.from_object(Config)
db = SQLAlchemy(app)
migrate = Migrate(app, db, render_as_batch=True)
mail = Mail(app)
socketio = SocketIO(app)
login_manager = LoginManager(app)

from app import routes, models, socket_events

from app.auth import bp as auth_bp
app.register_blueprint(auth_bp)

from app.errors import bp as errors_bp
app.register_blueprint(errors_bp)
    