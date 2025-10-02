import { BufferGeometry, BufferAttribute, Points } from "three";
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
  const timeRef = useRef(0);

  const geometry = useMemo(() => {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      positions[idx] = (Math.random() - 0.5) * tipRadius * 0.2;
      positions[idx + 1] = -bodyHeight / 2 - tipHeight;
      positions[idx + 2] = (Math.random() - 0.5) * tipRadius * 0.2;

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

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));

    return geometry;
  }, [bodyHeight, tipHeight, tipRadius]);

  const updateParticles = (delta: number) => {
    if (!pointsRef.current) return;

    timeRef.current += delta;
    const positionAttribute = geometry.getAttribute(
      "position"
    ) as BufferAttribute;
    const positions = positionAttribute.array as Float32Array;

    // Simple sine wave motion for testing
    for (let i = 0; i < positions.length / 3; i++) {
      const idx = i * 3;
      positions[idx + 1] =
        positionsRef.current[idx + 1] + Math.sin(timeRef.current + i) * 0.5;
    }

    positionAttribute.needsUpdate = true;
    console.log("Updating particles", timeRef.current); // Debug log
  };

  useImperativeHandle(ref, () => ({
    updateParticles,
  }));

  return (
    <points ref={pointsRef} geometry={geometry} position={[0, 0.05, 0]}>
      <pointsMaterial
        size={0.04}
        vertexColors
        transparent
        opacity={0.9}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
});

export default SimpleChipParticles;
