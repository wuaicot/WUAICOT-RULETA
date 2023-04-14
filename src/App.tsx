import { useContext } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BetContext, bet } from "./store/betStore";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import { useServer } from "./hooks/useServer";
import "./App.css";

function App() {
    const { error, message } = useServer();
    const { setBoardClear } = useContext(BetContext);
    // console.log(message);
    const getContent = (message: any) => {
        let content;
        if (message) {
            if (
                message.gameStage === "PLACE BETS" ||
                message.gameStage === "NO MORE BETS"
            ) {
                content = message.gameStage;
            } else if (message.winningNumber && message.gameStage === 'WINNER') {
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
        let content;
        if (message) {
            message.winners.map((winner: any) => {
                content = (
                    <li>
                        <div className="mock-div">User id: {winner.id}</div>
                        <div className="mock-div">Win: {winner.win}</div>
                    </li>
                );
            });
        }
        return content;
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="App">
                <BetContext.Provider value={bet}>
                    <Header />
                    {message && (
                        <div className="mock-div">{getContent(message)}</div>
                    )}
                    {message && <ul>{getWinners(message)}</ul>}
                    {error && <div className="mock-div">{error}</div>}
                    <button className="mock-button">play</button>
                    <Board />
                    <Chips />
                </BetContext.Provider>
            </div>
        </DndProvider>
    );
}

export default App;
