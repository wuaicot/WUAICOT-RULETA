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
    return (
        <DndProvider backend={HTML5Backend}>
            <div className="App">
                <BetContext.Provider value={bet}>
                    <Header />
                    <div className="mock-div">{message}</div>
                    <button className="mock-button">play</button>
                    <Board />
                    <Chips />
                </BetContext.Provider>
            </div>
        </DndProvider>
    );
}

export default App;
