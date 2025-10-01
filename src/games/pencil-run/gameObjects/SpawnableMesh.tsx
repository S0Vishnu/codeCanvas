import React, { useRef } from "react";
import { Mesh } from "three";
import { animated, useSpring } from "@react-spring/three";
import Obstacles from "./Obstacles";
import PowerUps from "./PowerUps";
import Coins from "./Coins";
import type { Obstacle } from "../PencilRunGame";

type SpawnableMeshProps = {
  ob: Obstacle;
};

const SpawnableMesh: React.FC<SpawnableMeshProps> = ({ ob }) => {
  const meshRef = useRef<Mesh>(null);

  // Spawn animation: scale from 0 to 1, y-position from some offset to ob.y
  const { scale, y } = useSpring({
    from: { scale: 0, y: ob.y + 2 }, // start slightly above
    to: { scale: 1, y: ob.y },
    config: { mass: 1, tension: 120, friction: 14 },
  });

  const renderChild = () => {
    switch (ob.kind) {
      case "obstacle":
        return <Obstacles />;
      case "lead":
        return <PowerUps />;
      case "coin":
      default:
        return <Coins />;
    }
  };

  return (
    <animated.mesh
      ref={meshRef}
      position-x={ob.x}
      position-y={y}
      position-z={ob.z}
      castShadow
      scale={scale}
    >
      {renderChild()}
    </animated.mesh>
  );
};

export default SpawnableMesh;
