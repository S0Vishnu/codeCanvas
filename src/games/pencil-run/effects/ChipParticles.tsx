import { BufferGeometry, BufferAttribute, Points, Vector3 } from "three";
import { useRef, useMemo, forwardRef, useImperativeHandle } from "react";

export interface SimpleChipParticlesProps {
    bodyHeight: number;
    tipHeight: number;
    tipRadius: number;
}

export interface SimpleChipParticlesHandle {
    updateParticles: (delta: number) => void;
}

const SimpleChipParticles = forwardRef<
    SimpleChipParticlesHandle,
    SimpleChipParticlesProps
>(({ bodyHeight, tipHeight, tipRadius }, ref) => {
    const pointsRef = useRef<Points>(null!);
    const positionsRef = useRef<Float32Array>(null!);
    const velocitiesRef = useRef<Vector3[]>([]);
    const lifeRef = useRef<Float32Array>(null!);
    const gravity = -3; // downward acceleration

    const geometry = useMemo(() => {
        const count = 60;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const lifetimes = new Float32Array(count);
        const velocities: Vector3[] = [];

        for (let i = 0; i < count; i++) {
            const idx = i * 3;
            positions[idx] = (Math.random() - 0.5) * tipRadius * 0.2;
            positions[idx + 1] = -bodyHeight / 2 - tipHeight;
            positions[idx + 2] = (Math.random() - 0.5) * tipRadius * 0.2;

            // Random direction spread
            const dir = new Vector3(
                (Math.random() - 0.5) * 2,
                Math.random() * 2,
                (Math.random() - 0.5) * 2
            ).normalize();
            const speed = 1.5 + Math.random() * 2;
            velocities.push(dir.multiplyScalar(speed));

            lifetimes[i] = Math.random() * 2 + 1; // seconds

            if (Math.random() > 0.4) {
                colors[idx] = 0.15;
                colors[idx + 1] = 0.15;
                colors[idx + 2] = 0.15;
            } else {
                colors[idx] = 0.7 + Math.random() * 0.2;
                colors[idx + 1] = 0.5 + Math.random() * 0.2;
                colors[idx + 2] = 0.3 + Math.random() * 0.1;
            }
        }

        positionsRef.current = positions;
        velocitiesRef.current = velocities;
        lifeRef.current = lifetimes;

        const geometry = new BufferGeometry();
        geometry.setAttribute("position", new BufferAttribute(positions, 3));
        geometry.setAttribute("color", new BufferAttribute(colors, 3));

        return geometry;
    }, [bodyHeight, tipHeight, tipRadius]);

    const updateParticles = (delta: number) => {
        const positionAttr = geometry.getAttribute(
            "position"
        ) as BufferAttribute;
        const positions = positionAttr.array as Float32Array;

        for (let i = 0; i < velocitiesRef.current.length; i++) {
            const idx = i * 3;
            const vel = velocitiesRef.current[i];

            // Apply gravity + velocity
            vel.y -= gravity * delta;
            positions[idx] += vel.x * delta;
            positions[idx + 1] += vel.y * delta;
            positions[idx + 2] += vel.z * delta;

            // Damping (slow down over time)
            vel.multiplyScalar(0.98);

            // Respawn if lifetime expired or below ground
            lifeRef.current[i] -= delta;
            if (lifeRef.current[i] <= 0 || positions[idx + 1] < -3) {
                positions[idx] = (Math.random() - 0.5) * tipRadius * 0.2;
                positions[idx + 1] = -bodyHeight / 2 - tipHeight;
                positions[idx + 2] = (Math.random() - 0.5) * tipRadius * 0.2;
                vel.set(
                    (Math.random() - 0.5) * 3,
                    Math.random() * 2.5,
                    (Math.random() - 0.5) * 3
                );
                lifeRef.current[i] = Math.random() * 2 + 1;
            }
        }

        positionAttr.needsUpdate = true;
    };

    useImperativeHandle(ref, () => ({
        updateParticles,
    }));

    return (
        <points
            ref={pointsRef}
            geometry={geometry}
            position={[0, -1, 0.8]}
            rotation={[-Math.PI / 2, 0, Math.PI]}
        >
            <pointsMaterial
                size={0.04}
                vertexColors
                color={0x000000}
                transparent
                opacity={0.9}
                depthWrite={false}
                sizeAttenuation={true}
            />
        </points>
    );
});

export default SimpleChipParticles;
