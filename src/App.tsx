import { ReactNode, useContext, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BetContext, bet } from "./store/betStore";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import { BabylonApp } from "./components/babylon/BabylonApp";
import { useServer } from "./hooks/useServer";
import "./App.css";

function App() {
    const { error, message, connect } = useServer();
    const { setBoardClear } = useContext(BetContext);

    useEffect(() => {
        if (message) {
            if (message.winners) {
                console.log(message.winners);
            }
        }
    }, [message]);

    const setPointerEvents = (message: any) => {
        if (!message) return "App";
        if (message) {
            return message.gameStage === "PLACE BETS"
                ? "App"
                : "App no-pointers";
        }
    };
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
                    <div>
                        <div className="mock-div">User id: {winner.id}</div>
                        <div className="mock-div">Win: {winner.win}</div>
                    </div>,
                );
            });
        }
        return content;
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={setPointerEvents(message)}>
                <BetContext.Provider value={bet}>
                    <Header connect={connect} />
                    {/* //there will be another component for game data from server */}
                    {/* {message && (
                        <div className="mock-div">{getContent(message)}</div>
                    )}
                    {message && (
                        <ul>
                            {getWinners(message).map((cont: any) => (
                                <li>{cont}</li>
                            ))}
                        </ul>
                    )}
                    {error && <div className="mock-div">{error}</div>} */}
                    <BabylonApp />
                    <Board />
                    <Chips />
                </BetContext.Provider>
            </div>
        </DndProvider>
    );
}

export default App;
