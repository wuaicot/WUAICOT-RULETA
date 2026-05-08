import { observer } from 'mobx-react';
import { BabylonApp } from "../babylon/BabylonApp";
import { GameLoopTable } from "./GameLoopTable";
import { gameStore } from '../../store/gameStore';
import "./Dashboard.css";

export const Dashboard = observer(() => {
    return (
        <div className="dashboard">
            <div className="status-bar">
                <span>Saldo: ${gameStore.balance}</span>
                <span>Apuesta: ${gameStore.totalBet}</span>
                <span>Último Resultado: ${gameStore.lastResult}</span>
            </div>
            <BabylonApp />
            <GameLoopTable />
        </div>
    );
});
