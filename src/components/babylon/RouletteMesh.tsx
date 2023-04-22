import { Task, TaskType, useAssetManager } from "react-babylonjs";
import { Vector3, MeshAssetTask } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { useEffect } from "react";
import { BabylonMeshProps } from "../../types";
import { assetsURL } from "../../utils/utils";

export const RouletteMesh = (props: BabylonMeshProps) => {
    const { spin } = props;
    const modelAssetTasks: Task[] = [
        {
            taskType: TaskType.Mesh,
            rootUrl: `${assetsURL.roulette}/`,
            sceneFilename: "model.gltf",
            name: "roulette",
        },
    ];

    const assetManagerResult = useAssetManager(modelAssetTasks, {
        useDefaultLoadingScreen: true,
    });

    useEffect(() => {
        const rouletteTask = assetManagerResult.taskNameMap[
            "roulette"
        ] as MeshAssetTask;
        rouletteTask.loadedMeshes[0].position = new Vector3(0, -30, -3);
        rouletteTask.loadedMeshes[0].rotation = new Vector3(19.5, 0, spin);
    }, [spin]);
    return null;
};
