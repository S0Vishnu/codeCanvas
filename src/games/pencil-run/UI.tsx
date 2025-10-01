import React from "react";

type UIProps = {
  distance: number;
  coins: number;
  pencilScale: number;
  gameOver: boolean;
  points?: number;
  resetGame: () => void;
};

const UI: React.FC<UIProps> = ({
  distance,
  coins,
  pencilScale,
  gameOver,
  points,
  resetGame,
}) => {
  const highScore = Number(localStorage.getItem("highScore")) || 0;
  return (
    <>
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
            <p>High Score: {highScore}</p>
            <p>Distance: {Math.floor(distance)} m</p>
            <p>Coins: {coins}</p>
            <p>Points: {points || Math.floor(distance + coins * 50)}</p>
            <button className="play-again-btn" onClick={resetGame}>
              Play Again
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UI;
