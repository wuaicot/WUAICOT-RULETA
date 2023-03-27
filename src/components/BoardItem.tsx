import { useContext, useState } from "react";
import { observer } from "mobx-react";
import { bet, BetContext } from "../store/betStore";
import { matrix } from "../utils/chipsUtils";
import "./BoardItem.css";

interface BoardItemProps {
    children?: React.ReactNode;
    tableItem: number | string;
}

export const BoardItem = observer(({ tableItem }: BoardItemProps) => {
    const { setBoardItemOccupied, setAllBets } = useContext(BetContext);
    const [content, setContent] = useState<any>();

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
        setAllBets(bet.newBet);
        setContent(
            matrix.map((row) => row.map((tableItem) => spawnChips(tableItem))),
        );
    };

    const spawnChips = (tableItem: string | number) => {
        const betToSpawn = bet.bets.filter(
            (bet) => bet.betSpot === tableItem.toString(),
        );
        return betToSpawn.length > 0
            ? betToSpawn.map((bet) =>
                  bet.betChips.map((chip: any) => (
                      <svg
                          className="board-svg"
                          width="30"
                          height="30"
                          key={Math.random()}
                      >
                          <circle
                              cx="15"
                              cy="15"
                              r="13"
                              stroke={chip.chipStroke}
                              fill={chip.chipFill}
                              strokeWidth="4"
                          />
                          <text
                              x="7"
                              y="17"
                              stroke={chip.textFill}
                              className="board-svg-text"
                          >
                              {chip.value}
                          </text>
                      </svg>
                  )),
              )
            : null;
    };

    return (
        <div
            className={getClassName()}
            id={tableItem.toString()}
            onClick={tableItemHandler}
        >
            {content}
            {tableItem}
        </div>
    );
});
