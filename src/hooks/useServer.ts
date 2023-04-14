import { useState, useRef, useEffect, useCallback } from "react";
import { bet } from "../store/betStore";

export const useServer = () => {
    const [error, setError] = useState("");
    const [message, setMessage] = useState<any>();

    const ws = useRef<WebSocket>();
    const URL = "ws://localhost:8888";
    const clientOnError = useCallback(
        (event: Event) => {
            console.log(event);
            setError(
                `something went wrong with connection to ${URL}, try again`,
            );
        },
        [error],
    );

    const clientData = bet.bets;

    const sendGameData = (clientData: any) => {
        ws.current!.send(clientData);
    };

    const clientOnMessage = useCallback(
        (message: any) => {
            console.log(JSON.parse(message.data));
            setMessage(JSON.parse(message.data));
            console.log(clientData);
            sendGameData(JSON.stringify(clientData));
        },
        [message],
    );

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
