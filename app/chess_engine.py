from flask import current_app
    
def get_chess_engine_move(fen, skill_level, time): 
    if not current_app.stockfish:
        return 
    stockfish = current_app.stockfish
    stockfish.set_fen_position(fen)
    stockfish.set_skill_level(skill_level)
    uci = stockfish.get_best_move_time(time)
    return uci
    
    
def get_chess_engine_evaluation(fen):
    if not current_app.stockfish:
        return 
    stockfish = current_app.stockfish
    stockfish.set_fen_position(fen)
    info = stockfish.get_evaluation()
    evaluation = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
    return evaluation  