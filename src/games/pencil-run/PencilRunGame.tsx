import { useRef, useState, useEffect } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Physics, RigidBody } from "@react-three/rapier";
import "../../styles/games/PencilRunGame.css";
import PaperShader from "./PaperShader";
import Pencil from "./Pencil";
import ChaseCube from "./ChaseCube";
import { Vector3 } from "three";

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

export default function PencilRunGame() {
    const keys = useKeyInput();

    const [running, setRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [distance, setDistance] = useState(0);
    const [coins, setCoins] = useState(0);
    const [points, setPoints] = useState(0);
    const [pencilScale, setPencilScale] = useState(1);

    const playerPos = useRef(new Vector3(0, 0, 0));
    const chaseCubePos = useRef(new Vector3(0, 0, 3));
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
            setPencilScale((s) => Math.max(0.01, s - (distInc / 40) * 0.2));

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
                    setPencilScale((s) => Math.min(1, parseFloat((s + 0.1).toFixed(2))));
                    ob.z = 1000;
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

            if (pencilScale <= 0.05) {
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
                <div className="">Distance: {Math.floor(distance)} m</div>
                <div className="">Coins: {coins}</div>
                <div className="">Pencil size: {pencilScale.toFixed(2)}</div>
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
