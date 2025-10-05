import { useRef, useState, useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import "../../styles/games/PencilRunGame.css";
import { NoToneMapping, SRGBColorSpace, Vector3 } from "three";
import GameScene from "./SceneGame";
import PostProcessing from "./effects/PostProcessing";
import UI from "./ui/UI";
import { InputProvider } from "./hooks/inputContext";
import { MusicProvider } from "./hooks/MusicContext";
import { SettingsUI } from "./ui/Settings";
import { StartGameScreen } from "./ui/StartGameScreen"; // <-- import

export type Obstacle = {
    id: number;
    x: number;
    y: number;
    z: number;
    kind: "obstacle" | "lead" | "coin";
};

export default function PencilRunGame() {
    const [running, setRunning] = useState(false);
    const [gameOver, setGameOver] = useState(false);
    const [distance, setDistance] = useState(0);
    const [coins, setCoins] = useState(0);
    const [points, setPoints] = useState(0);
    const [pencilScale, setPencilScale] = useState(1);

    const [showStartScreen, setShowStartScreen] = useState(true); // <-- new

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
        if (!showStartScreen) {
            resetGame(); // start game when start screen closes
        }
    }, [showStartScreen]);

    return (
        <InputProvider>
            <MusicProvider>
                <div className="game-container">
                    {/* START SCREEN */}
                    {showStartScreen && (
                        <StartGameScreen
                            onStart={() => setShowStartScreen(false)}
                        />
                    )}

                    {/* GAME CANVAS */}
                    <Canvas
                        shadows
                        className="game-canvas"
                        camera={{
                            fov: 60,
                            near: 0.1,
                            far: 1000,
                            position: [0, 3.2, 6],
                        }}
                        onCreated={({ gl }) => {
                            gl.outputColorSpace = SRGBColorSpace;
                            gl.toneMapping = NoToneMapping;
                        }}
                        frameloop="demand"
                        gl={{
                            antialias: true,
                            preserveDrawingBuffer: true,
                        }}
                    >
                        <PostProcessing />

                        <Physics>
                            <GameScene
                                running={!showStartScreen && running}
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
                                nextId={nextId}
                                spawnTimer={spawnTimer}
                                spawnInterval={spawnInterval}
                            />
                        </Physics>
                    </Canvas>

                    <SettingsUI />

                    {!showStartScreen && (
                        <UI
                            distance={distance}
                            coins={coins}
                            pencilScale={pencilScale}
                            gameOver={gameOver}
                            points={points}
                            resetGame={resetGame}
                        />
                    )}
                </div>
            </MusicProvider>
        </InputProvider>
    );
}
