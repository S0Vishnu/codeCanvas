import type { Vector3 } from "three";

const ChaseCube: React.FC<{ position: Vector3; t: number }> = ({ position, t }) => {
    const bob = Math.sin(t * 2) * 0.1;
    return (
        <mesh position={[position.x, position.y + bob, position.z]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#8b0000" />
        </mesh>
    );
};

export default ChaseCube;