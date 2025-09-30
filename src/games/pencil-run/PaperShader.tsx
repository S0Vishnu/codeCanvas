import { useFrame } from "@react-three/fiber";
import { useRef } from "react";
import type { ShaderMaterial } from "three";

const PaperShader: React.FC<{ speed: number }> = ({ speed }) => {
    const materialRef = useRef<ShaderMaterial>(null);
    useFrame((_, delta) => {
        if (materialRef.current) {
            materialRef.current.uniforms.uTime.value -= speed * delta;
        }
    });
    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
            <planeGeometry args={[60, 400, 1, 1]} />
            <shaderMaterial
                ref={materialRef}
                uniforms={{ uTime: { value: 0 } }}
                vertexShader={`
                  varying vec2 vUv;
                  void main() {
                    vUv = uv;
                    gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);
                  }
                `}
                fragmentShader={`
                  uniform float uTime;
                  varying vec2 vUv;
                  void main() {
                    vec3 color = vec3(0.05); // dark background
                    float stripe = smoothstep(0.45, 0.55, fract(vUv.y * 60.0 + uTime));
                    color = mix(color, vec3(0.2), stripe*0.4);
                    gl_FragColor = vec4(color, 1.0);
                  }
                `}
            />
        </mesh>
    );
};

export default PaperShader;