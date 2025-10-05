import { useMusic } from "../hooks/MusicContext";

type StartGameScreenProps = {
    onStart: () => void;
};

export function StartGameScreen({ onStart }: StartGameScreenProps) {
    const { playTrack, playSfx } = useMusic();

    const handleStart = () => {
        playSfx("click");
        playTrack("theme", true);
        onStart();
    };

    return (
        <div className="start-screen-overlay">
            <div className="start-screen-box">
                <h1 className="start-screen-title">Pencil Run</h1>
                <p className="start-screen-text">Click Start to Play!</p>
                <button className="start-screen-btn" onClick={handleStart}>
                    Start Game
                </button>
            </div>
        </div>
    );
}
