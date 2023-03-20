import "./Chips.css";

export const Chips = () => {
    const chipsColors = [
        {
            chipFill: "white",
            chipStroke: "whitesmoke",
            textFill: "black",
            value: 5,
        },
        { chipFill: "red", chipStroke: "red", textFill: "white", value: 10 },
        {
            chipFill: "green",
            chipStroke: "green",
            textFill: "white",
            value: 20,
        },
        { chipFill: "blue", chipStroke: "blue", textFill: "white", value: 50 },
        {
            chipFill: "black",
            chipStroke: "black",
            textFill: "white",
            value: 100,
        },
    ];

    return (
        <div className="chip-container">
            {chipsColors.map((chips) => (
                <svg width="50" height="50" id={chips.value.toString()}>
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke={chips.chipStroke}
                        fill={chips.chipFill}
                        stroke-width="5"
                    />
                    <text
                        x="18"
                        y="30"
                        stroke={chips.textFill}
                        stroke-width="1"
                    >
                        {chips.value}
                    </text>
                </svg>
            ))}
        </div>
    );
};
