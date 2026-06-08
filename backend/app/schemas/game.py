from enum import Enum
from typing import List, Optional
from pydantic import BaseModel

class GameStage(str, Enum):
    PLACE_BET = "PLACE BET"
    NO_MORE_BETS = "NO MORE BETS"
    SPIN_WHEEL = "SPIN WHEEL"
    WINNER = "WINNER"
    EMPTY_BOARD = "EMPTY BOARD"

class Bet(BaseModel):
    betAmount: int
    betSpot: str
    betLocation: dict  # {x: float, y: float}

class PlayerData(BaseModel):
    playerId: str
    nickname: Optional[str] = None
    bets: List[Bet] = []

class Winner(BaseModel):
    playerId: str
    nickname: Optional[str] = None
    win: float

class GameState(BaseModel):
    gameStage: GameStage
    gameTimer: int
    winningNumber: Optional[int] = None
    winners: List[Winner] = []
