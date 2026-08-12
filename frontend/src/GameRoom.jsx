import React, { useState, useEffect } from 'react';

export default function GameRoom({ playerId, gameState, sendGuess, sendFlip, sendResolveBet, sendPlayAgain }) {
  const [stockTicker, setStockTicker] = useState('');
  const [stockAmount, setStockAmount] = useState('');

  // Manage the 3D coin rotation state locally
  const [flipDegrees, setFlipDegrees] = useState(0);
  const [flipCount, setFlipCount] = useState(0);

  // Trigger the coin spin when the server broadcasts a flip result
  useEffect(() => {
    if (gameState.flipResult) {
      const newCount = flipCount + 1;
      setFlipCount(newCount);

      const baseSpins = newCount * 3600;
      const degrees = gameState.flipResult.result === 'heads' ? baseSpins : baseSpins + 180;
      setFlipDegrees(degrees);
    }
  }, [gameState.flipResult]);

  const players = Object.keys(gameState.scores);
  const playerA = players[0] || 'Waiting...';
  const playerB = players[1] || 'Waiting...';

  return (
    <div className="flex flex-col flex-grow items-center w-full max-w-2xl mx-auto p-4">

      {/* Role Banner */}
      {gameState.myRole && (
        <div className="bg-[#007bff1a] text-[#9fd3ff] p-3 rounded-lg border border-[#007bff4d] font-bold mb-6 w-full text-center">
          {gameState.myRole === 'guesser' ? "You are the GUESSER 🤔" : "You are the FLIPPER 🪙"}
        </div>
      )}

      {/* Scoreboard */}
      <div className="glass-panel w-full flex justify-between items-center p-4 rounded-xl mb-6">
        <div className="text-xl font-bold">{playerA}: {gameState.scores[playerA] || 0}</div>
        <div className="text-accentBlue font-bold">Toss: {gameState.currentToss}/{gameState.maxTosses}</div>
        <div className="text-xl font-bold">{playerB}: {gameState.scores[playerB] || 0}</div>
      </div>

      {/* The 3D Coin */}
      <div id="coin-wrapper">
        <div id="coin" style={{ transform: `rotateX(${flipDegrees}deg)` }}>
          <div className="side heads">
            <div className="coin-rim"></div>
            <div className="coin-face">
              <div className="coin-ring"></div>
              <span className="coin-symbol">👤</span>
            </div>
          </div>
          <div className="side tails">
            <div className="coin-rim"></div>
            <div className="coin-face">
              <div className="coin-chakra"></div>
              <span className="coin-symbol text-3xl">❀</span>
            </div>
          </div>
        </div>
      </div>

      {/* Game Status */}
      <div className="text-textMuted text-lg mt-4 min-h-[2rem]">
        {gameState.statusMessage}
      </div>

      {/* Controls */}
      <div className="mt-6 w-full flex flex-col items-center">
        {gameState.awaitingGuess && gameState.myRole === 'guesser' && (
          <div className="flex flex-col items-center gap-3">
            <p className="text-white">Your call — heads or tails?</p>
            <div className="flex gap-4">
              <button onClick={() => sendGuess('heads')} className="bg-accentBlue hover:bg-accentHover text-white px-6 py-2 rounded-lg font-bold">Heads</button>
              <button onClick={() => sendGuess('tails')} className="bg-[#555] hover:bg-[#666] text-white px-6 py-2 rounded-lg font-bold">Tails</button>
            </div>
          </div>
        )}

        {!gameState.awaitingGuess && gameState.myRole === 'flipper' && !gameState.gameOver && !gameState.resolutionPending && (
          <button
            onClick={sendFlip}
            disabled={gameState.flipResult !== null}
            className="bg-accentGreen hover:bg-[#218838] text-white px-8 py-3 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(40,167,69,0.3)]"
          >
            Flip Coin!
          </button>
        )}
      </div>

      {/* Resolution & Game Over Panels */}
      {(gameState.resolutionPending || gameState.gameOver) && (
        <div className="glass-panel mt-8 p-6 rounded-xl w-full text-center">
          <h2 className="text-2xl font-bold mb-2">
            {gameState.winner === 'tie' ? "It's a Tie!" : `${gameState.winner} wins! 🏆`}
          </h2>

          {gameState.resolutionPending && playerId === gameState.loser && (
            <div className="flex flex-col items-center mt-4 gap-3">
              <p className="text-[#ffc107] font-bold mb-2">Time to pay up! What stock did you buy for the winner?</p>
              <input
                type="text"
                placeholder="Stock Ticker (e.g., RELIANCE)"
                value={stockTicker}
                onChange={(e) => setStockTicker(e.target.value)}
                className="p-3 bg-black/30 border border-border rounded-lg text-white w-3/4 focus:border-accentBlue focus:outline-none"
              />
              <input
                type="number"
                placeholder="Amount Sent (₹)"
                value={stockAmount}
                onChange={(e) => setStockAmount(e.target.value)}
                className="p-3 bg-black/30 border border-border rounded-lg text-white w-3/4 focus:border-accentBlue focus:outline-none"
              />
              <button
                onClick={() => sendResolveBet(stockTicker, parseFloat(stockAmount))}
                className="bg-accentGreen hover:bg-[#218838] text-white px-6 py-3 rounded-lg font-bold w-3/4 mt-2"
              >
                Commit Transfer
              </button>
            </div>
          )}

          {gameState.resolutionPending && playerId === gameState.winner && (
            <p className="mt-4">You won! Waiting for {gameState.loser} to pay up and gift you a stock...</p>
          )}

          {!gameState.resolutionPending && gameState.gameOver && (
            <button
              onClick={sendPlayAgain}
              className="bg-accentBlue hover:bg-accentHover text-white px-6 py-3 rounded-lg font-bold mt-6"
            >
              Play Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}
