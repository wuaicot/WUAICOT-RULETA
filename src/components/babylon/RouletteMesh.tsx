import { Task, TaskType, useAssetManager } from "react-babylonjs";
import { Vector3, MeshAssetTask } from "@babylonjs/core";
import "@babylonjs/loaders/glTF";
import "@babylonjs/inspector";
import { useEffect } from "react";

export const RouletteMesh = (props: any) => {
    const { spin, renderingGroupId } = props;
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
        //console.log("Loaded Tasks", assetManagerResult);
        const rouletteTask = assetManagerResult.taskNameMap[
            "roulette"
        ] as MeshAssetTask;
        rouletteTask.loadedMeshes[0].position = new Vector3(0, -40, -3);
        rouletteTask.loadedMeshes[0].rotation = new Vector3(20, 0, spin);
    }, [spin]);
    return null;
};
