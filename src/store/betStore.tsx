import { createContext } from "react";
import {
    observable,
    action,
    computed,
    makeObservable,
} from "mobx";
import { chipsColors } from "../utils/chipsUtils";

function chipsToSpawn(betAmount: number) {
    return chipsColors.filter((chip) => chip.value === betAmount);
}

interface Bet {
    betAmount: number;
    betSpot: string;
    betChips: any;
}

class BetStore {
    //observables
    boardItemOccupied = "";
    chipsTaken = 0;
    bets: Bet[] = [];
    //actions
    setBoardItemOccupied(newBoardItem: string) {
        this.boardItemOccupied = newBoardItem;
    }
    setChipsTaken(newChips: number) {
        this.chipsTaken = newChips;
    }

    setAllBets(newBetItem: Bet) {
        this.bets.push(newBetItem);
    }
    // computed and tracking function
    get newBet() {
        return {
            betAmount: this.chipsTaken,
            betSpot: this.boardItemOccupied,
            betChips: chipsToSpawn(this.chipsTaken),
        };
    }

    constructor(initialBoard: string, initialChips: number) {
        this.boardItemOccupied = initialBoard;
        this.chipsTaken = initialChips;
        makeObservable(this, {
            boardItemOccupied: observable,
            chipsTaken: observable,
            setBoardItemOccupied: action.bound,
            setChipsTaken: action.bound,
            setAllBets: action.bound,
            newBet: computed,
        });
    }
}
export const bet = new BetStore("", 0);
export const BetContext = createContext<BetStore>(bet);

// reaction(
//     () => bet.bets,
//     () => bet.bets.map((bet) => `<div>${bet.betAmount}</div>`),
// );
