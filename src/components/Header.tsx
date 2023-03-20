import { useState } from "react";
import { Button } from "../UI/Button";
import "./Header.css";

export const Header = () => {
    //here will be a panel to login instead of this state channges
    const [loggedIn, setLoggedIn] = useState(false);

    const logInHandler = () => {
        setLoggedIn(true);
    };

    const logOutHandler = () => {
        setLoggedIn(false);
    };
    return (
        <nav className="header">
            <div className="logo">
                <h1 className="main-heading">Magic roulette</h1>
            </div>
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
        </nav>
    );
};
