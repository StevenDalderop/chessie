from flask import Flask
from config import Config
from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO
from flask_login import LoginManager
from flask_mail import Mail
from flask_migrate import Migrate
from flask_session import Session

import sys
import os
import stat
from stockfish import Stockfish
import logging

db = SQLAlchemy()
migrate = Migrate()
mail = Mail()
socketio = SocketIO()
login_manager = LoginManager()


def create_app(config_class=Config):
    app = Flask(__name__, static_folder="./static")
    app.config.from_object(config_class)
    db.init_app(app)
    migrate.init_app(app, db, render_as_batch=True)
    mail.init_app(app)
    socketio.init_app(app, manage_session=False)
    login_manager.init_app(app)
    
    from app.auth import bp as auth_bp
    app.register_blueprint(auth_bp)

    from app.errors import bp as errors_bp
    app.register_blueprint(errors_bp)
    
    from app.main import bp as main_bp
    app.register_blueprint(main_bp)
    
    from app.api import bp as api_bp
    app.register_blueprint(api_bp, url_prefix="/api")
        
    if sys.platform == "linux":
        os.chmod(app.config['STOCKFISH_URL_LINUX'], stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
        stockfish = Stockfish(app.config['STOCKFISH_URL_LINUX'])
    else:
        stockfish = Stockfish(app.config['STOCKFISH_URL_WINDOWS'])
    
    app.stockfish = stockfish
    return app 
    
from app import models, sockets
  