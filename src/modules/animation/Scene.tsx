import { Canvas } from "@react-three/fiber";
import {
  CameraControls,
  Environment,
  GizmoHelper,
  GizmoViewport,
} from "@react-three/drei";

const Scene = () => {
  return (
    <div style={{ width: "100vw", height: "100vh" }}>
      <Canvas camera={{ position: [0, 2, 5], fov: 50 }} shadows>
        <ambientLight intensity={0.5} />
        <directionalLight position={[15, 15, 15]} intensity={1} castShadow />
        <Environment preset="city" />
        <mesh position={[0, 1, 0]} castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial color="#e63946" />
        </mesh>

        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[100, 100]} />
          <meshStandardMaterial color="#232323" />
        </mesh>
        <CameraControls />
        <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
          <GizmoViewport
            axisColors={["#F64418", "#1ADF3E", "#1A9DDF"]}
            labelColor="black"
          />
          {/* alternative: <GizmoViewcube /> */}
        </GizmoHelper>
      </Canvas>
    </div>
  );
};

export default Scene;
