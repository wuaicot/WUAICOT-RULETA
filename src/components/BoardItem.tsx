import "./BoardItem.css";

interface BoardItemProps {
    children?: React.ReactNode;
    tableItem: number | string;
}

export const BoardItem = ({ tableItem }: BoardItemProps) => {
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

    return (
        <div className={getClassName()} id={tableItem.toString()}>
            {tableItem}
        </div>
    );
};
