import os
import unittest
from application import app, socketio
from flask import template_rendered
from flask_socketio import SocketIO
from contextlib import contextmanager
import chess
from  unittest.mock import patch
import application

@contextmanager
def captured_templates(app):
    recorded = []
    def record(sender, template, context, **extra):
        recorded.append((template, context))
    template_rendered.connect(record, app)
    try:
        yield recorded
    finally:
        template_rendered.disconnect(record, app)
 
class Tests(unittest.TestCase):
 
    ############################
    #### setup and teardown ####
    ############################
 
    # executed prior to each test
    def setUp(self):
        app.config['TESTING'] = True
        app.config['WTF_CSRF_ENABLED'] = False
        app.config['DEBUG'] = False
        self.app = app.test_client()
 
    # executed after each test
    def tearDown(self):
        pass
 
 
    ###############
    #### tests ####
    ###############
 
    def test_main_page(self):
        response = self.app.get('/', follow_redirects=True)
        self.assertEqual(response.status_code, 200)
 
    def test_game_id(self):
        application.game_id_last = 0
        with captured_templates(app) as templates:
            r = self.app.get('/')
            template, context = templates[0]
            self.assertEqual(context['game_id'], 1)


    def test_game_id_1(self):
        application.game_id_last = 1
        with captured_templates(app) as templates:
            r = self.app.get('/')
            template, context = templates[0]
            self.assertEqual(context['game_id'], 2)

    def test_game_id_99(self):
        application.game_id_last = 99
        with captured_templates(app) as templates:
            r = self.app.get('/')
            template, context = templates[0]
            self.assertEqual(context['game_id'], 0)
    
    def test_board(self):
        with captured_templates(app) as templates:
            r = self.app.get('/')
            template, context = templates[0]
            self.assertEqual(context['board'], chess.Board().fen())

    def test_boards_global(self):
        application.boards = {"5": chess.Board()}
        application.game_id_last = 5
        with captured_templates(app) as templates:
            r = self.app.get('/')
            template, context = templates[0]
            self.assertEqual(application.boards, {"5": chess.Board(), "6": chess.Board()})
    
    def test_promotion_true(self):
        application.boards = {"0": chess.Board(fen="8/7P/8/8/8/8/8/8")}
        application.game_id_last = 0
        r = self.app.get("/check_promotion_valid/0/1/7/0/7")
        self.assertEqual(r.get_json()["validated"], "true")

    def test_promotion_false(self):
        application.boards = {"0": chess.Board(fen="8/8/7P/8/8/8/8/8")}
        application.game_id_last = 0
        r = self.app.get("/check_promotion_valid/0/2/7/1/7")
        self.assertEqual(r.get_json()["validated"], "false")

    def test_promotion_when_checked(self):
        application.boards = {"0": chess.Board(fen="2r5/7P/8/8/8/8/8/2K5")}
        application.game_id_last = 0
        r = self.app.get("/check_promotion_valid/0/1/7/0/7")
        self.assertEqual(r.get_json()["validated"], "false") 
    
    def test_validate_move_true(self):
        application.boards = {"0": chess.Board()}
        application.game_id_last = 0
        r = self.app.get("/validated_move_info/0/6/4/4/4")
        self.assertEqual(r.get_json()["validated"], "true")

    def test_validate_move_false(self):
        application.boards = {"0": chess.Board()}
        application.game_id_last = 0
        r = self.app.get("/validated_move_info/0/6/4/3/4")
        self.assertEqual(r.get_json()["validated"], "false")
    
    def test_validate_move_match(self):
        application.boards = {"0": chess.Board()}
        application.game_id_last = 0
        r = self.app.get("/validated_move_info/0/6/4/4/4")
        r = self.app.get("/validated_move_info/0/1/4/3/4")
        r = self.app.get("/validated_move_info/0/7/3/3/7")
        r = self.app.get("/validated_move_info/0/1/0/2/0")
        r = self.app.get("/validated_move_info/0/7/5/4/2")
        r = self.app.get("/validated_move_info/0/2/0/3/0")
        r = self.app.get("/validated_move_info/0/3/7/1/5")
        self.assertEqual(r.get_json()["result"], "1-0")
        self.assertEqual(r.get_json()["fen"].split(" ")[0], "rnbqkbnr/1ppp1Qpp/8/p3p3/2B1P3/8/PPPP1PPP/RNB1K1NR")
        self.assertEqual(r.get_json()["moves_san"], "1. e4 e5 2. Qh5 a6 3. Bc4 a5 4. Qxf7#")
        self.assertEqual(r.get_json()["last_move"], 0)

    def test_validate_move_score(self):
        application.boards = {"0": chess.Board()}
        application.game_id_last = 0
        r = self.app.get("/validated_move_info/0/6/4/4/4")
        self.assertGreater(r.get_json()["score"], 0)
    
    def test_validate_move_score_negative(self):
        application.boards = {"0": chess.Board()}
        application.game_id_last = 0
        r = self.app.get("/validated_move_info/0/6/7/4/7")
        self.assertLess(r.get_json()["score"], 0)

    def test_new_game(self):
        application.boards = {"0": chess.Board()}
        application.game_id_last = 0
        r = self.app.get("/new_game")
        self.assertEqual(r.get_json()["new_game"], "true")
        self.assertEqual(r.get_json()["game_id"], 1)
        self.assertEqual(application.boards, {"0": chess.Board(), "1": chess.Board()})
        self.assertEqual(application.game_id_last, 1)

    def test_move_pc(self):
        application.boards = {"0": chess.Board()}
        r = self.app.get("/get_pc_move/0/5")
        data = r.get_json()
        self.assertGreater(len(r.get_json()["fen"]), 7)
        self.assertIn("1. ", r.get_json()["moves_san"])
        self.assertEqual(data["last_move"], 0)
        self.assertGreater(data["score"], -100)
        self.assertEqual(data["result"], None)
        self.assertIn(data["uci"][0], ["a", "b", "c", "d", "e", "f", "g", "h"])
        
    def test_match_pc(self):
        application.boards = {"0": chess.Board()}
        result = None
        while not result:
            r = self.app.get("/get_pc_move/0/5")
            data = r.get_json()
            result = data["result"]
        self.assertIn(result, ["1-0", "0-1", "1/2-1/2"])

class TestSocketIO(unittest.TestCase):
    def setUp(self):
        pass

    def tearDown(self):
        pass

    def test_connect(self):
        client = socketio.test_client(app)
        r = client.get_received()
        self.assertEqual(r[0]['name'], 'announce games available')
        self.assertEqual(r[1]['name'], 'announce user')

    def test_user_online(self):
        client = socketio.test_client(app)
        r = client.get_received()
        client.emit("add user online", {"username": "test_username", "time": "test_time"})
        r = client.get_received()
        self.assertEqual(len(r), 1)
        self.assertEqual(r[0]['args'][0]['users_online'][0]["username"], 'test_username')
        self.assertEqual(r[0]['args'][0]['users_online'][0]["last_seen"], 'test_time')

    # def test_new_game(self): 
    #     application.room = 5
    #     with captured_templates(app) as templates:
    #         client = socketio.test_client(app)
    #         client.emit("new game", {"username": "test_username", "game_id": "0", "time": "180"})
    #         r = client.get_received()
    #         self.assertEqual(r[0]['args'][0]['games_available'][0], {"game_id": "0", "room": 6, "time": "180", "username": "test_username"})

if __name__ == "__main__":
    unittest.main()