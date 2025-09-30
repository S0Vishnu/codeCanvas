const Pencil: React.FC<{ scale: number }> = ({ scale }) => {
    // Base dimensions
    const bodyHeight = scale; // cylinder height
    const bodyRadius = 0.15;

    const tipHeight = 0.6;
    const tipRadius = 0.13;

    const eraserHeight = 0.24;
    const eraserRadiusTop = 0.16; // slightly smaller for beveled top
    const eraserRadiusBottom = 0.18; // slightly bigger bottom

    return (
        <group position={[0, 0, 0]}>
            {/* Pencil body */}
            <mesh castShadow position={[0, 0, 0]}>
                <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 12]} />
                <meshStandardMaterial color="#f4a460" />
            </mesh>

            {/* Pencil tip */}
            <mesh position={[0, -bodyHeight / 2 - tipHeight / 2, 0]} rotation={[Math.PI, 0, 0]}>
                <coneGeometry args={[tipRadius, tipHeight, 12]} />
                <meshStandardMaterial color="#2b2b2b" />
            </mesh>

            {/* Pencil eraser as beveled cylinder */}
            <mesh position={[0, bodyHeight / 2 + eraserHeight / 2, 0]}>
                <cylinderGeometry args={[eraserRadiusTop, eraserRadiusBottom, eraserHeight, 12]} />
                <meshStandardMaterial color="#f08080" />
            </mesh>
        </group>
    );
};

export default Pencil;
