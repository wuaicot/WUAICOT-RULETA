import { useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { BetContext, bet } from "./store/betStore";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import { Dashboard } from "./components/Dashboard";
import { useServer } from "./hooks/useServer";
import "./App.css";

function App() {
    const { error, message, connect } = useServer();

    const setPointerEvents = (message: any) => {
        if (!message) return "App";
        if (message) {
            return message.gameStage === "PLACE BETS"
                ? "App"
                : "App no-pointers";
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={setPointerEvents(message)}>
                <BetContext.Provider value={bet}>
                  
                    <Header connect={connect} />
                    {error && <div className="mock-div">{error}</div>}
                
                    <Dashboard message={message} />
                 
                    <Board />
                
                    <Chips />
                </BetContext.Provider>
            </div>
        </DndProvider>
    );
}

export default App;
