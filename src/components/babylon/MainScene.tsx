import { Engine, Scene } from "react-babylonjs";
import { Vector3 } from "@babylonjs/core";
import { Suspense, useState, useEffect } from "react";
import { RouletteAnimate } from "./RouletteAnimate";
import { Ground } from "./Ground";
import { gameStore } from "../../store/gameStore";
import { GameLoop } from "../../types";

export const MainScene = () => {
    const message = gameStore.msg;
    const RADIUS = 23;
    const assetCorrection = -1.5;
    const initialBallPos: [number, number, number] = [
        RADIUS,
        assetCorrection,
        0,
    ];
    const [rpm, setRpm] = useState(1);
    const [winSpin, setWinSpin] = useState(0);
    const [acc, setAcc] = useState(false);
    const [pos, setPos] = useState(initialBallPos);

    const accelerate = () => {
        setAcc(true);
        const rpmAccInterval = setInterval(() => {
            setRpm((prevValue) => (prevValue += 10));
        }, 500);

        const timeoutId = setTimeout(() => {
            clearInterval(rpmAccInterval);
        }, 3000);
    };

    const deccelerate = () => {
        const rpmDecInterval = setInterval(() => {
            setRpm((prevValue) => (prevValue -= 6.5));
            setPos((prevValue) => [
                prevValue[0] - 0.6,
                prevValue[1],
                prevValue[2],
            ]);
        }, 550);

        const timeoutIdDec = setTimeout(() => {
            setWinSpin(-gameStore.winSpin.winSpin);
            setAcc(false);
            clearInterval(rpmDecInterval);
        }, 5000);
    };

    useEffect(() => {
        if (message) {
            if (message.gameStage === GameLoop.EMPTY_BOARD) {
                setPos(initialBallPos);
            }
            if (message.gameStage === GameLoop.NO_MORE_BETS) {
                const timeoutAccId = setTimeout(() => {
                    accelerate();
                }, 3000);
                const timeoutDecId = setTimeout(() => {
                    deccelerate();
                }, 6000);
            }
        }
    }, [message]);

    return (
        <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
            <Scene>
                <hemisphericLight
                    name="light1"
                    intensity={0.2}
                    direction={Vector3.Up()}
                />
                <freeCamera
                    name="camera1"
                    position={new Vector3(0, 18, 0)}
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
                            <RouletteAnimate
                                rpm={rpm}
                                acc={acc}
                                pos={pos}
                                winSpin={winSpin}
                            />
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
