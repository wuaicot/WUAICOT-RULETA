import { createContext } from 'react';
import { observable, action, computed, makeObservable } from 'mobx';
import { chipsColors, rouletteNumbers } from '../utils/utils';
import { GameData, Bet } from '../common/types';

export function chipsToSpawn(betAmount: number) {
	return chipsColors.filter((chip) => chip.value === betAmount);
}

export const indexSpin = (2 * Math.PI) / rouletteNumbers.length;
export function calculateWinSpin(winningNumber: number) {
	const winningNumberIndex = rouletteNumbers.indexOf(winningNumber);
	return +(winningNumberIndex * indexSpin).toFixed(2);
}

class GameStore {
	//observables
	playerId = '';
	boardItemOccupied = '';
	chipsTaken = 0;
	betLocation = { x: 0, y: 0 };
	bets: Bet[] = [];
	msg: GameData | null;
	balance = 1000;
	lastResult = 0;

	//actions

	setPlayerId(id: string) {
		this.playerId = id;
	}
	
	setChipsTaken(newChips: number) {
		this.chipsTaken = newChips;
	}

	placeBet(betAmount: number, betSpot: string, location: { x: number; y: number }) {
		if (this.balance >= betAmount) {
			this.chipsTaken = betAmount;
			this.boardItemOccupied = betSpot;
			this.betLocation = location;
			this.balance -= betAmount;
			
			const newBetItem: Bet = {
				betAmount: betAmount,
				betSpot: betSpot,
				betChips: chipsToSpawn(betAmount),
				betLocation: location,
				id: Math.random().toString(36).substr(2, 9)
			};
			this.bets.push(newBetItem);
		}
	}

	setBoardClear() {
		this.bets.length = 0;
	}

	setMsg(newMessage: GameData | null) {
		this.msg = newMessage;
		if (newMessage && newMessage.winners) {
			const myWin = newMessage.winners.find(w => w.playerId === this.playerId)?.win || 0;
			this.lastResult = myWin;
			this.balance += myWin;
		}
	}

	get totalBet() {
		return this.bets.reduce((sum, bet) => sum + bet.betAmount, 0);
	}

	get newBet() {
		return {
			betAmount: this.chipsTaken,
			betSpot: this.boardItemOccupied,
			betChips: chipsToSpawn(this.chipsTaken),
			betLocation: this.betLocation,
		};
	}

	get gameData() {
		return {
			playerId: this.playerId,
			bets: this.bets,
		};
	}

	get winSpin() {
		const winningNumber = this.msg?.winningNumber;
		return {
			winSpin: winningNumber !== undefined ? calculateWinSpin(winningNumber) : 0,
		};
	}

	constructor(
		initialId: string,
		initialBoard: string,
		initialChips: number,
		initialLocation: { x: number; y: number },
		initialMessage: null,
	) {
		this.playerId = initialId;
		this.boardItemOccupied = initialBoard;
		this.chipsTaken = initialChips;
		this.betLocation = initialLocation;
		this.msg = initialMessage;
		makeObservable(this, {
			playerId: observable,
			boardItemOccupied: observable,
			chipsTaken: observable,
			bets: observable,
			msg: observable,
			balance: observable,
			lastResult: observable,
			setPlayerId: action.bound,
			setChipsTaken: action.bound,
			placeBet: action.bound,
			setMsg: action.bound,
			setBoardClear: action.bound,
			newBet: computed,
			totalBet: computed,
			gameData: computed,
			winSpin: computed,
		});
	}
}
export const gameStore = new GameStore('', '', 0, { x: 0, y: 0 }, null);
export const GameContext = createContext<GameStore>(gameStore);
