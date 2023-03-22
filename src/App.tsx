import React from "react";
import { BetContext, bet } from "./store/betStore";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import "./App.css";

function App() {
    return (
        <div className="App">
            <BetContext.Provider value={bet}>
                <Header />
                <Board />
                <Chips />
            </BetContext.Provider>
        </div>
    );
}

export default App;
