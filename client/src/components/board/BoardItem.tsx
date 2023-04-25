import { useCallback } from "react";
import { observer } from "mobx-react";
import { REDS, BLACKS } from "../../utils/utils";
import "./BoardItem.css";

interface BoardItemProps {
    children?: React.ReactNode;
    tableItem: number | string;
    id: number | string;
}

export const BoardItem = observer((props: BoardItemProps) => {
    const { tableItem, id } = props;

    const getClassName = useCallback(() => {
        if (typeof tableItem === "number") {
            return REDS.includes(tableItem)
                ? "item red"
                : BLACKS.includes(tableItem)
                ? "item black"
                : "item plain";
        }
        if (typeof tableItem === "string") {
            return tableItem === "RED"
                ? "item red"
                : tableItem === "BLACK"
                ? "item black"
                : "item plain";
        }
    }, []);

    return (
        <div className={getClassName()} id={id.toString()}>
            {tableItem}
        </div>
    );
});
