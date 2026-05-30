from typing import List, Union
from app.schemas.game import Bet, Winner, PlayerData

BLACKS = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35]
REDS = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

class RouletteLogic:
    @staticmethod
    def get_bet_type(bet_spot: str) -> str:
        mapping = {
            '1ST12': 'numbers_1_12',
            '2ND12': 'numbers_2_12',
            '3RD12': 'numbers_3_12',
            '1TO18': 'numbers_1_18',
            '19TO36': 'numbers_19_36',
            '2TO1_1': 'first_line',
            '2TO1_2': 'second_line',
            '2TO1_3': 'third_line',
            'RED': 'red',
            'BLACK': 'black',
            'EVEN': 'even',
            'ODD': 'odd',
            '0': 'zero'
        }
        return mapping.get(bet_spot, 'number')

    @staticmethod
    def get_line_numbers(line_type: str) -> List[int]:
        start = 1 if 'first' in line_type else 2 if 'second' in line_type else 3
        return list(range(start, 37, 3))

    @classmethod
    def calculate_bet_win(cls, winning_number: int, bet: Bet) -> float:
        bet_type = cls.get_bet_type(bet.betSpot)
        amount = bet.betAmount

        if bet_type == 'number' and str(winning_number) == bet.betSpot:
            return amount * 24
        elif bet_type == 'numbers_1_12' and 1 <= winning_number <= 12:
            return amount * 3
        elif bet_type == 'numbers_2_12' and 13 <= winning_number <= 24:
            return amount * 3
        elif bet_type == 'numbers_3_12' and 25 <= winning_number <= 36:
            return amount * 3
        elif bet_type == 'first_line' and winning_number in cls.get_line_numbers('first'):
            return amount * 3
        elif bet_type == 'second_line' and winning_number in cls.get_line_numbers('second'):
            return amount * 3
        elif bet_type == 'third_line' and winning_number in cls.get_line_numbers('third'):
            return amount * 3
        elif bet_type == 'odd' and winning_number % 2 != 0:
            return amount * 2
        elif bet_type == 'even' and winning_number != 0 and winning_number % 2 == 0:
            return amount * 2
        elif bet_type == 'red' and winning_number in REDS:
            return amount * 2
        elif bet_type == 'black' and winning_number in BLACKS:
            return amount * 2
        elif bet_type == 'numbers_1_18' and 1 <= winning_number <= 18:
            return amount * 2
        elif bet_type == 'numbers_19_36' and 19 <= winning_number <= 36:
            return amount * 2
        elif bet_type == 'zero' and winning_number == 0:
            return amount * 36 # Traditional roulette pays 35 to 1 (36x) for zero too
        
        return 0.0

    @classmethod
    def calculate_player_total_win(cls, winning_number: int, player_data: PlayerData) -> float:
        total_win = 0.0
        for bet in player_data.bets:
            total_win += cls.calculate_bet_win(winning_number, bet)
        return total_win
