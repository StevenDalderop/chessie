import os
import unittest
from application import app
from flask import template_rendered
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
    

 
if __name__ == "__main__":
    unittest.main()