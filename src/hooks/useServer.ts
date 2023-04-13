import { useState, useRef, useEffect, useCallback } from "react";

export const useServer = () => {
    const [error, setError] = useState("");
    const [message, setMessage] = useState("");

    const ws = useRef<WebSocket>();
    const URL = "ws://localhost:8888";
    const clientOnError = useCallback((event: Event) => {
        console.log(event);
        setError(`something went wrong with connection to ${URL}, try again`);
    }, [error]);

    const gameData = "I'm sending some data from the game";

    const sendGamedata = (gameData: string) => {
        ws.current!.send(gameData);
    };

    const clientOnMessage = useCallback((message: any) => {
        console.log(message);
        setMessage(message.data);
        // sendGamedata(gameData);
    }, [message]);

    useEffect(() => {
        try {
            ws.current = new WebSocket(URL);
            ws.current.addEventListener("error", clientOnError);
            ws.current.addEventListener("message", clientOnMessage);
        } catch (e) {
            setError((e as Error).message);
        }

        return () => {
            ws.current!.removeEventListener("error", clientOnError);
            ws.current!.removeEventListener("message", clientOnMessage);
        };
    }, []);

    return { error, message };
};
