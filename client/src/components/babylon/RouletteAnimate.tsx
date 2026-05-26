import { useScene, useBeforeRender } from "react-babylonjs";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { useState, useRef, useCallback } from "react";
import { RouletteMesh } from "./RouletteMesh";
import { Barrier } from "./Barrier";

interface RouletteAnimateProps {
    rpm: number;
    acc: boolean;
    pos: [number, number, number];
    winSpin: number;
}

export const RouletteAnimate = (props: RouletteAnimateProps) => {
    const { rpm, acc, pos, winSpin } = props;
    const [Z, setZ] = useState(0);

    const scene = useScene();
    const deltaTime = scene!.getEngine().getDeltaTime();

    // 1. Reference to store the animation callback with the latest closure values from the render
    const callbackRef = useRef<() => void>();
    callbackRef.current = () => {
        setZ((prevZ) => prevZ + (rpm / 60) * Math.PI * 2 * (deltaTime / 1000));
    };

    // 2. Stable proxy callback that never changes references in memory
    const stableCallback = useCallback(() => {
        if (callbackRef.current) {
            callbackRef.current();
        }
    }, []);

    // 3. Register the stable proxy callback exactly once on mount, preventing memory leak
    useBeforeRender(stableCallback);

    return (
        <>
            <RouletteMesh spin={Z} />
            {!acc ? (
                <Barrier winSpin={winSpin}  spin={Z} pos={pos} />
            ) : (
                    <Barrier winSpin={winSpin} spin={-Z} pos={pos} />
            )}
        </>
    );
};
