import { useScene, useBeforeRender } from "react-babylonjs";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { useState, useEffect } from "react";
import { RouletteMesh } from "./RouletteMesh";

interface RouletteAnimateProps {
    rpm: number;
}

export const RouletteAnimate = (props: RouletteAnimateProps) => {
    const { rpm } = props;
    //console.log(rpm);
    const [Z, setZ] = useState(0);

    const scene = useScene();
    const deltaTime = scene!.getEngine().getDeltaTime();
    useBeforeRender(
        () => {
            setZ(
                (prevZ) =>
                    prevZ + (rpm / 60) * Math.PI * 2 * (deltaTime / 1000),
            );
        },
        undefined,
        undefined,
        undefined,
        [rpm],
    );
    return <RouletteMesh spin={Z} renderingGroupId={2} />;
};
