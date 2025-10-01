import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import "../../styles/games/PencilRunGame.css";
import { Vector3 } from "three";
import GameScene from "./SceneGame";
import PostProcessing from "./effects/PostProcessing";

type Obstacle = {
    id: number;
    x: number;
    y: number;
    z: number;
    kind: "obstacle" | "lead" | "gem";
};

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

    return (
        <div className="game-container">
            <Canvas shadows className="game-canvas">
                <PostProcessing />

                <Physics>
                    <GameScene
                        running={running}
                        setRunning={setRunning}
                        gameOver={gameOver}
                        playerPos={playerPos}
                        chaseCubePos={chaseCubePos}
                        obstacles={obstacles}
                        distance={distance}
                        setDistance={setDistance}
                        setCoins={setCoins}
                        setPoints={setPoints}
                        setGameOver={setGameOver}
                        setPencilScale={setPencilScale}
                        pencilScale={pencilScale}
                        coins={coins}
                        speed={speed}
                        baseSpeed={baseSpeed}
                        keys={keys}
                        nextId={nextId}
                        spawnTimer={spawnTimer}
                        spawnInterval={spawnInterval}
                    />
                </Physics>
            </Canvas>

            <div className="hud">
                <div className="hud-title">Pencil Run</div>

                <div className="hud-top-right">
                    <div>
                        Distance: <span>{Math.floor(distance)} m</span>
                    </div>
                    <div>
                        Coins: <span>{coins}</span>
                    </div>
                </div>

                <div className="hud-bottom-right">
                    <div>
                        Pencil size: <span>{pencilScale.toFixed(2)}</span>
                    </div>
                </div>
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
