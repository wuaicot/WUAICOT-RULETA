import { useState, useContext, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { GameContext } from "../../store/gameStore";
import { Button } from "../../UI/Button";
import { Audio } from "./Audio";
import { assetsURL } from '../../utils/utils';
import "./Header.css";

interface HeaderProps {
    connect: () => void;
    disconnect: () => void;
}

export const Header = (props: HeaderProps) => {
    const { connect, disconnect } = props;
    const [loggedIn, setLoggedIn] = useState(false);
    const { setPlayerId } = useContext(GameContext);

    const logInHandler = useCallback(() => {
        setLoggedIn(true);
        const id = uuidv4();
        setPlayerId(id);
        connect();
    }, []);

    const logOutHandler = useCallback(() => {
        setLoggedIn(false);
        setPlayerId("");
        disconnect();
    }, []);

    return (
        <nav className="header">
            <Button className="logo">
                <h1 className="main-heading">Magic roulette</h1>
            </Button>
            <div className="audio-login-container">
                {!loggedIn && (
                    <Button className="login-button" onClick={logInHandler}>
                        Log In
                    </Button>
                )}
                {loggedIn && (
                    <Button className="logout-button" onClick={logOutHandler}>
                        Log Out
                    </Button>
                )}
                <Audio url={assetsURL.soundtrack} loop={true} />
            </div>
        </nav>
    );
};
