import { useState, useRef, useCallback, useContext } from "react";
import { gameStore, GameContext } from "../store/gameStore";

export const useServer = () => {
    const [error, setError] = useState("");
    const [message, setMessage] = useState<any>();
    const [loading, setLoading] = useState(false);
    const { setMsg } = useContext(GameContext);

    const ws = useRef<WebSocket>();
    const URL = "ws://localhost:8888";
    const clientOnError = useCallback(
        (event: Event) => {
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
            setMsg(JSON.parse(message.data));
            sendGameData(JSON.stringify(gameStore.gameData));
        },
        [message],
    );

    const connect = useCallback(() => {
        setLoading(true);
        try {
            ws.current = new WebSocket(URL);
            ws.current.addEventListener("error", clientOnError);
            ws.current.addEventListener("message", clientOnMessage);
        } catch (e) {
            setError((e as Error).message);
        }
        setLoading(false);
    }, []);

    return { error, message, loading, connect };
};
