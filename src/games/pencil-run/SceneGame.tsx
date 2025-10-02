import { useFrame } from "@react-three/fiber";
import type { Vector3 } from "three";
import PaperShader from "./PaperShader";
import { RigidBody } from "@react-three/rapier";
import Pencil from "./gameObjects/Pencil";
import ChaseCube from "./gameObjects/ChaseCube";
import SpawnableMesh from "./gameObjects/SpawnableMesh";
import type { Obstacle } from "./PencilRunGame";
import { useInput } from "./hooks/inputContext";

interface GameSceneProps {
    running: boolean;
    setRunning: React.Dispatch<React.SetStateAction<boolean>>;
    gameOver: boolean;
    playerPos: React.RefObject<Vector3>;
    chaseCubePos: React.RefObject<Vector3>;
    obstacles: React.RefObject<Obstacle[]>;
    distance: number;
    setDistance: React.Dispatch<React.SetStateAction<number>>;
    setCoins: React.Dispatch<React.SetStateAction<number>>;
    setPoints: React.Dispatch<React.SetStateAction<number>>;
    setGameOver: React.Dispatch<React.SetStateAction<boolean>>;
    setPencilScale: React.Dispatch<React.SetStateAction<number>>;
    pencilScale: number;
    coins: number;
    speed: React.RefObject<number>;
    baseSpeed: React.RefObject<number>;
    nextId: React.RefObject<number>;
    spawnTimer: React.RefObject<number>;
    spawnInterval: React.RefObject<number>;
}

const randomBetween = (a: number, b: number) => a + Math.random() * (b - a);

export function GameScene({
    running,
    setRunning,
    gameOver,
    playerPos,
    chaseCubePos,
    obstacles,
    distance,
    setDistance,
    setCoins,
    setPoints,
    setGameOver,
    setPencilScale,
    pencilScale,
    coins,
    speed,
    baseSpeed,
    nextId,
    spawnTimer,
    spawnInterval,
}: GameSceneProps) {
    const [input] = useInput();

    // Spawn config
    const spawnConfig = {
      obstacle: { weight: 0.65, minDistance: 1 }, // 65% chance, min spacing 5 units
      lead: { weight: 0.2, minDistance: 8 },      // 20% chance
      coin: { weight: 0.15, minDistance: 3 },     // 15% chance
    };

    function EndGame() {
        const finalPoints = Math.floor(distance + coins * 50);
        setPoints(finalPoints);

        // get stored high score
        const storedHighScore = Number(localStorage.getItem("highScore")) || 0;

        // update if current score is higher
        if (finalPoints > storedHighScore) {
            localStorage.setItem("highScore", String(finalPoints));
        }
    
        setGameOver(true);
        setRunning(false);
    }

    useFrame((_, delta) => {
        if (!running || gameOver) return;
        
        if (!playerPos.current || !chaseCubePos.current) return;

        if (input.paused) return;

        const distInc = speed.current * delta;
        setDistance((d) => d + distInc);
        setPencilScale((s) => Math.max(0.01, s - (distInc / 40) * 0.2));

        spawnTimer.current += delta;
        spawnInterval.current = Math.max(0.45, 0.9 - Math.floor(distance / 50) * 0.05);

        if (spawnTimer.current > spawnInterval.current) {
          spawnTimer.current = 0;

          // Weighted random selection
          const rand = Math.random();
          let cumulative = 0;
          let kind: Obstacle["kind"] = "obstacle";

          for (const k of Object.keys(spawnConfig) as (keyof typeof spawnConfig)[]) {
            cumulative += spawnConfig[k].weight;
            if (rand < cumulative) {
              kind = k;
              break;
            }
          }
      
          // Ensure spacing
          const minDist = spawnConfig[kind].minDistance;
          const lastSpawn = obstacles.current[obstacles.current.length - 1];
          const safeZ =
            lastSpawn?.z != null ? Math.min(lastSpawn.z - minDist, -10) : -10;
      
          // Spawn position
          const x = randomBetween(-1.8, 1.8);
          const z = safeZ - Math.random() * 20;
      
          obstacles.current.push({
            id: nextId.current++,
            x,
            y: 0,
            z,
            kind,
          });
        }

        obstacles.current.forEach((ob) => {
            ob.z += speed.current * delta;
            const dx = ob.x - playerPos.current.x;
            const dz = ob.z - playerPos.current.z;
            const dist = Math.sqrt(dx * dx + dz * dz);

            if (ob.kind === "coin" && dist < 0.4) {
                setCoins((c) => c + 1);
                ob.z = 1000;
            }

            if (ob.kind === "lead" && dist < 0.4) {
                setPencilScale((s) => Math.min(1, parseFloat((s + 0.25).toFixed(2))));
                ob.z = 1000;
            }

            if (ob.kind === "obstacle" && dist < 0.4) {
                EndGame();
            }
        });

        obstacles.current = obstacles.current.filter((ob) => ob.z < 5);

        const left = input.left;
        const right = input.right;

        const moveSpeed = 4;

        if (left) playerPos.current.x = Math.max(-2, playerPos.current.x - moveSpeed * delta);
        if (right) playerPos.current.x = Math.min(2, playerPos.current.x + moveSpeed * delta);

        if (pencilScale <= 0.05) {
            EndGame();
        }

        speed.current = baseSpeed.current + Math.floor(distance / 20) * 0.25;

        chaseCubePos.current.x += (playerPos.current.x - chaseCubePos.current.x) * 0.05;
    });

    return (
        <>
            <ambientLight intensity={0.3} />
            <directionalLight
              castShadow
              position={[5, 10, 5]}
              intensity={1}
              shadow-mapSize-width={2048}
              shadow-mapSize-height={2048}
            />
          
            <PaperShader speed={speed.current} />

            <group position={[playerPos.current.x, playerPos.current.y + 0.3, 0]}>
                <RigidBody colliders="cuboid" restitution={0.2} friction={1} gravityScale={0}>
                    <Pencil scale={pencilScale} />
                </RigidBody>
            </group>

            {obstacles.current.map((ob) => (
                <SpawnableMesh key={ob.id} ob={ob} />
            ))}

            <ChaseCube position={chaseCubePos.current} t={distance * 0.8} />
        </>
    );
}

export default GameScene;
