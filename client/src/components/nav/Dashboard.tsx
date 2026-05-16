import { observer } from 'mobx-react';
import { BabylonApp } from "../babylon/BabylonApp";
import { GameLoopTable } from "./GameLoopTable";
import "./Dashboard.css";

export const Dashboard = observer(() => {
    return (
        <div className="dashboard">
            <BabylonApp />
            <GameLoopTable />
        </div>
    );
});
