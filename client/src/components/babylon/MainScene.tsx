import { Engine, Scene } from "react-babylonjs";
import { Vector3 } from "@babylonjs/core";
import { Suspense } from "react";
import { RouletteMesh } from "./RouletteMesh";

interface MainSceneProps {}

export const MainScene = (props: MainSceneProps) => {
  return (
    <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
      <Scene>
        <hemisphericLight
          name="light1"
          intensity={0.3}
          direction={new Vector3(0, 1, 0)}
        />
        
        <freeCamera
          name="camera1"
          position={new Vector3(0, 25, 0)}
          setTarget={[Vector3.Zero()]}
        />
        
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
              <RouletteMesh spin={1} />
            </Suspense>
          </shadowGenerator>
        </directionalLight>
      </Scene>
    </Engine>
  );
};
