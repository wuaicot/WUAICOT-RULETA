import { useContext, useEffect, useState, useCallback, memo } from "react";
import ProgressTimer from "react-progress-bar-timer";
import { observer } from "mobx-react";
import { GameContext, gameStore } from "../../store/gameStore";
import { GameLoop, GameData, Winner } from "../../common/types";
import "./GameLoopTable.css";

const WinnersList = observer(({ message }: { message: GameData }) => {
    const isWinnerItemMine = (winnerId: string, myId: string) => {
        return winnerId === myId ? "winner-item-mine" : "winner-item";
    };

    return (
        <ul className="winners-list">
            {message.winners.map((winner: Winner, index: number) => (
                <li className="winner-item-wrapper" key={index}>
                    <div className={isWinnerItemMine(winner.playerId, gameStore.playerId)}>
                        <span className="user-id">{winner.nickname && winner.nickname.length > 0 ? winner.nickname : "Jugador"}</span>
                        <span className="win">{winner.win > 0 ? `Ganó: $${winner.win}` : "Win: $0"}</span>
                    </div>
                </li>
            ))}
        </ul>
    );
});

export const GameLoopTable = observer(() => {
    const { setBoardClear, msg: message } = useContext(GameContext);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (message) {
            setStarted(message.gameTimer <= 25);
        }
    }, [message]);

    const getContent = useCallback((message: GameData) => {
        if (message) {
            if (message.gameStage === GameLoop.PLACE_BET) return "HAGA SU JUGADA";
            if (message.gameStage === GameLoop.NO_MORE_BETS) return "NO MÁS JUGADA";
            if (message.winningNumber && message.gameStage === GameLoop.SPIN_WHEEL) return `RULETA MAGNETICA`;
            if (message.winningNumber && message.gameStage === GameLoop.WINNER) return `El numero ganador es: ${message.winningNumber}`;
            if (message.winningNumber && message.gameStage === GameLoop.EMPTY_BOARD) {
                setBoardClear();
                return "ATENTOS...";
            }
        }
    }, [setBoardClear]);

    return (
        <div className="table-container">
            {message && (
                <>
                    <h2 className="game-stage">{getContent(message)}</h2>
                    <div className="bar-container">
                        <ProgressTimer
                            started={started}
                            label=""
                            duration={message.gameTimer <= 25 ? 25 - message.gameTimer : 25}
                            barRounded={false}
                            color={"rgb(255, 173, 0)"}
                            variant="empty"
                            direction="left"
                        />
                    </div>
                    <WinnersList message={message} />
                </>
            )}
        </div>
    );
});
