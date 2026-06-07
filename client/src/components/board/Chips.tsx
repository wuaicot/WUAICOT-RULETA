import { observer } from "mobx-react";
import { chipsColors } from "../../utils/utils";
import { gameStore } from "../../store/gameStore";
import { Chip } from "./Chip";
import "./Chips.css";

export const Chips = observer(() => {
    return (
        <div className="chips-container">
            {chipsColors.map((chips) => (
                <Chip
                    id={chips.id}
                    alt={chips.alt}
                    url={chips.url}
                    key={chips.id}
                    className={`chip-item ${gameStore.chipsTaken === chips.value ? "active" : ""}`}
                    style={{ top: 'auto', left: 'auto' }}
                    onClick={() => gameStore.setChipsTaken(chips.value)}
                />
            ))}
        </div>
    );
});
