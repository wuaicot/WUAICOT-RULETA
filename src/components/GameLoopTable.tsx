import { useContext, useEffect, useState } from "react";
import ProgressTimer from "react-progress-bar-timer";
import { BetContext, bet } from "../store/betStore";
import "./GameLoopTable.css";

export const GameLoopTable = (props: any) => {
    const { setBoardClear } = useContext(BetContext);
    const [started, setStarted] = useState(false);

    const { message } = props;

    useEffect(() => {
        if (message) {
            if (message.gameStage === "PLACE BETS") {
                setStarted(true);
            } else if (message.gameStage !== "PLACE BETS") {
                setStarted(false);
            }
        }
    }, [message]);

    const getContent = (message: any) => {
        let content;
        if (message) {
            if (
                message.gameStage === "PLACE BETS" ||
                message.gameStage === "NO MORE BETS"
            ) {
                content = message.gameStage;
            } else if (
                message.winningNumber &&
                message.gameStage === "WINNER"
            ) {
                content = `Winnig number is: ${message.winningNumber}`;
            } else if (
                message.winningNumber &&
                message.gameStage === "EMPTY BOARD"
            ) {
                setBoardClear();
                content = "GET READY FOR NEXT ROUND";
            }
            return content;
        }
    };

    const getWinners = (message: any) => {
        const content: any = [];
        if (message) {
            message.winners.map((winner: any) => {
                content.push(
                    <div className="winner-item-item">
                        <p className="user-id">User id: {winner.id}</p>
                        <p className="win">Win: {winner.win}</p>
                    </div>,
                );
            });
        }
        return content;
    };

    return (
        <div className="table-container">
            {message && <h2 className="game-stage">{getContent(message)}</h2>}
            {message && (
                <ProgressTimer
                    started={started}
                    label=""
                    duration={25}
                    barRounded={true}
                    color={"rgb(255, 173, 0)"}
                    variant="empty"
                    direction="left"
                />
            )}
            {message && (
                <ul className="winners-list">
                    {getWinners(message).map((cont: any) => (
                        <li className="winner-item">{cont}</li>
                    ))}
                </ul>
            )}
        </div>
    );
};
