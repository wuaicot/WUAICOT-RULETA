import React, { useState } from "react";
import { BetContext, bet } from "./store/betStore";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { Header } from "./components/Header";
import { Board } from "./components/Board";
import { Chips } from "./components/Chips";
import { getRandomNumber, calculateWin } from "./mockServer/mockServer";
import { play } from "./mockServer/mockServer";
import "./App.css";

function App() {

    return (
        <DndProvider backend={HTML5Backend}>
            <div className="App">
                <BetContext.Provider value={bet}>
                    <Header />
                    <button className="mock-button" onClick={play}>
                       play
                    </button>
                    <Board />
                    <Chips />
                </BetContext.Provider>
            </div>
        </DndProvider>
    );
}

export default App;
