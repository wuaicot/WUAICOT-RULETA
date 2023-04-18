import { Timer } from "easytimer.js";
import { useState, useRef, useEffect, useCallback } from "react";
import { bet } from "../store/betStore";

export const useServer = () => {
    const [error, setError] = useState("");
    const [message, setMessage] = useState<any>();
    const timer = new Timer();
    timer.addEventListener("secondsUpdated", function (e: any) {
        const currentTime = timer.getTimeValues().seconds;
    });

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
            timer.start();
            console.log(JSON.parse(message.data));
            setMessage(JSON.parse(message.data));
            sendGameData(JSON.stringify(bet.gameData));
            // if (message) {
            //     if (currentTime === 24 || message.gameStage !== "PLACE BETS") {
            //         timer.stop();
            //     }
            // }
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
