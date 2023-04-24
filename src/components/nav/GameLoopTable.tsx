import { useContext, useEffect, useState } from "react";
import ProgressTimer from "react-progress-bar-timer";
import { GameContext, gameStore } from "../../store/gameStore";
import { GameLoop, GameData, Winner } from "../../types";
import "./GameLoopTable.css";

export const GameLoopTable = () => {
    const { setBoardClear } = useContext(GameContext);
    const [started, setStarted] = useState(false);
    const message = gameStore.msg;

    useEffect(() => {
        if (message) {
            if (message.gameStage === GameLoop.PLACE_BET) {
                setStarted(true);
            } else {
                setStarted(false);
            }
        }
    }, [message]);

    const getContent = (message: GameData) => {
        let content;
        if (message) {
            if (
                message.gameStage === GameLoop.PLACE_BET ||
                message.gameStage === GameLoop.NO_MORE_BETS
            ) {
                content = message.gameStage;
            } else if (
                message.winningNumber &&
                message.gameStage === GameLoop.SPIN_WHEEL
            ) {
                content = `Get ready for some magic`;
            } else if (
                message.winningNumber &&
                message.gameStage === GameLoop.WINNER
            ) {
                content = `Winnig number is: ${message.winningNumber}`;
            } else if (
                message.winningNumber &&
                message.gameStage === GameLoop.EMPTY_BOARD
            ) {
                setBoardClear();
                content = "Get ready for next round";
            }
            return content;
        }
    };

    const getWinners = (message: GameData) => {
        const content: React.ReactNode[] = [];
        if (message) {
            message.winners.map((winner: Winner) => {
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
                <div className="bar-container">
                    <ProgressTimer
                        started={started}
                        label=""
                        duration={25}
                        barRounded={false}
                        color={"rgb(255, 173, 0)"}
                        variant="empty"
                        direction="left"
                    />
                </div>
            )}
            {message && (
                <ul className="winners-list">
                    {getWinners(message).map((cont: React.ReactNode) => (
                        <li className="winner-item" key={Math.random()}>
                            {cont}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
};
