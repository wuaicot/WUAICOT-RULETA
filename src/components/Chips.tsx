import { useContext } from "react";
import { observer } from "mobx-react";
import { bet, BetContext } from "../store/betStore";
import "./Chips.css";

export const Chips = observer(() => {
    const { setChipsTaken } = useContext(BetContext);
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

    const chipHandler = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        setChipsTaken(+(e.target as SVGSVGElement).innerHTML);
    };

    return (
        <div className="chip-container">
            {chipsColors.map((chips) => (
                <svg
                    width="50"
                    height="50"
                    id={chips.value.toString()}
                    key={chips.value.toString()}
                    onClick={chipHandler}
                >
                    <circle
                        cx="25"
                        cy="25"
                        r="20"
                        stroke={chips.chipStroke}
                        fill={chips.chipFill}
                        strokeWidth="5"
                    />
                    <text x="18" y="30" stroke={chips.textFill} strokeWidth="1">
                        {chips.value}
                    </text>
                </svg>
            ))}
        </div>
    );
});
