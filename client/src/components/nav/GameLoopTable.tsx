import { useContext, useEffect, useState, useCallback } from "react";
import ProgressTimer from "react-progress-bar-timer";
import { GameContext, gameStore } from "../../store/gameStore";
import { GameLoop, GameData, Winner } from "../../types";
import "./GameLoopTable.css";

export const GameLoopTable = () => {
    const { setBoardClear } = useContext(GameContext);
    const [started, setStarted] = useState(false);
    const [gameTime, setGameTime] = useState(25);
    const message = gameStore.msg;

    useEffect(() => {
        if (message) {
            if (message.gameTimer <= 25) {
                setStarted(true);
                setGameTime(25 - message.gameTimer);
            } else {
                setStarted(false);
                return;
            }
        }
    }, [message]);

    const getContent = useCallback((message: GameData) => {
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
    }, [setBoardClear]);

    const isWinnerItemMine = useCallback((winner: string, playerId: string) => {
        return winner === playerId ? "winner-item-mine" : "winner-item";
    }, []);

    const getWinners = useCallback((message: GameData) => {
        const content: React.ReactNode[] = [];
        if (message) {
            message.winners.map((winner: Winner) => (
                content.push(
                    <div
                        className={isWinnerItemMine(
                            winner.playerId,
                            gameStore.playerId,
                        )}
                    >
                        <p className="user-id">User id: {winner.playerId}</p>
                        <p className="win">Win: {winner.win}</p>
                    </div>,
                )
            ));
        }
        return content;
    }, [isWinnerItemMine]);

    return (
        <div className="table-container">
            {message && (
                <>
                    <h2 className="game-stage">{getContent(message)}</h2>
                    <div className="bar-container">
                        <ProgressTimer
                            started={started}
                            label=""
                            duration={gameTime}
                            barRounded={false}
                            color={"rgb(255, 173, 0)"}
                            variant="empty"
                            direction="left"
                        />
                    </div>
                    <ul className="winners-list">
                        {getWinners(message).map((cont: React.ReactNode) => (
                            <li
                                className="winner-item-wrapper"
                                key={Math.random()}
                            >
                                {cont}
                            </li>
                        ))}
                    </ul>
                </>
            )}
        </div>
    );
};
