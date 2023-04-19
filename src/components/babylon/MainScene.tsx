import { Engine, Scene, Skybox } from "react-babylonjs";
import { Vector3 } from "@babylonjs/core";
import { Suspense } from "react";
import { RouletteMesh } from "./RouletteMesh";
import { Ground } from "./Ground";

interface MainSceneProps {
    children?: React.ReactNode;
}

export const MainScene = (props: MainSceneProps) => {
    const { children } = props;
    const SkyboxScene = [
        {
            name: "greenery",
            texture: "/assets/grass.png",
        },
    ];
    return (
        <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
            <Scene>
                <hemisphericLight
                    name="light1"
                    intensity={0.3}
                    direction={new Vector3(0, 1, 0)}
                />
                {/* <Skybox rootUrl={SkyboxScene[0].texture} /> */}
                <freeCamera
                    name="camera1"
                    position={new Vector3(0, 25, 0)}
                    setTarget={[Vector3.Zero()]}
                />

                {/* <Suspense fallback={null}>
                    <Ground />
                </Suspense> */}
                <directionalLight
                    name="shadow-light"
                    intensity={0.8}
                    direction={
                        new Vector3(
                            (-5 * Math.PI) / 4,
                            (-5 * Math.PI) / 4,
                            -Math.PI,
                        )
                    }
                    position={new Vector3(2, 4, 8)}
                >
                    <shadowGenerator
                        mapSize={1024}
                        useBlurExponentialShadowMap
                        blurKernel={64}
                        shadowCastChildren
                    >
                        <Suspense fallback={null}>
                            <RouletteMesh rpm={1} />
                        </Suspense>
                    </shadowGenerator>
                </directionalLight>
            </Scene>
        </Engine>
    );
};
