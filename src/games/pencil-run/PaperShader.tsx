import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import type { ShaderMaterial } from "three";

const PaperShader: React.FC<{ speed: number }> = ({ speed }) => {
  const materialRef = useRef<ShaderMaterial>(null);

  // uniforms created only once
  const uniforms = useMemo(
    () => ({
      uTime: { value: 0 },
      uBumpStrength: { value: 0.1 },
      uDisplacementStrength: { value: 0.05 },
    }),
    []
  );

  useFrame((_, delta) => {
    const mat = materialRef.current;
    if (mat) {
      mat.uniforms.uTime.value += speed * delta * 0.5;
    }
  });

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, -0.51, 0]}
      receiveShadow
    >
      <planeGeometry args={[10, 400, 256, 256]} />
      <shaderMaterial
        ref={materialRef}
        uniforms={uniforms}
        vertexShader={`
          uniform float uTime;
          uniform float uDisplacementStrength;
          varying vec2 vUv;
          varying vec3 vNormal;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          float noise(vec2 p){
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) +
                   (c - a)* u.y * (1.0 - u.x) +
                   (d - b) * u.x * u.y;
          }

          void main() {
            vUv = uv;
            vNormal = normal;

            float n = noise(uv * 20.0 + uTime * 0.1);
            vec3 displacedPosition = position + normal * n * uDisplacementStrength;

            gl_Position = projectionMatrix * modelViewMatrix * vec4(displacedPosition, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform float uBumpStrength;
          varying vec2 vUv;
          varying vec3 vNormal;

          float hash(vec2 p) {
            return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
          }
          float noise(vec2 p){
            vec2 i = floor(p);
            vec2 f = fract(p);
            float a = hash(i);
            float b = hash(i + vec2(1.0, 0.0));
            float c = hash(i + vec2(0.0, 1.0));
            float d = hash(i + vec2(1.0, 1.0));
            vec2 u = f * f * (3.0 - 2.0 * f);
            return mix(a, b, u.x) +
                   (c - a)* u.y * (1.0 - u.x) +
                   (d - b) * u.x * u.y;
          }

          void main() {
            vec3 baseColor = vec3(0.05);

            float stripe = smoothstep(0.45, 0.55, fract(vUv.y * 60.0 + uTime));
            baseColor = mix(baseColor, vec3(0.2), stripe * 0.4);

            float n = noise(vUv * 20.0 + uTime * 0.1);
            vec3 fakeNormal = normalize(vNormal + uBumpStrength * vec3(dFdx(n), dFdy(n), 0.0));

            vec3 lightDir = normalize(vec3(0.3, 0.6, 0.8));
            float diffuse = max(dot(fakeNormal, lightDir), 0.0);

            vec3 color = baseColor * (0.3 + 0.7 * diffuse);

            gl_FragColor = vec4(color, 1.0);
          }
        `}
      />
    </mesh>
  );
};

export default PaperShader;
