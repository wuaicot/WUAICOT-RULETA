import { useState } from "react";
import { MainScene } from "./MainScene";
import "./BabylonApp.css";

interface BabylonAppProps {
    children?: React.ReactNode;
}
export const BabylonApp = (props: BabylonAppProps) => {
    const { children } = props;
    const [winningNumber, setWinningNumber] = useState<number | null>(null);

    return (
        <div className="babylon-container">
            <MainScene></MainScene>
        </div>
    );
};
