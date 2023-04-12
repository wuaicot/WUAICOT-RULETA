import { useContext } from "react";
import { useDrag } from "react-dnd";
import { bet, BetContext } from "../store/betStore";

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
let scale = 1;
export const Chip = (props: ChipProps) => {
    const { setChipsTaken, setBoardItemOccupied, setBetLocation, setAllBets } =
        useContext(BetContext);
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
                setAllBets(bet.newBet);
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
