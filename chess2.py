import asyncio
import chess
import chess.engine

async def main() -> None:
    transport, engine = await chess.engine.popen_uci("stockfish-11-win/stockfish-11-win/Windows/stockfish_20011801_x64.exe")

    board = chess.Board()
    while not board.is_game_over():
        result = await engine.play(board, chess.engine.Limit(time=0.1))
        board.push(result.move)
        print(board.fen())

    await engine.quit()

asyncio.set_event_loop_policy(chess.engine.EventLoopPolicy())
asyncio.run(main())
