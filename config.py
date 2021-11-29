import os 

basedir = os.path.abspath(os.path.dirname(__file__))

class Config(object):
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess'
    SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or 'sqlite:///' + os.path.join(basedir, 'app.db')
    SESSION_TYPE = os.environ.get('SESSION_TYPE') or 'filesystem'
    SQLALCHEMY_TRACK_MODIFICATIONS = os.environ.get('TRACK_MODIFICATIONS') or False
    MAIL_SERVER = os.environ.get('MAIL_SERVER')
    MAIL_PORT = int(os.environ.get('MAIL_PORT') or 25)
    MAIL_USE_TLS = os.environ.get('MAIL_USE_TLS') is not None
    MAIL_USERNAME = os.environ.get('MAIL_USERNAME')
    MAIL_PASSWORD = os.environ.get('MAIL_PASSWORD')
    ADMINS = ['your-email@example.com']
    STOCKFISH_URL_WINDOWS = os.environ.get('STOCKFISH_URL_WINDOWS') or os.path.join(basedir, "stockfish_20011801_x64.exe")
    STOCKFISH_URL_LINUX = os.environ.get('STOCKFISH_URL_LINUX') or os.path.join(basedir, "stockfish_20011801_x64")
    PER_PAGE = os.environ.get('PER_PAGE', 2)
    
    
    


