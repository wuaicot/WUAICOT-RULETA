export interface GameData {
  gameStage: GameLoop | undefined;
  gameTimer: number;
  winningNumber: number | undefined;
  winners: Winner[];
}

export enum GameLoop {
  PLACE_BET = "PLACE BET",
  NO_MORE_BETS = "NO MORE BETS",
  SPIN_WHEEL = "SPIN WHEEL",
  WINNER = "WINNER",
  EMPTY_BOARD = "EMPTY BOARD",
}

export interface Winner {
  playerId: string;
  win: number;
}

export interface Bet {
  betAmount: number;
  betSpot: string;
  betChips: any;
  betLocation: { x: number; y: number };
}

export interface ClientData {
  playerId: string;
  bets: Bet[];
}
