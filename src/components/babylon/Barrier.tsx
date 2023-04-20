import { Vector3 } from "@babylonjs/core";
import { BallMesh } from './BallMesh';
import { BabylonMeshProps } from "../../types";

export const Barrier = (props: BabylonMeshProps) => {
    const { spin } = props;

    return (
        <sphere
            name="ball"
            diameter={47}
            segments={32}
            position={new Vector3(0, -29, -3)}
            rotation={new Vector3(19.5, 0, spin)}
        ><BallMesh />
            <standardMaterial name="barrier" alpha={0.4} />
        </sphere>
    );
};
