import { BufferAttribute, Points, BufferGeometry } from "three";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

interface ChipParticlesProps {
  bodyHeight: number;
  tipHeight: number;
  tipRadius: number;
}

const ChipParticles: React.FC<ChipParticlesProps> = ({
  bodyHeight,
  tipHeight,
  tipRadius,
}) => {
  const particlesRef = useRef<Points>(null!);

  // Particles data (wood/graphite chunks from pencil tip)
  const particlesGeometry = useMemo(() => {
    const count = 40;
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    const velocities = new Float32Array(count * 3);
    const lifetimes = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      // Start at pencil tip position
      positions[i * 3] = (Math.random() - 0.5) * tipRadius * 0.3;
      positions[i * 3 + 1] = -bodyHeight / 2 - tipHeight;
      positions[i * 3 + 2] = (Math.random() - 0.5) * tipRadius * 0.3;

      // Wood (brown) and graphite (dark gray) colors
      if (Math.random() > 0.4) {
        // Graphite chips
        colors[i * 3] = 0.15;
        colors[i * 3 + 1] = 0.15;
        colors[i * 3 + 2] = 0.15;
      } else {
        // Wood chips
        colors[i * 3] = 0.7 + Math.random() * 0.2;
        colors[i * 3 + 1] = 0.5 + Math.random() * 0.2;
        colors[i * 3 + 2] = 0.3 + Math.random() * 0.1;
      }

      // Random initial velocities (backward and slightly random)
      velocities[i * 3] = -1.5 - Math.random() * 2.0;
      velocities[i * 3 + 1] = (Math.random() - 0.3) * 0.8;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.4;

      sizes[i] = 0.015 + Math.random() * 0.02;
      lifetimes[i] = Math.random() * 2.0; // Stagger initial lifetimes
    }

    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new BufferAttribute(positions, 3));
    geometry.setAttribute("color", new BufferAttribute(colors, 3));
    geometry.setAttribute("size", new BufferAttribute(sizes, 1));
    geometry.setAttribute("velocity", new BufferAttribute(velocities, 3));
    geometry.setAttribute("lifetime", new BufferAttribute(lifetimes, 1));

    return geometry;
  }, [bodyHeight, tipHeight, tipRadius]);

  // Animation loop
  useFrame((_, delta) => {
    if (!particlesRef.current) return;

    const geometry = particlesRef.current.geometry as BufferGeometry;
    const positions = geometry.attributes.position as BufferAttribute;
    const velocities = geometry.attributes.velocity as BufferAttribute;
    const lifetimes = geometry.attributes.lifetime as BufferAttribute;

    if (!positions || !velocities || !lifetimes) return;

    const posArray = positions.array as Float32Array;
    const velArray = velocities.array as Float32Array;
    const lifeArray = lifetimes.array as Float32Array;

    for (let i = 0; i < posArray.length / 3; i++) {
      const idx = i * 3;
      lifeArray[i] += delta;

      if (lifeArray[i] > 3.0 || posArray[idx] < -4.0) {
        posArray[idx] = (Math.random() - 0.5) * tipRadius * 0.3;
        posArray[idx + 1] = -bodyHeight / 2 - tipHeight;
        posArray[idx + 2] = (Math.random() - 0.5) * tipRadius * 0.3;

        velArray[idx] = -1.5 - Math.random() * 2.0;
        velArray[idx + 1] = (Math.random() - 0.3) * 0.8;
        velArray[idx + 2] = (Math.random() - 0.5) * 0.4;

        lifeArray[i] = 0;
      } else {
        posArray[idx] += velArray[idx] * delta;
        posArray[idx + 1] += velArray[idx + 1] * delta;
        posArray[idx + 2] += velArray[idx + 2] * delta;

        velArray[idx + 1] -= 1.5 * delta; // gravity
        velArray[idx] *= 1.0 - delta * 0.5;
        velArray[idx + 1] *= 1.0 - delta * 0.5;
        velArray[idx + 2] *= 1.0 - delta * 0.5;
      }
    }

    positions.needsUpdate = true;
    velocities.needsUpdate = true;
    lifetimes.needsUpdate = true;
  });

  return (
    <points ref={particlesRef} position={[0, 0.05, 0]} rotation={[0, 1, 0]}>
      <primitive object={particlesGeometry} />
      <pointsMaterial
        size={0.06}
        vertexColors
        color={"black"}
        transparent
        opacity={0.8}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
};

export default ChipParticles;
