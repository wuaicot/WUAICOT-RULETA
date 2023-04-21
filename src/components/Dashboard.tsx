import { BabylonApp } from "./babylon/BabylonApp";
import { GameLoopTable } from "./GameLoopTable";
import "./Dashboard.css";

export const Dashboard = (props: any) => {
    const { message } = props;
    
    return (
        <div className="dashboard">
            <BabylonApp />
            <GameLoopTable message={message} />
        </div>
    );
};
