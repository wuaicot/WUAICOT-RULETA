import { useState, useContext } from "react";
import { observer } from "mobx-react";
import { bet, BetContext } from "../store/betStore";
import { chipsColors } from "../utils/chipsUtils";
import "./BoardItem.css";

interface BoardItemProps {
    children?: React.ReactNode;
    tableItem: number | string;
}

export const BoardItem = observer(({ tableItem }: BoardItemProps) => {
    const { setBoardItemOccupied } = useContext(BetContext);
    const [occupied, setOccupied] = useState(false);

    const getClassName = () => {
        if (typeof tableItem === "number") {
            return tableItem % 2 === 0 ? "item red" : "item black";
        }
        if (typeof tableItem === "string") {
            return tableItem === "RED"
                ? "item red"
                : tableItem === "BLACK"
                ? "item black"
                : "item plain";
        }
    };

    const tableItemHandler = (e: React.MouseEvent<HTMLDivElement>) => {
        setBoardItemOccupied((e.target as HTMLDivElement).innerText);
        setOccupied(true);
        // spawnChips();
    };

    const spawnChips = () => {
        return chipsColors
            .filter((chips) => chips.value === bet.newBet.betAmount)
            .map((bettingChip) => (
                <svg width="50" height="50" id={bettingChip.value.toString()}>
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke={bettingChip.chipStroke}
                        fill={bettingChip.chipFill}
                        strokeWidth="5"
                    />
                    <text
                        x="18"
                        y="30"
                        stroke={bettingChip.textFill}
                        strokeWidth="1"
                    >
                        {bettingChip.value}
                    </text>
                </svg>
            ));
    };

    return (
        <div
            className={getClassName()}
            id={tableItem.toString()}
            onClick={tableItemHandler}
        >
            {occupied && spawnChips()}
            {tableItem}
        </div>
    );
});
