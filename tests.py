from config import Config
import unittest
from app import db, create_app
from app.init_database import init_database
from app.models import * 

class TestConfig(Config):
    testing = True
    SQLALCHEMY_DATABASE_URI = 'sqlite://'


class UserModelCase(unittest.TestCase):
    def setUp(self):
        self.app = create_app(TestConfig)
        self.app_context = self.app.app_context()
        self.app_context.push()
        db.create_all()
        init_database()
           
    def tearDown(self):
        db.session.remove()
        db.drop_all()
        self.app_context.pop()
        
    def test_password_hashing(self):
        u = User(name = "henk")
        u.set_password("cat")
        self.assertFalse(u.verify_password("dog"))
        self.assertTrue(u.verify_password("cat"))
    
    def test_get_current_game(self):
        u = User()
        db.session.add(u)
        db.session.commit()
        
        self.assertEqual(u.get_current_game(), None)
        
        game = {
            "time": 600,
            "game_type": "pc",
            "skill_level": 10
        }
        
        g = u.create_game(game)
        
        self.assertEqual(u.get_current_game().id, g.id)
        
    
    def test_create_game(self):
        game = {
            "time": 600,
            "game_type": "pc",
            "skill_level": 10
        }
        
        u = User(name="henk")
        db.session.add(u)
        db.session.commit()
        
        self.assertEqual(u.games.all(), [])
        game = u.create_game(game)
               
        self.assertEqual(game.type, "pc")
        self.assertEqual(game.time, 600)
        self.assertEqual(game.pc[0].skill_level, 10)        
        self.assertEqual(u.games[0].id, game.id)
        
    def test_resign_game(self):
        u = User(name = "henk")
        db.session.add(u)
        db.session.commit()
        
        game = {
            "time": 600,
            "game_type": "pc",
            "skill_level": 10
        }
        
        game = u.create_game(game)
        u.resign_current_game()
        
        result = u.get_finished_games()[0].result
        
        self.assertTrue(result == "0-1" or result == "1-0")
        
        
        

if __name__ == '__main__':
    unittest.main()        
        