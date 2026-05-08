import { observer } from "mobx-react";
import { chipsColors } from "../../utils/utils";
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
                    className="chip-item"
                    style={{ top: 'auto', left: 'auto' }}
                />
            ))}
        </div>
    );
});
