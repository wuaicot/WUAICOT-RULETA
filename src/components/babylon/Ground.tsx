import { TextureAssetTask } from "@babylonjs/core";
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
        <ground name="ground" width={13} height={13} receiveShadows>
            <standardMaterial name="bump-table">
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
                >
                    <standardMaterial name="lava-table">
                        <texture
                            url={
                                "https://www.babylonjs-playground.com/textures/lava/lavatile.jpg"
                            }
                            fromInstance={
                                (
                                    assetManagerResult.taskNameMap[
                                        "lava-table"
                                    ] as TextureAssetTask
                                ).texture
                            }
                            assignTo="emissiveTexture"
                        />
                    </standardMaterial>
                </texture>
            </standardMaterial>
        </ground>
    );
};
