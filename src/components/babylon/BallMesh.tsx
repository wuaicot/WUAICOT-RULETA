import { Vector3 } from "@babylonjs/core";

export const BallMesh = () => {
    const RADIUS = 23;
    return (
        <sphere
            name="ball"
            diameter={1}
            segments={32}
            position={new Vector3(RADIUS, 0, 0)}
        ></sphere>
    );
};
