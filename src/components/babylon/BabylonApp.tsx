import { useState, useEffect } from "react";
import { MainScene } from "./MainScene";
import "./BabylonApp.css";

interface BabylonAppProps {
    children?: React.ReactNode;
}
export const BabylonApp = (props: BabylonAppProps) => {
    const { children } = props;
    const [winningNumber, setWinningNumber] = useState<number | null>(null);
    useEffect(() => {
        const winInterval = setInterval(() => {
            setWinningNumber(Math.random());
        }, 10000);
        return () => {
            clearInterval(winInterval);
        };
    });

    return (
        <div className="babylon-container">
            <MainScene winningNumber={winningNumber}>{children}</MainScene>
        </div>
    );
};
