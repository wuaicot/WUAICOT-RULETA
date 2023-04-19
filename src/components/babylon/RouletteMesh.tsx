import { useState, useEffect } from "react";
import "@babylonjs/loaders/glTF";
import {
    useBeforeRender,
    useScene,
    Task,
    TaskType,
    useAssetManager,
} from "react-babylonjs";
import "@babylonjs/inspector";
import { Vector3, Color3, MeshAssetTask } from "@babylonjs/core";

interface RouletteMeshProps {
    rpm: number;
}

export const RouletteMesh = (props: RouletteMeshProps) => {
    const { rpm } = props;
    // const [Y, setY] = useState(0);
    // const scene = useScene();
    // const deltaTime = scene!.getEngine().getDeltaTime();
    //scene!.debugLayer.show();
    // useBeforeRender(() => {
    //     setY(
    //         (savedY) => savedY + (rpm / 60) * Math.PI * 2 * (deltaTime / 1000),
    //     );
    // }, rpm);

    const modelAssetTasks: Task[] = [
        {
            taskType: TaskType.Mesh,
            rootUrl: "/assets/Roulette/",
            sceneFilename: "model.gltf",
            name: "roulette",
        },
    ];

    const assetManagerResult = useAssetManager(modelAssetTasks);

    useEffect(() => {
        console.log("Loaded Tasks", assetManagerResult);
        const rouletteTask = assetManagerResult.taskNameMap[
            "roulette"
        ] as MeshAssetTask;
        rouletteTask.loadedMeshes[0].position = new Vector3(0, -40, -3);
        rouletteTask.loadedMeshes[0].rotation = new Vector3(20, 0, 0);
    }, []);
    return null;
};
