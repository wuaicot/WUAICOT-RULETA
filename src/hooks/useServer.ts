import { useState, useRef, useCallback } from "react";
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

    const sendGameData = (clientData: any) => {
        ws.current!.send(clientData);
    };

    const clientOnMessage = useCallback(
        (message: any) => {
            setMessage(JSON.parse(message.data));
            sendGameData(JSON.stringify(bet.gameData));
        },
        [message],
    );

    const connect = useCallback(() => {
        try {
            ws.current = new WebSocket(URL);
            ws.current.addEventListener("error", clientOnError);
            ws.current.addEventListener("message", clientOnMessage);
        } catch (e) {
            setError((e as Error).message);
        }
    }, []);

    return { error, message, connect };
};
