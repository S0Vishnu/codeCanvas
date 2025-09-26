import { useState, useEffect, useRef } from "react";
import { Chess, Move } from "chess.js";
import { Chessboard, type PieceDropHandlerArgs } from "react-chessboard";
import Confetti from "react-confetti"; // npm i react-confetti
import "../styles/games/ChessGame.css";

type GameMode = "NONE" | "TWO_PLAYER" | "VS_COMPUTER";

type MoveEntry = {
    white: string;
    black: string;
};

export default function ChessGame() {
    const [game, setGame] = useState(new Chess());
    const [gameMode, setGameMode] = useState<GameMode>("NONE");
    const [turn, setTurn] = useState<"w" | "b">("w");
    const [moves, setMoves] = useState<MoveEntry[]>([]);
    const [timeLeft, setTimeLeft] = useState({ w: 300, b: 300 }); // 5 min each
    const timerRef = useRef<number | null>(null);

    useEffect(() => {
        if (gameMode !== "NONE" && !game.isGameOver()) {
            startTimer();
        }
        return () => stopTimer();
        // eslint-disable-next-line
    }, [turn, gameMode]);

    useEffect(() => {
        if (game.isGameOver()) {
            stopTimer(); // stop timers on game over
        }
    }, [game]);

    const startTimer = () => {
        stopTimer();
        timerRef.current = setInterval(() => {
            setTimeLeft((prev) => {
                const newTime = { ...prev };
                newTime[turn] -= 1;
                if (newTime[turn] <= 0) {
                    stopTimer();
                    setGame(new Chess()); // reset on timeout
                }
                return newTime;
            });
        }, 1000);
    };

    const stopTimer = () => {
        if (timerRef.current) clearInterval(timerRef.current);
    };

    function updateMoves(prev: MoveEntry[], result: Move): MoveEntry[] {
        if (result.color === "w") {
            // Always start new row for White
            return [...prev, { white: result.san, black: "" }];
        } else {
            // Fill Black into the latest row
            const last = prev[prev.length - 1];
            if (last) {
                return [...prev.slice(0, -1), { ...last, black: result.san }];
            }
            // If no White move yet, ignore (illegal case)
            return prev;
        }
    }

    const onPieceDrop = ({ sourceSquare, targetSquare }: PieceDropHandlerArgs) => {
        if (!targetSquare) return false;

        // In VS_COMPUTER mode, only allow White (human) to move
        if (gameMode === "VS_COMPUTER" && game.turn() !== "w") return false;

        const move = { from: sourceSquare, to: targetSquare, promotion: "q" };
        const g = new Chess(game.fen());
        const result = g.move(move);

        if (result) {
            setGame(g);

            setMoves((prev) => updateMoves(prev, result));

            // If playing against computer, let it respond
            if (gameMode === "VS_COMPUTER" && result.color === "w") {
                setTimeout(handleComputerMove, 500);
            }

            // Toggle turn
            setTurn(g.turn() as "w" | "b");

            return true;
        }

        return false;
    };

    const handleComputerMove = () => {
        setGame((currentGame) => {
            if (currentGame.isGameOver() || currentGame.turn() !== "b") return currentGame;

            const moves = currentGame.moves({ verbose: true });
            if (moves.length === 0) return currentGame;

            const idx = Math.floor(Math.random() * moves.length);
            const computerMove = moves[idx];

            const newGame = new Chess(currentGame.fen());
            const result = newGame.move({
                from: computerMove.from,
                to: computerMove.to,
                promotion: "q",
            });

            if (result) {
                setMoves((prev) => updateMoves(prev, result));
            }

            return newGame;
        });

        setTurn("w"); // back to player
    };

    const resetGame = () => {
        setGame(new Chess());
        setMoves([]);
        setTimeLeft({ w: 300, b: 300 });
        setTurn("w");
        stopTimer();
        setGameMode("NONE");
    };

    // Start Screen
    if (gameMode === "NONE") {
        return (
            <div className="chess-start-screen">
                <h1 className="chess-title">React Chess Game</h1>
                <div className="chess-controls">
                    <button className="chess-button" onClick={() => setGameMode("TWO_PLAYER")}>
                        2 Player
                    </button>
                    <button className="chess-button" onClick={() => setGameMode("VS_COMPUTER")}>
                        Vs Computer
                    </button>
                </div>
            </div>
        );
    }

    const winner = game.isGameOver() ? (game.turn() === "w" ? "Black" : "White") : null;

    return (
        <div className="chess-container">
            {winner && <Confetti />}
            <h1 className="chess-title">React Chess Game</h1>

            <div className="chess-info">
                <p>Turn: {turn === "w" ? "White" : "Black"}</p>
                <p>
                    White Timer: {Math.floor(timeLeft.w / 60)}:
                    {String(timeLeft.w % 60).padStart(2, "0")}
                </p>
                <p>
                    Black Timer: {Math.floor(timeLeft.b / 60)}:
                    {String(timeLeft.b % 60).padStart(2, "0")}
                </p>
            </div>

            <div className="container">
                <Chessboard
                    options={{
                        position: game.fen(),
                        onPieceDrop: onPieceDrop,
                        darkSquareStyle: { ...{ backgroundColor: "#2d3436" } },
                        lightSquareStyle: { ...{ backgroundColor: "#dfe6e9" } },
                        squareStyle: { ...{ borderRadius: "5px", margin: "3px" } },
                        dropSquareStyle: { ...{ borderRadius: "5px", margin: "3px" } },
                        boardStyle: {
                            borderRadius: "6px",
                            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                            width: "70vh",
                            border: "8px solid #dfe6e9",
                            outline: "8px solid #2d3436",
                        },
                        squareStyles: generateSquareStyles(game),
                    }}
                />

                <div className="chess-moves">
                    <h2>Moves</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>White</th>
                                <th>Black</th>
                            </tr>
                        </thead>
                        <tbody>
                            {moves.map((m, i) => (
                                <tr key={i}>
                                    <td>{m.white}</td>
                                    <td>{m.black}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {game.isGameOver() && (
                <div className="chess-over-screen">
                    <Confetti />
                    <div className="chess-over-content">
                        <h2>Game Over!</h2>
                        <p>{winner} Wins!</p>
                        <button className="chess-button" onClick={resetGame}>
                            Play Again
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

// Highlight last move
function generateSquareStyles(game: Chess) {
    const history = game.history({ verbose: true });
    if (!history.length) return {};
    const lastMove = history[history.length - 1];
    return {
        [lastMove.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        [lastMove.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
    };
}
