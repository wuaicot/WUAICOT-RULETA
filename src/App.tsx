import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { gameStore, GameContext } from "./store/gameStore";
import { Loader } from "./components/difStates/Loader";
import { Error } from "./components/difStates/Error";
import { Header } from "./components/nav/Header";
import { Dashboard } from "./components/nav/Dashboard";
import { Board } from "./components/board/Board";
import { Chips } from "./components/board/Chips";
import { useServer } from "./hooks/useServer";
import "./App.css";

function App() {
    const { error, loading, connect } = useServer();

    const setPointerEvents = (message: any) => {
        if (!message) return "App";
        if (message) {
            return message.gameStage === "PLACE BETS"
                ? "App"
                : "App no-pointers";
        } else if (error || loading) {
            return "App no-pointers";
        }
    };

    return (
        <DndProvider backend={HTML5Backend}>
            <div className={setPointerEvents(gameStore.msg)}>
                <GameContext.Provider value={gameStore}>
                    {loading && <Loader loading={loading} />}
                    {error && <Error error={error} />}
                    <Header connect={connect} />
                    <Dashboard />
                    <Board />
                    <Chips />
                </GameContext.Provider>
            </div>
        </DndProvider>
    );
}

export default App;
