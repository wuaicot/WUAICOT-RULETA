import { useCallback } from "react";
import { observer } from "mobx-react";
import { useDrop } from "react-dnd";
import { REDS, BLACKS } from "../../utils/utils";
import "./BoardItem.css";

interface BoardItemProps {
  children?: React.ReactNode;
  tableItem: number | string;
  id: number | string;
}

export const BoardItem = observer((props: BoardItemProps) => {
  const { tableItem, id } = props;

  const [{ isOver }, drop] = useDrop(() => ({
    accept: "chips",
    drop: (item: string | number, monitor) => {
      const location = monitor.getClientOffset();
      if (location) {
        const elem = document.elementFromPoint(location.x, location.y)!;
        return {
          name: elem.id,
          location: location,
        };
      }
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver({ shallow: true }),
    }),
  }));

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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={drop}
      className={getClassName()}
      id={id.toString()}
      style={{
        border: isOver ? "1px solid rgb(255, 173, 0)" : "1px solid white",
        boxShadow: isOver
          ? "0 0 0.7em 0 rgb(255, 173, 0), inset 0 0 0.7em 0 rgb(255, 173, 0)"
          : "none",
      }}
    >
      {tableItem}
    </div>
  );
});
