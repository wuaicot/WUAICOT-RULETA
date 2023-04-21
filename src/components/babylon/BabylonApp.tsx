import { useState, useMemo } from "react";
import { MainScene } from "./MainScene";
import "./BabylonApp.css";

interface BabylonAppProps {
    children?: React.ReactNode;
    message: any
}
export const BabylonApp = (props: BabylonAppProps) => {
    const { message } = props;
    const { children } = props;
    const [winningNumber, setWinningNumber] = useState<number | null>(null);

    return (
        <div className="babylon-container">
            <MainScene message={message}>{children}</MainScene>
        </div>
    );
};
