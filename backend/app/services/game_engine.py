import asyncio
import random
from typing import Dict, List
from app.schemas.game import GameStage, GameState, Winner, PlayerData
from app.services.roulette_logic import RouletteLogic

class GameEngine:
    def __init__(self):
        self.state = GameState(
            gameStage=GameStage.PLACE_BET,
            gameTimer=0,
            winningNumber=None,
            winners=[]
        )
        self.players: Dict[str, PlayerData] = {}
        self.nickname_registry: Dict[str, str] = {} # Almacén persistente de nicknames
        self.is_running = False

    async def run_loop(self, broadcast_callback):
        self.is_running = True
        while self.is_running:
            self.state.gameTimer += 1
            
            # Logic based on timer
            if self.state.gameTimer == 1:
                self.state.gameStage = GameStage.PLACE_BET
                self.state.winningNumber = None
                self.state.winners = []
            elif self.state.gameTimer == 25:
                self.state.gameStage = GameStage.NO_MORE_BETS
            elif self.state.gameTimer == 28:
                self.state.gameStage = GameStage.SPIN_WHEEL
                self.state.winningNumber = random.randint(0, 36)
            elif self.state.gameTimer == 40:
                self.state.gameStage = GameStage.WINNER
                self.calculate_results()
            elif self.state.gameTimer == 50:
                self.state.gameStage = GameStage.EMPTY_BOARD
            elif self.state.gameTimer >= 60:
                self.state.gameTimer = 0
                self.players = {} # Clear bets for next round

            await broadcast_callback(self.state.model_dump())
            await asyncio.sleep(1)

    def update_player_data(self, player_id: str, data: dict):
        new_data = PlayerData(**data)
        
        # Registrar nickname en el almacén persistente si existe
        if new_data.nickname:
            self.nickname_registry[player_id] = new_data.nickname
        # Recuperar nickname si el dato actual no lo trae
        elif player_id in self.nickname_registry:
            new_data.nickname = self.nickname_registry[player_id]
        
        self.players[player_id] = new_data

    def calculate_results(self):
        if self.state.winningNumber is None:
            return
            
        new_winners = []
        for player_id, player_data in self.players.items():
            win_amount = RouletteLogic.calculate_player_total_win(
                self.state.winningNumber, player_data
            )
            
            # Asegurar que usamos el nickname del registro si el player_data no lo tiene
            nickname = player_data.nickname or self.nickname_registry.get(player_id, "Jugador")
            
            new_winners.append(Winner(
                playerId=player_id, 
                nickname=nickname, 
                win=win_amount
            ))
        
        self.state.winners = new_winners

game_engine = GameEngine()
