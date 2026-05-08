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
}

export const Chip = (props: ChipProps) => {
    const { url, alt, id, style, className } = props;
    const [{ isDragging }, drag] = useDrag(() => ({
        type: "chips",
        item: { id: id },
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
            className={className}
            style={{
                ...style,
                opacity: isDragging ? "0.5" : "1",
            }}
        />
    );
};
