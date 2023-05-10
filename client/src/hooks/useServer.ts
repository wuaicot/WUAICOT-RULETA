import { useState, useRef, useCallback, useContext } from "react";
import { gameStore, GameContext } from "../store/gameStore";

export const useServer = () => {
    const [error, setError] = useState("");
    const [message, setMessage] = useState<MessageEvent>();
    const [loading, setLoading] = useState(false);
    const { setMsg } = useContext(GameContext);

    const ws = useRef<WebSocket>();
    const URL = "wss://dour-ambitious-tarragon.glitch.me/";
    //const URL = "ws://localhost:8888";
    const clientOnError = useCallback(
        (event: Event) => {
            setError(
                `something went wrong with connection to ${URL}, try again`,
            );
        },
        [error],
    );

    const sendGameData = useCallback((clientData: string) => {
        ws.current!.send(clientData);
    }, []);

    const clientOnMessage = useCallback(
        (message: MessageEvent) => {
            setMessage(JSON.parse(message.data));
            setMsg(JSON.parse(message.data));
            sendGameData(JSON.stringify(gameStore.gameData));
        },
        // eslint-disable-next-line
        [message],
    );

    const disconnect = useCallback(() => {
        ws.current?.close();
    }, []);

    const connect = useCallback(() => {
        setLoading(true);
        try {
            ws.current = new WebSocket(URL, "Google");
            ws.current.addEventListener("error", clientOnError);
            ws.current.addEventListener("message", clientOnMessage);
        } catch (e) {
            setError((e as Error).message);
        }
        setLoading(false);
        // eslint-disable-next-line
    }, []);

    return { error, message, loading, connect, disconnect };
};
