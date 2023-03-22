import { useContext } from "react";
import { observer } from "mobx-react";
import { bet, BetContext } from "../store/betStore";
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
