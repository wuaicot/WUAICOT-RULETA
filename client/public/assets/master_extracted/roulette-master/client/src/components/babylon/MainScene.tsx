import { Engine, Scene } from 'react-babylonjs';
import { Vector3 } from '@babylonjs/core';
import { Suspense, useEffect, useRef, useState } from 'react';
import { RouletteAnimate } from './RouletteAnimate';
import { Ground } from './Ground';
import { gameStore } from '../../store/gameStore';
import { GameLoop } from '../../types';

enum SpinPhase {
  IDLE,
  SPINNING,
  SETTLING,
  LOCKED,
}

export const MainScene = () => {
  const message = gameStore.msg;

  const RADIUS = 7;
  const assetY = 0;

  // ----- refs: estado físico continuo -----
  const phase = useRef<SpinPhase>(SpinPhase.IDLE);

  const wheelAngle = useRef(0);
  const wheelSpeed = useRef(0);

  const ballAngle = useRef(0);
  const ballSpeed = useRef(0);
  const ballAngularVel = useRef(0);

  const radius = useRef(RADIUS);
  const targetAngle = useRef<number | null>(null);

  // ----- estado mínimo para render -----
  const [renderState, setRenderState] = useState({
    wheelAngle: 0,
    pos: [RADIUS, assetY, 0] as [number, number, number],
  });

  // ----- reset / inicio -----
  useEffect(() => {
    if (!message) return;

    if (message.gameStage === GameLoop.EMPTY_BOARD) {
      phase.current = SpinPhase.IDLE;

      wheelAngle.current = 0;
      wheelSpeed.current = 0;

      ballAngle.current = 0;
      ballSpeed.current = 0;
      ballAngularVel.current = 0;

      radius.current = RADIUS;
      targetAngle.current = null;

      setRenderState({
        wheelAngle: 0,
        pos: [RADIUS, assetY, 0],
      });
    }

    if (message.gameStage === GameLoop.NO_MORE_BETS) {
      phase.current = SpinPhase.SPINNING;

      wheelSpeed.current = 1.2;
      ballSpeed.current = 4.8;

      radius.current = RADIUS;
    }
  }, [message]);

  return (
    <Engine antialias adaptToDeviceRatio canvasId="babylon-canvas">
      <Scene
        onRender={(scene) => {
          const dt = scene.getEngine().getDeltaTime() / 1000;

          // -------- SPINNING --------
          if (phase.current === SpinPhase.SPINNING) {
            wheelSpeed.current *= 0.992;
            ballSpeed.current *= 0.985;

            wheelAngle.current += wheelSpeed.current * dt;
            ballAngle.current -= ballSpeed.current * dt;

            radius.current = Math.max(3.2, radius.current - 0.25 * dt);

            ballAngle.current += (Math.random() - 0.5) * 0.02;

            if (radius.current < 4.5 && Math.random() < 0.06) {
              ballSpeed.current *= 0.7;
              ballAngle.current += (Math.random() - 0.5) * 0.25;
            }

            if (ballSpeed.current < 0.8) {
              const slots = 37;
              const sector = (2 * Math.PI) / slots;

              let norm = ballAngle.current % (2 * Math.PI);
              if (norm < 0) norm += 2 * Math.PI;

              const index = Math.floor(norm / sector);
              targetAngle.current = index * sector + sector / 2;

              phase.current = SpinPhase.SETTLING;
              ballAngularVel.current = -ballSpeed.current;
            }
          }

          // -------- SETTLING --------
          if (phase.current === SpinPhase.SETTLING && targetAngle.current !== null) {
            let diff = targetAngle.current - ballAngle.current;
            diff = Math.atan2(Math.sin(diff), Math.cos(diff));

            const stiffness = 18;
            const damping = 6.5;

            ballAngularVel.current += (stiffness * diff - damping * ballAngularVel.current) * dt;
            ballAngle.current += ballAngularVel.current * dt;

            radius.current = Math.max(2.75, radius.current - 0.5 * dt);

            ballAngle.current += Math.sin(Date.now() * 0.025) * 0.0015;

            if (Math.abs(diff) < 0.002 && Math.abs(ballAngularVel.current) < 0.05) {
              phase.current = SpinPhase.LOCKED;
              ballAngularVel.current = 0;
              ballSpeed.current = 0;

              const slots = 37;
              const sector = (2 * Math.PI) / slots;
              const index = Math.floor(targetAngle.current / sector);

              // opcional: guardar resultado
              gameStore.winSpin = { winSpin: index };
            }
          }

          // -------- POSICIÓN --------
          const vibr = Math.sin(Date.now() * 0.01) * 0.008;

          const x = (radius.current + vibr) * Math.cos(ballAngle.current);
          const z = (radius.current + vibr) * Math.sin(ballAngle.current);

          setRenderState({
            wheelAngle: wheelAngle.current,
            pos: [x, assetY, z],
          });
        }}
      >
        <hemisphericLight name="light1" intensity={0.2} direction={Vector3.Up()} />

        <freeCamera
          name="camera1"
          position={new Vector3(0, 15, 0)}
          setTarget={[Vector3.Zero()]}
        />

        <directionalLight
          name="shadow-light"
          intensity={0.8}
          direction={
            new Vector3(
              (-10 * Math.PI) / 4,
              (-10 * Math.PI) / 4,
              -Math.PI
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
                rpm={renderState.wheelAngle}
                pos={renderState.pos}
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