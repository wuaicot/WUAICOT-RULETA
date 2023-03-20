import React from "react";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import "./App.css";

function App() {
    return (
        <div className="App">
            <h1>roulette magic</h1>
            <Board />
            <Chips />
        </div>
    );
}

export default App;
