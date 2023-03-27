import { useContext } from "react";
import { observer } from "mobx-react";
import { BetContext } from "../store/betStore";
import { chipsColors } from "../utils/chipsUtils";
import "./Chips.css";

export const Chips = observer(() => {
    const { setChipsTaken } = useContext(BetContext);

    const chipHandler = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
        setChipsTaken(+(e.target as SVGSVGElement).innerHTML);
    };

    return (
        <div className="chip-container">
            {chipsColors.map((chips) => (
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100"
                    height="100"
                    id={chips.value.toString()}
                    key={chips.value.toString()}
                    onClick={chipHandler}
                >
                    <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke={chips.chipStroke}
                        fill={chips.chipFill}
                        strokeWidth="10"
                    />
                    <text
                        x="35"
                        y="60"
                        stroke={chips.textFill}
                        strokeWidth="2"
                        className="svg-text"
                    >
                        {chips.value}
                    </text>
                </svg>
            ))}
        </div>
    );
});
