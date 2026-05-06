import { BabylonApp } from "../babylon/BabylonApp";
import { GameLoopTable } from "./GameLoopTable";
import "./Dashboard.css";

export const Dashboard = () => {
    
    return (
        <div className="dashboard">
            <BabylonApp />
            <GameLoopTable />
        </div>
    );
};
