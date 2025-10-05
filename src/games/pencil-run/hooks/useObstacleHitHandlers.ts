import { useMusic } from "./MusicContext";

export function useObstacleHitHandlers(
    setCoins: React.Dispatch<React.SetStateAction<number>>,
    setPencilScale: React.Dispatch<React.SetStateAction<number>>,
    EndGame: () => void
) {
    const { playSfx } = useMusic();

    const handleObstacleHit = (kind: string) => {
        switch (kind) {
            case "coin":
                playSfx("coin");
                setCoins((c) => c + 1);
                break;

            case "lead":
                playSfx("powerup");
                setPencilScale((s) =>
                    Math.min(1, parseFloat((s + 0.25).toFixed(2)))
                );
                break;

            case "obstacle":
                EndGame();
                break;
        }
    };

    return { handleObstacleHit };
}
