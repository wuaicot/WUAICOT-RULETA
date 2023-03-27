import { BoardItem } from "./BoardItem";
import { matrix } from "../utils/chipsUtils";
import "./Board.css";

export const Board = () => {
    return (
        <div className="board-grid">
            {matrix.map((row) =>
                row.map((tableItem) => (
                    <BoardItem
                        tableItem={tableItem}
                        key={Math.random()}
                    ></BoardItem>
                )),
            )}
        </div>
    );
};
