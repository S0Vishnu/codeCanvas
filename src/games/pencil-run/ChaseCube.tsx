import React, { Suspense } from "react";
import { useGLTF } from "@react-three/drei";
import type { Vector3 } from "three";

interface ChaseEraserProps {
    position: Vector3;
    t: number;
}

const ChaseEraser: React.FC<ChaseEraserProps> = ({ position, t }) => {
    const bob = Math.sin(t * 2) * 0.1;

    // Load GLTF eraser model (replace path with your model file)
    const { scene } = useGLTF("/assets/gltf/eraser.glb", true);

    return (
        <Suspense fallback={null}>
            <primitive
                object={scene}
                position={[position.x, position.y + bob, position.z]}
                scale={[1.5, 1.5, 1.5]}
                rotation={[0, Math.PI, 0]}
            />
        </Suspense>
    );
};

export default ChaseEraser;
