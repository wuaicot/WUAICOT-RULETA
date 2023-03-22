import { createContext } from "react";
import { observable, action, makeObservable } from "mobx";

class BetStore {
    //observables
    boardItemOccupied = "";
    chipsTaken = 0;
    //actions
    setBoardItemOccupied(newBoardItem: string) {
        this.boardItemOccupied = newBoardItem;
    }
    setChipsTaken(newChips: number) {
        this.chipsTaken = newChips;
    }
    // computed and tracking function
    get newBet() {
        return {
            betAmount: this.chipsTaken,
            betSpot: this.boardItemOccupied,
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
        });
    }
}
export const bet = new BetStore("", 0);
export const BetContext = createContext<BetStore>(bet);
