import sys
import os
import stat
from stockfish import Stockfish
from app.constants import STOCKFISH_LINUX, STOCKFISH_WINDOWS

if sys.platform == "linux":
    os.chmod(STOCKFISH_LINUX, stat.S_IXUSR | stat.S_IXGRP | stat.S_IXOTH)
    stockfish = Stockfish(STOCKFISH_LINUX)
else:
    stockfish = Stockfish(STOCKFISH_WINDOWS)