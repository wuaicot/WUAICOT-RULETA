import { Engine, Scene, Skybox } from "react-babylonjs";
import { Vector3 } from "@babylonjs/core";
import { Suspense, useState, useEffect } from "react";
import { RouletteAnimate } from "./RouletteAnimate";
import { Ground } from "./Ground";

interface MainSceneProps {
    winningNumber: number | null;
    children?: React.ReactNode;
}

export const MainScene = (props: MainSceneProps) => {
    const { children, winningNumber } = props;
    const SkyboxScene = [
        {
            name: "greenery",
            texture: "/assets/grass.png",
        },
    ];
    const [rpm, setRpm] = useState(1);
    const accelerate = () => {
        const rpmAccInterval = setInterval(() => {
            setRpm((prevValue) => (prevValue += 30));
        }, 500);

        const timeoutId = setTimeout(() => {
            clearInterval(rpmAccInterval);
        }, 3000);
    };

    const deccelerate = () => {
        const rpmDecInterval = setInterval(() => {
            setRpm((prevValue) => (prevValue -= 20));
        }, 550);

        const timeoutIdDec = setTimeout(() => {
            clearInterval(rpmDecInterval);
        }, 5000);
    };

    useEffect(() => {
        setTimeout(() => {
            accelerate();
        }, 5000);
        setTimeout(() => {
            deccelerate();
        }, 10000);
    }, []);

    return (
        <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
            <Scene>
                <hemisphericLight
                    name="light1"
                    intensity={0.2}
                    direction={Vector3.Up()}
                />
                {/* <Skybox rootUrl={SkyboxScene[0].texture} /> */}
                <freeCamera
                    name="camera1"
                    position={new Vector3(0, 20, 0)}
                    setTarget={[Vector3.Zero()]}
                />

                <directionalLight
                    name="shadow-light"
                    intensity={0.8}
                    direction={
                        new Vector3(
                            (-10 * Math.PI) / 4,
                            (-10 * Math.PI) / 4,
                            -Math.PI,
                        )
                    }
                    position={new Vector3(0, 5, 16)}
                >
                    <shadowGenerator
                        mapSize={1024}
                        useBlurExponentialShadowMap
                        blurKernel={64}
                        shadowCastChildren
                    >
                        <Suspense fallback={null}>
                            <RouletteAnimate rpm={rpm} />
                        </Suspense>
                    </shadowGenerator>
                </directionalLight>
                <Suspense fallback={null}>
                    <Ground />
                </Suspense>
            </Scene>
        </Engine>
    );
};
