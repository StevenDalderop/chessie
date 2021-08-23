import chess

def get_evaluation(stockfish, fen):
    stockfish.set_fen_position(fen)
    info = stockfish.get_evaluation()
    evaluation = None if len(info) == 0 else None if info["type"] != "cp" else info["value"]
    return evaluation

    
def get_san(moves):
    starting_board = chess.Board()
    if moves:
        move_stack = [chess.Move.from_uci(uci) for uci in moves.split()]
    else:
        move_stack = []
    moves_san = starting_board.variation_san(move_stack)
    return moves_san
   