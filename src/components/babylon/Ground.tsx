import { TextureAssetTask, Vector3 } from "@babylonjs/core";
import { Task, TaskType, useAssetManager } from "react-babylonjs";
import "@babylonjs/core/Loading/loadingScreen";

export const Ground = () => {
    const textureAssets: Task[] = [
        {
            taskType: TaskType.Texture,
            url: "https://www.babylonjs-playground.com/textures/floor_bump.PNG",
            name: "bump-table",
        },
        {
            taskType: TaskType.Texture,
            url: "https://www.babylonjs-playground.com/textures/lava/lavatile.jpg",
            name: "lava-table",
        },
    ];
    const assetManagerResult = useAssetManager(textureAssets, {
        useDefaultLoadingScreen: true,
    });
    return (
        <ground
            name="ground"
            width={200}
            height={200}
            position={new Vector3(0, -36, 0)}
            rotation={new Vector3(-19.5, 0, 0)}
            receiveShadows
        >
            {/* <standardMaterial name="bump-table">
                <texture
                    url={
                        "https://www.babylonjs-playground.com/textures/floor_bump.PNG"
                    }
                    fromInstance={
                        (
                            assetManagerResult.taskNameMap[
                                "bump-table"
                            ] as TextureAssetTask
                        ).texture
                    }
                    assignTo="bumpTexture"
                ></texture>
            </standardMaterial> */}
        </ground>
    );
};
