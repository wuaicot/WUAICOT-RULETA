import { createContext } from "react";
import { observable, action, computed, makeObservable } from "mobx";
import { chipsColors } from "../utils/utils";

function chipsToSpawn(betAmount: number) {
    return chipsColors.filter((chip) => chip.value === betAmount);
}

interface Bet {
    betAmount: number;
    betSpot: string;
    betChips: any;
    betLocation: { x: number; y: number };
}

class BetStore {
    //observables
    playerId = "";
    boardItemOccupied = "";
    chipsTaken = 0;
    betLocation = { x: 0, y: 0 };
    bets: Bet[] = [];

    //actions

    setPlayerId(id: string) {
        this.playerId = id;
    }
    setBoardItemOccupied(newBoardItem: string) {
        this.boardItemOccupied = newBoardItem;
    }

    setChipsTaken(newChips: number) {
        this.chipsTaken = newChips;
    }

    setBetLocation(location: { x: number; y: number }) {
        this.betLocation = location;
    }

    setAllBets(newBetItem: Bet) {
        this.bets.push(newBetItem);
    }

    setBoardClear() {
        this.bets.splice(0, this.bets.length);
    }

    // computed and tracking function
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

    constructor(
        initialId: string,
        initialBoard: string,
        initialChips: number,
        initialLocation: { x: number; y: number },
    ) {
        this.playerId = initialId;
        this.boardItemOccupied = initialBoard;
        this.chipsTaken = initialChips;
        this.betLocation = initialLocation;
        makeObservable(this, {
            playerId: observable,
            boardItemOccupied: observable,
            chipsTaken: observable,
            setPlayerId: action.bound,
            setBoardItemOccupied: action.bound,
            setChipsTaken: action.bound,
            setBetLocation: action.bound,
            setAllBets: action.bound,
            setBoardClear: action.bound,
            newBet: computed,
            gameData: computed,
        });
    }
}
export const bet = new BetStore("", "", 0, { x: 0, y: 0 });
export const BetContext = createContext<BetStore>(bet);
