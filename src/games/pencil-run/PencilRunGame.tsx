import React, { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { Physics, RigidBody } from "@react-three/rapier";
import "../../styles/games/PencilRunGame.css";

/** Pencil Run Game */

type Obstacle = {
    id: number;
    x: number;
    y: number;
    z: number;
    kind: "obstacle" | "lead" | "gem";
};

const randomBetween = (a: number, b: number) => a + Math.random() * (b - a);

function useKeyInput() {
    const keys = useRef<Record<string, boolean>>({});
    useEffect(() => {
        const onDown = (e: KeyboardEvent) => (keys.current[e.code] = true);
        const onUp = (e: KeyboardEvent) => (keys.current[e.code] = false);
        window.addEventListener("keydown", onDown);
        window.addEventListener("keyup", onUp);
        return () => {
            window.removeEventListener("keydown", onDown);
            window.removeEventListener("keyup", onUp);
        };
    }, []);
    return keys;
}

const Pencil: React.FC<{ scale: number }> = ({ scale }) => (
    <group position={[0, scale - 1, 0]}>
        <mesh castShadow>
            <cylinderGeometry args={[0.15, 0.15, scale, 12]} />
            <meshStandardMaterial color="#f4a460" />
        </mesh>
        <mesh position={[0, -0.75, 0]} rotation={[Math.PI, 0, 0]}>
            <coneGeometry args={[0.13, 0.6, 12]} />
            <meshStandardMaterial color="#2b2b2b" />
        </mesh>
        <mesh position={[0, 0.75 * scale, 0]}>
            <boxGeometry args={[0.32, 0.12, 0.32]} />
            <meshStandardMaterial color="#f08080" />
        </mesh>
    </group>
);

const ChaseCube: React.FC<{ position: THREE.Vector3; t: number }> = ({ position, t }) => {
    const bob = Math.sin(t * 2) * 0.1;
    return (
        <mesh position={[position.x, position.y + bob, position.z]}>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#8b0000" />
        </mesh>
    );
};

// Paper shader with scrolling lines
const PaperShader: React.FC<{ speed: number }> = ({ speed }) => {
    const materialRef = useRef<THREE.ShaderMaterial>(null);
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

export default function PencilRunGame() {
    const keys = useKeyInput();

    const [running, setRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [distance, setDistance] = useState(0);
    const [coins, setCoins] = useState(0);
    const [points, setPoints] = useState(0);
    const [pencilScale, setPencilScale] = useState(1);

    const playerPos = useRef(new THREE.Vector3(0, 0, 0));
    const chaseCubePos = useRef(new THREE.Vector3(0, 0, 3));
    const baseSpeed = useRef(6);
    const speed = useRef(baseSpeed.current);

    const obstacles = useRef<Obstacle[]>([]);
    const nextId = useRef(1);
    const spawnTimer = useRef(0);
    const spawnInterval = useRef(0.9);

    function resetGame() {
        obstacles.current = [];
        nextId.current = 1;
        spawnTimer.current = 0;
        setDistance(0);
        setCoins(0);
        speed.current = baseSpeed.current;
        setPencilScale(1);
        playerPos.current.set(0, 0, 0);
        setGameOver(false);
        setRunning(true);
    }

    useEffect(() => {
        resetGame();
    }, []);

    function Scene() {
        const { camera } = useThree();
        camera.position.set(0, 3.2, 6);
        camera.lookAt(0, 0, 0);

        useFrame((_, delta) => {
            if (!running || gameOver) return;

            const distInc = speed.current * delta;
            setDistance((d) => d + distInc);
            setPencilScale((s) => Math.max(0.25, s - (distInc / 40) * 0.2));

            spawnTimer.current += delta;
            spawnInterval.current = Math.max(0.45, 0.9 - Math.floor(distance / 50) * 0.05);

            if (spawnTimer.current > spawnInterval.current) {
                spawnTimer.current = 0;
                const kindRand = Math.random();
                const kind: Obstacle["kind"] =
                    kindRand < 0.65 ? "obstacle" : kindRand < 0.85 ? "lead" : "gem";
                const x = randomBetween(-1.8, 1.8);
                const z = -30 - Math.random() * 20;
                obstacles.current.push({ id: nextId.current++, x, y: 0, z, kind });
            }

            obstacles.current.forEach((ob) => {
                ob.z += speed.current * delta;
                const dx = ob.x - playerPos.current.x;
                const dz = ob.z - playerPos.current.z;
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (ob.kind === "gem" && dist < 0.4) {
                    setCoins((c) => c + 1);
                    ob.z = 1000;
                }

                if (ob.kind === "lead" && dist < 0.4) {
                    console.log("scale: ", pencilScale);
                    const scale = parseFloat(pencilScale.toFixed(2));
                    console.log("scale: ", scale);
                    // setPencilScale(scale + 0.1);
                }

                if (ob.kind === "obstacle" && dist < 0.4) {
                    setGameOver(true);
                    setRunning(false);
                    setPoints(Math.floor(distance + coins * 50));
                }
            });

            obstacles.current = obstacles.current.filter((ob) => ob.z < 5);

            const left = keys.current["ArrowLeft"] || keys.current["KeyA"];
            const right = keys.current["ArrowRight"] || keys.current["KeyD"];
            const moveSpeed = 4;
            if (left) playerPos.current.x = Math.max(-2, playerPos.current.x - moveSpeed * delta);
            if (right) playerPos.current.x = Math.min(2, playerPos.current.x + moveSpeed * delta);

            if (pencilScale <= 0.27) {
                setGameOver(true);
                setRunning(false);
                setPoints(Math.floor(distance + coins * 50));
            }

            speed.current = baseSpeed.current + Math.floor(distance / 20) * 0.25;

            chaseCubePos.current.x += (playerPos.current.x - chaseCubePos.current.x) * 0.05;
        });

        return (
            <>
                <ambientLight intensity={0.6} />
                <directionalLight position={[5, 10, 5]} castShadow intensity={0.8} />
                <PaperShader speed={speed.current} />

                <group position={[playerPos.current.x, playerPos.current.y + 0.3, 0]}>
                    <RigidBody colliders="cuboid" restitution={0.2} friction={1}>
                        <Pencil scale={pencilScale} />
                    </RigidBody>
                </group>

                {obstacles.current.map((ob) => (
                    <mesh key={ob.id} position={[ob.x, ob.y, ob.z]} castShadow>
                        {ob.kind === "obstacle" ? (
                            <boxGeometry args={[0.7, 0.7, 0.7]} />
                        ) : ob.kind === "lead" ? (
                            <cylinderGeometry args={[0.12, 0.12, 0.18, 8]} />
                        ) : (
                            <octahedronGeometry args={[0.25, 0]} />
                        )}
                        <meshStandardMaterial
                            color={
                                ob.kind === "obstacle"
                                    ? "#555"
                                    : ob.kind === "lead"
                                    ? "#8b4513"
                                    : "#4dd0e1"
                            }
                        />
                    </mesh>
                ))}

                <ChaseCube position={chaseCubePos.current} t={distance * 0.8} />
            </>
        );
    }

    return (
        <div className="game-container">
            <Canvas shadows className="game-canvas">
                <Physics>
                    <Scene />
                </Physics>
            </Canvas>

            <div className="hud">
                <div className="hud-title">Pencil Run</div>
                <div>Distance: {Math.floor(distance)} m</div>
                <div>Coins: {coins}</div>
                <div>Pencil size: {pencilScale.toFixed(2)}</div>
            </div>

            {gameOver && (
                <div className="gameover-overlay">
                    <div className="gameover-box">
                        <h2>Game Over</h2>
                        <p>Distance: {Math.floor(distance)} m</p>
                        <p>Coins: {coins}</p>
                        <p>Points: {points || Math.floor(distance + coins * 50)}</p>
                        <button className="play-again-btn" onClick={resetGame}>
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
