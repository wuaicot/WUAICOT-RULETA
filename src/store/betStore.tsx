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
    boardItemOccupied = "";
    chipsTaken = 0;
    betLocation = { x: 0, y: 0 };
    bets: Bet[] = [];

    //actions
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

    constructor(
        initialBoard: string,
        initialChips: number,
        initialLocation: { x: number; y: number },
    ) {
        this.boardItemOccupied = initialBoard;
        this.chipsTaken = initialChips;
        this.betLocation = initialLocation;
        makeObservable(this, {
            boardItemOccupied: observable,
            chipsTaken: observable,
            setBoardItemOccupied: action.bound,
            setChipsTaken: action.bound,
            setBetLocation: action.bound,
            setAllBets: action.bound,
            setBoardClear: action.bound,
            newBet: computed,
        });
    }
}
export const bet = new BetStore("", 0, { x: 0, y: 0 });
export const BetContext = createContext<BetStore>(bet);
