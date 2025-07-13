import { Environment, GizmoHelper, GizmoViewport, Grid, OrbitControls } from "@react-three/drei";

const EnvironmentAndLights = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[15, 15, 15]} intensity={1} castShadow />
      <Environment preset="city" />
      <Grid
        infiniteGrid
        cellSize={0.5}
        sectionSize={5}
        sectionColor="#444"
        cellColor="#666"
        fadeDistance={30}
        fadeStrength={1}
        followCamera={false}
      />
      <OrbitControls />
      <GizmoHelper alignment="bottom-right" margin={[80, 80]}>
        <GizmoViewport
          axisColors={["#F64418", "#1ADF3E", "#1A9DDF"]}
          labelColor="black"
        />
      </GizmoHelper>
    </>
  );
};

export default EnvironmentAndLights;
