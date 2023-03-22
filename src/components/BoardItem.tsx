import { useContext } from "react";
import { observer } from "mobx-react";
import { bet, BetContext } from "../store/betStore";
import "./BoardItem.css";

interface BoardItemProps {
    children?: React.ReactNode;
    tableItem: number | string;
}

export const BoardItem = observer(({ tableItem }: BoardItemProps) => {
    const { setBoardItemOccupied } = useContext(BetContext);

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
        console.log(bet.newBet);
    };

    return (
        <div
            className={getClassName()}
            id={tableItem.toString()}
            onClick={tableItemHandler}
        >
            {tableItem}
        </div>
    );
});
