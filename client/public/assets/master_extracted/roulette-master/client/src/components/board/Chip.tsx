import { useContext } from "react";
import { useDrag } from "react-dnd";
import { gameStore, GameContext } from "../../store/gameStore";

interface ChipProps {
    id: string;
    alt: string;
    url: string;
    style: {
        top: number | string;
        left: number | string;
    };
}

interface DropResultType {
    name: string;
    location: { x: number; y: number };
}

let dropResult: DropResultType | null;

export const Chip = (props: ChipProps) => {
    const { setChipsTaken, setBoardItemOccupied, setBetLocation, setAllBets } =
        useContext(GameContext);
    const { url, alt, id, style } = props;
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "chips",
        item: { id: id },
        end: (item, monitor) => {
            dropResult = monitor.getDropResult();
            if (dropResult) {
                setChipsTaken(+item.id);
                setBoardItemOccupied(dropResult.name);
                setBetLocation(dropResult.location);
                setAllBets(gameStore.newBet);
            }
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

    return (
        <img
            ref={drag}
            src={url}
            alt={alt}
            id={id}
            style={{
                ...style,
                opacity: isDragging ? "0.5" : "1",
            }}
        />
    );
};
