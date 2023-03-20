import { BoardItem } from "./BoardItem";
import "./Board.css";

export const Board = () => {
    const matrix = [
        [0, 3, 6, 9, 12, 15, 18, 21, 24, 27, 30, 33, 36, "2TO1"],
        [2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, "2TO1"],
        [1, 4, 7, 10, 13, 16, 19, 22, 25, 28, 31, 34, "2TO1"],
        ["1ST12", "2ND12", "3RD12"],
        ["1TO18", "EVEN", "RED", "BLACK", "ODD", "19TO36"],
    ];
    return (
        <div className="board-grid">
            {matrix.map((row) =>
                row.map((tableItem) => (
                    <BoardItem tableItem={tableItem}></BoardItem>
                )),
            )}
        </div>
    );
};
