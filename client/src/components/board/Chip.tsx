import { useDrag } from "react-dnd";

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
        item: { id: id },
        collect: (monitor) => ({
            isDragging: !!monitor.isDragging(),
        }),
    }));

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
