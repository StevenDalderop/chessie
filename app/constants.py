import os 
dir_path = os.path.dirname(os.path.dirname(os.path.realpath(__file__)))

STOCKFISH_WINDOWS = os.path.join(dir_path, "stockfish_20011801_x64.exe")
STOCKFISH_LINUX = os.path.join(dir_path, "stockfish_20011801_x64")
STOCKFISH_TIME_MS = 100