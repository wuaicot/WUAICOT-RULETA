import React from "react";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import "./App.css";

function App() {
    return (
        <div className="App">
            <Header />
            <Board />
            <Chips />
        </div>
    );
}

export default App;
