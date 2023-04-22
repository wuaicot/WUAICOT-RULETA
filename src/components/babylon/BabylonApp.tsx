import { useState } from "react";
import { MainScene } from "./MainScene";
import "./BabylonApp.css";

export const BabylonApp = () => {
    const [winningNumber, setWinningNumber] = useState<number | null>(null);

    return (
        <div className="babylon-container">
            <MainScene></MainScene>
        </div>
    );
};
