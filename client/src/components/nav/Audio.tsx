import { useState, useRef, useEffect, useCallback } from "react";
import { assetsURL } from "../../utils/utils";
import "./Audio.css";

export const Audio = () => {
    const [play, setPlay] = useState(false);
    const url = assetsURL.soundtrack;
    const audioRef = useRef() as any;

    const soundToggle = useCallback(() => {
        setPlay((prev) => !prev);
    }, []);

    useEffect(() => {
        if (audioRef) {
            play ? audioRef.current.play() : audioRef.current.pause();
        }
    }, [play]);

    return (
        <>
            <button className="sound-icon" onClick={soundToggle}>
                <audio src={url} loop={true} ref={audioRef}></audio>
                <img src={assetsURL.soundIcon} alt="audio" />
            </button>
        </>
    );
};
