import { useDrag } from "react-dnd";
import { gameStore } from "../../store/gameStore";

interface ChipProps {
    id: string;
    alt: string;
    url: string;
    className?: string;
    style: {
        top: number | string;
        left: number | string;
    };
    onClick?: () => void;
}

export const Chip = (props: ChipProps) => {
    const { url, alt, id, style, className, onClick } = props;
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "chips",
        item: () => {
            const chipValue = Number(id);
            if (gameStore.balance < chipValue) {
                gameStore.setNotification("Necesitas fichas para jugar — ve a Wallet → Depósito.");
                return null; // Cancela el item del drag
            }
            return { id };
        },
        canDrag: () => {
            const chipValue = Number(id);
            if (gameStore.balance < chipValue) {
                gameStore.setNotification("Necesitas fichas para jugar — ve a Wallet → Depósito.");
                return false;
            }
            return true;
        },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }), [id]);

    const isTouchDevice = typeof window !== 'undefined' && (
        'ontouchstart' in window || 
        navigator.maxTouchPoints > 0 || 
        window.innerWidth <= 984
    );

    return (
        <img
            ref={isTouchDevice ? null : drag}
            src={url}
            alt={alt}
            id={id}
            className={className}
            style={{
                ...style,
                opacity: isDragging ? "0.5" : "1",
            }}
            onClick={onClick}
            onContextMenu={(e) => e.preventDefault()}
        />
    );
};
