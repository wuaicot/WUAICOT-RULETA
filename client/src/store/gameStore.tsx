import { createContext } from 'react';
import { observable, action, computed, makeObservable } from 'mobx';
import { chipsColors, rouletteNumbers } from '../utils/utils';
import { GameData, Bet, GameLoop } from '../common/types';

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
	nickname = '';
	boardItemOccupied = '';
	chipsTaken = 0;
	betLocation = { x: 0, y: 0 };
	bets: Bet[] = [];
	msg: GameData | null;
	baseBalance = 0; // Saldo oficial del servidor
	balance = 0;     // Saldo visible/jugable en la sesión
	balanceVersion = 0; // Incrementador para notificar cambios
	historyVersion = 0; // Incrementador para notificar cambios de historial
	lastResult = 0;
	hasProcessedWin = false;

	//actions

	setPlayerId(id: string) {
		this.playerId = id;
	}

	setNickname(name: string) {
		this.nickname = name;
	}
	
	setChipsTaken(newChips: number) {
		this.chipsTaken = newChips;
	}

    incrementHistoryVersion() {
		this.historyVersion += 1;
	}

	async syncBalance(token: string) {
		try {
			// Solo reportamos lo ganado en esta jugada. Las apuestas fueron descontadas al apostar.
			// Si `lastResult` es 0 (perdió), el delta enviado debe ser 0.
			const delta = this.lastResult; 
			
			if (delta === 0 && this.totalBet === 0) return;

			const res = await fetch('http://localhost:8888/api/wallet/update-balance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ delta: delta })
			});
			const data = await res.json();
			const finalBalance = Number(data.balance);
			this.baseBalance = finalBalance;
			this.balance = finalBalance;
		} catch (e) {
			console.error('Error syncing balance:', e);
		}
	}

	// Método para inicialización inicial (solo una vez)
	initializeBalance(initialBalance: number) {
		if (this.balance === 0) {
			this.balance = initialBalance;
		}
	}
	setBalance(newBalance: number) {
		console.log(`[CLIENTE] Actualizando balance de ${this.playerId} a ${newBalance}`);
		this.baseBalance = newBalance;
		this.balance = newBalance;
		this.balanceVersion += 1;
	}

	async placeBet(betAmount: number, betSpot: string, location: { x: number; y: number }) {
		if (this.balance >= betAmount) {
			this.chipsTaken = betAmount;
			this.boardItemOccupied = betSpot;
			this.betLocation = location;
			this.balance -= betAmount;
            
            // Protección extra: si el balance se vuelve negativo, forzamos 0 y eliminamos la apuesta inválida
            if (this.balance < 0) {
                console.error("[SEGURIDAD] Intento de saldo negativo detectado, reseteando.");
                this.balance = 0;
                this.bets.length = 0; // Cancelar todas las apuestas inválidas
                return;
            }
			
			const newBetItem: Bet = {
				betAmount: betAmount,
				betSpot: betSpot,
				betChips: chipsToSpawn(betAmount),
				betLocation: location,
				id: Math.random().toString(36).substr(2, 9)
			};
			this.bets.push(newBetItem);

            // Sincronizar inmediatamente con el servidor
            const token = localStorage.getItem('token');
            if (token) {
                // Pasamos el negativo de la apuesta para que el servidor la descuente de inmediato
                await this.syncBalanceDirectly(token, -betAmount);
            }
		}
	}

    // Nuevo método para sincronización inmediata
    async syncBalanceDirectly(token: string, delta: number) {
        try {
			const res = await fetch('http://localhost:8888/api/wallet/update-balance', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
					'Authorization': `Bearer ${token}`
				},
				body: JSON.stringify({ delta: delta })
			});
			const data = await res.json();
			const finalBalance = Number(data.balance);
			this.baseBalance = finalBalance;
			this.balance = finalBalance;
        } catch (e) {
            console.error('Error syncing balance:', e);
        }
    }

	setBoardClear() {
		this.bets.length = 0;
	}

	setMsg(newMessage: GameData | null) {
		this.msg = newMessage;

		// Reseteamos la bandera al iniciar una nueva ronda
		if (newMessage && newMessage.gameStage === GameLoop.PLACE_BET) {
			this.hasProcessedWin = false;
		}

		if (newMessage && newMessage.gameStage === GameLoop.WINNER && !this.hasProcessedWin) {
			const myWin = newMessage.winners?.find(w => w.playerId === this.playerId)?.win || 0;
			this.lastResult = myWin;
			// El balance se ajusta al ganar/perder una sola vez
			this.balance += myWin;
			// Opcional: sincronizar baseBalance con el resultado final
			this.baseBalance = this.balance; 
			
			this.hasProcessedWin = true;

			// Lanzar la sincronización al servidor UNA SOLA VEZ
			const token = localStorage.getItem('token');
			if (token) {
				this.syncBalance(token);
			}
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
			nickname: this.nickname,
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
		initialNickname: string,
		initialBoard: string,
		initialChips: number,
		initialLocation: { x: number; y: number },
		initialMessage: null,
	) {
		this.playerId = initialId;
		this.nickname = initialNickname;
		this.boardItemOccupied = initialBoard;
		this.chipsTaken = initialChips;
		this.betLocation = initialLocation;
		this.msg = initialMessage;
		makeObservable(this, {
			playerId: observable,
			nickname: observable,
			boardItemOccupied: observable,
			chipsTaken: observable,
			bets: observable,
			msg: observable.ref,
			balance: observable,
			balanceVersion: observable,
			historyVersion: observable,
			lastResult: observable,
			hasProcessedWin: observable,
			setPlayerId: action.bound,
			setNickname: action.bound,
			setChipsTaken: action.bound,
			incrementHistoryVersion: action.bound,
			placeBet: action.bound,
			setMsg: action.bound,
			setBoardClear: action.bound,
			setBalance: action.bound,
			initializeBalance: action.bound,
			syncBalance: action.bound,
			newBet: computed,
			totalBet: computed,
			gameData: computed,
			winSpin: computed,
		});
	}
}
export const gameStore = new GameStore('', '', '', 0, { x: 0, y: 0 }, null);
export const GameContext = createContext<GameStore>(gameStore);
