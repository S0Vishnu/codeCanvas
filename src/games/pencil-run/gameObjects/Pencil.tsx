import {
  BackSide,
  AdditiveBlending,
  ShaderMaterial,
  Vector2,
  Color,
} from "three";
import React, { useRef, useMemo } from "react";
import { useFrame } from "@react-three/fiber";

// Import particles component
import ChipParticles from '../effects/ChipParticles';
import { coneTrailFragment, coneTrailVertex } from "../effects/shaders/speedLineShader";

const Pencil: React.FC<{ scale: number }> = ({ scale }) => {
  // Base dimensions
  const bodyHeight = scale;
  const bodyRadius = 0.15;
  const tipHeight = 0.6;
  const tipRadius = 0.13;
  const eraserHeight = 0.24;
  const eraserRadiusTop = 0.16;
  const eraserRadiusBottom = 0.18;

  // Cone trail dimensions
  const coneHeight = 2;
  const coneRadius = 1.2;

  // Refs
  const coneTrailRef = useRef<ShaderMaterial>(null!);

  // Cone trail shader uniforms
  const coneTrailUniforms = useMemo(() => ({
    time: { value: 0 },
    threshold: { value: 0.1 },
    scaleU: { value: 30.0 },
    scaleV: { value: 1.0 },
    direction: { value: new Vector2(0, 1.0) },
    speed: { value: 5.0 / scale },
    rotation: { value: 0.0 },
    color1: { value: new Color(0xffffff) },
    color2: { value: new Color(0x808080) },
    fadeStrength: { value: 1.0 },
    fadeAxis: { value: new Vector2(0.0, 1.0) },
    fadeOffset: { value: 0.5 },
    fadeSmoothness: { value: 0.5 },
    fadeRotation: { value: 0.1 },
  }), []);

  // Animation loop for shader
  useFrame((_, delta) => {
    if (coneTrailRef.current) {
      coneTrailRef.current.uniforms.time.value += delta;
    }
  });

  return (
    <group position={[0, 0.3, 0]}>
      {/* Cone Trail - positioned behind pencil */}
      <mesh position={[0, 0, 0.5]} rotation={[-Math.PI / 2, 0, 0]}>
        <coneGeometry args={[coneRadius, coneHeight, 32, 32, true]} />
        <shaderMaterial
          ref={coneTrailRef}
          uniforms={coneTrailUniforms}
          vertexShader={coneTrailVertex}
          fragmentShader={coneTrailFragment}
          transparent
          blending={AdditiveBlending}
          depthWrite={false}
          side={BackSide}
        />
      </mesh>

      {/* Chip Particles */}
      <ChipParticles 
        bodyHeight={bodyHeight}
        tipHeight={tipHeight}
        tipRadius={tipRadius}
      />

      {/* Pencil body */}
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 6]} />
        <meshStandardMaterial color="#f4a460" />
      </mesh>

      {/* Pencil tip */}
      <mesh
        position={[0, -bodyHeight / 2 - tipHeight / 2, 0]}
        rotation={[Math.PI, 0, 0]}
      >
        <coneGeometry args={[tipRadius, tipHeight, 8]} />
        <meshStandardMaterial color="#2b2b2b" />
      </mesh>

      {/* Pencil eraser */}
      <mesh position={[0, bodyHeight / 2 + eraserHeight / 2, 0]}>
        <cylinderGeometry
          args={[eraserRadiusTop, eraserRadiusBottom, eraserHeight, 8]}
        />
        <meshStandardMaterial color="#f08080" />
      </mesh>

      {/* Outline mesh */}
      <group scale={[1.3, 1.05, 1]}>
        <mesh castShadow position={[0, 0, 0]}>
          <cylinderGeometry args={[bodyRadius, bodyRadius, bodyHeight, 6]} />
          <meshBasicMaterial color="black" side={BackSide} />
        </mesh>
        <mesh
          position={[0, -bodyHeight / 2 - tipHeight / 2, 0]}
          rotation={[Math.PI, 0, 0]}
        >
          <coneGeometry args={[tipRadius, tipHeight, 8]} />
          <meshBasicMaterial color="black" side={BackSide} />
        </mesh>
        <mesh position={[0, bodyHeight / 2 + eraserHeight / 2, 0]}>
          <cylinderGeometry
            args={[eraserRadiusTop, eraserRadiusBottom, eraserHeight, 8]}
          />
          <meshBasicMaterial color="black" side={BackSide} />
        </mesh>
      </group>
    </group>
  );
};

export default Pencil;