import { useFrame } from "@react-three/fiber";
import { useRef, useMemo } from "react";
import type { ShaderMaterial } from "three";

const PaperShader: React.FC<{ speed: number }> = ({ speed }) => {
    const materialRef = useRef<ShaderMaterial>(null);

    // constants for colors and lines
    const BASE_COLOR = [0.02, 0.02, 0.02]; // Black
    const STRIPE_COLOR = [0.1, 0.3, 0.8]; // Blue
    const TOTAL_LINE_HEIGHT = 14.0; // 2px blue + 15px black = 17px total

    // uniforms created only once
    const uniforms = useMemo(
        () => ({
            uTime: { value: 0 },
            uBumpStrength: { value: 0.1 },
            uDisplacementStrength: { value: 0.05 },
            uBaseColor: { value: BASE_COLOR },
            uStripeColor: { value: STRIPE_COLOR },
            uTotalLineHeight: { value: TOTAL_LINE_HEIGHT },
        }),
        []
    );

    useFrame((_, delta) => {
        const mat = materialRef.current;
        if (mat) {
            mat.uniforms.uTime.value += speed * delta * 0.04;
        }
    });

    return (
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
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
                    uniform vec3 uBaseColor;
                    uniform vec3 uStripeColor;
                    uniform float uTotalLineHeight;
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
                        // Calculate pattern position (0 to 1 within each 17px segment)
                        float patternPos = fract(vUv.y * uTotalLineHeight + uTime);
                        
                        // Crisp blue line: first 2px of the 17px segment using step function
                        float blueLine = step(patternPos, 0.02);
                        
                        vec3 color = mix(uBaseColor, uStripeColor, blueLine);

                        float n = noise(vUv * 20.0 + uTime * 0.1);
                        vec3 fakeNormal = normalize(vNormal + uBumpStrength * vec3(dFdx(n), dFdy(n), 0.0));

                        vec3 lightDir = normalize(vec3(0.3, 0.6, 0.8));
                        float diffuse = max(dot(fakeNormal, lightDir), 0.0);

                        color = color * (0.3 + 0.7 * diffuse);

                        gl_FragColor = vec4(color, 1.0);
                    }
                `}
            />
        </mesh>
    );
};

export default PaperShader;