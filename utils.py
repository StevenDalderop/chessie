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
    
def get_move(row_start, col_start, row_end, col_end, promotion):
    if (promotion):
        pieces = {"queen": chess.QUEEN, "bishop": chess.BISHOP, "knight": chess.KNIGHT, "rook": chess.ROOK}
        promotion = pieces[promotion]

    human_move = chess.Move(chess.square(col_start, 7 - row_start), chess.square(col_end, 7 - row_end), promotion)
    return human_move