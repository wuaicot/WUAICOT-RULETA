import { useScene, useBeforeRender } from "react-babylonjs";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { useState } from "react";
import { RouletteMesh } from "./RouletteMesh";

interface RouletteAnimateProps {
    rpm: number;
}

export const RouletteAnimate = (props: RouletteAnimateProps) => {
    const { rpm } = props;
    const [Y, setY] = useState(0);
    const scene = useScene();

    const deltaTime = scene!.getEngine().getDeltaTime();

    useBeforeRender(() => {
        setY((prevY) => prevY + (rpm / 60) * Math.PI * 2 * (deltaTime / 1000));
    });
    return <RouletteMesh spin={Y} renderingGroupId={2} />;
};
