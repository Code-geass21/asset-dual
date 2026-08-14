import React, { useState, useEffect } from 'react';

export default function GameRoom({ playerId, gameState, sendGuess, sendFlip, sendResolveBet, sendPlayAgain }) {
  // New robust portfolio states
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedStock, setSelectedStock] = useState(null);
  const [shares, setShares] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');

  const [flipDegrees, setFlipDegrees] = useState(0);
  const [flipCount, setFlipCount] = useState(0);
  const [viewedHistory, setViewedHistory] = useState(false);

  useEffect(() => {
    if (gameState.flipResult) {
      const newCount = flipCount + 1;
      setFlipCount(newCount);

      const baseSpins = newCount * 3600;
      const degrees = gameState.flipResult.result === 'heads' ? baseSpins : baseSpins + 180;
      setFlipDegrees(degrees);
    }
  }, [gameState.flipResult]);

  const isGameFinished = gameState.resolutionPending || gameState.gameOver;

  // Reset resolution states cleanly on new game
  useEffect(() => {
    if (gameState.currentToss === 0 && !gameState.gameOver) {
      setViewedHistory(false);
      setSearchQuery('');
      setSearchResults([]);
      setSelectedStock(null);
      setShares('');
      setPurchasePrice('');
    }
  }, [gameState.currentToss, gameState.gameOver]);

  // Debounced search hook: Pings our FastAPI Yahoo Finance endpoint when user types!
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch('/api/search-ticker?q=' + encodeURIComponent(searchQuery));
        const data = await res.json();
        setSearchResults(data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsSearching(false);
      }
    }, 500); // Wait 500ms after user stops typing to ping API

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const players = Object.keys(gameState.scores);
  const playerA = players[0] || 'Waiting...';
  const playerB = players[1] || 'Waiting...';

  // ==========================================
  // PHASE 0: WAITING FOR OPPONENT
  // ==========================================
  if (!gameState.gameStarted && !gameState.gameOver) {
    return (
      <div className="flex flex-col flex-1 h-full w-full items-center justify-center animate-fade-in py-12">
        <div className="text-7xl sm:text-8xl mb-6 animate-bounce">🪙</div>
        <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2 text-center">Waiting for Challenger...</h2>
        <p className="text-textMuted text-base sm:text-lg text-center">Another player needs to log in to begin.</p>
      </div>
    );
  }

  // ==========================================
  // PHASE 2: THE HISTORY TABLE
  // ==========================================
  if (isGameFinished && !viewedHistory) {
    return (
      <div className="flex flex-col flex-1 h-full w-full max-w-2xl mx-auto items-center justify-center animate-fade-in">
        <div className="glass-panel w-full p-4 sm:p-6 rounded-2xl flex flex-col max-h-[80vh]">
          <h2 className="text-2xl sm:text-3xl font-bold mb-2 text-center">
            {gameState.winner === 'tie' ? "It's a Tie!" : gameState.winner + " wins! 🏆"}
          </h2>
          <p className="text-textMuted mb-4 text-center text-sm sm:text-base">The secret results have been revealed!</p>

          <div className="w-full overflow-y-auto rounded-xl border border-border bg-black/40 mb-4 flex-1 min-h-0 hide-scrollbar">
            <table className="w-full table-fixed text-xs sm:text-sm text-center text-textMain relative">
              <thead className="bg-black/80 text-textMuted uppercase text-[10px] sm:text-xs border-b border-border sticky top-0 z-10">
                <tr>
                  <th className="p-2 w-1/5">Toss</th>
                  <th className="p-2 w-1/5">Guesser</th>
                  <th className="p-2 w-1/5">Guess</th>
                  <th className="p-2 w-1/5">Result</th>
                  <th className="p-2 w-1/5">Won By</th>
                </tr>
              </thead>
              <tbody>
                {gameState.flipHistory && gameState.flipHistory.map((h, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
                    <td className="p-2 text-textMuted truncate">#{h.toss}</td>
                    <td className="p-2 truncate">{h.guesser}</td>
                    <td className="p-2 capitalize truncate">{h.guess}</td>
                    <td className="p-2 capitalize font-bold text-accentBlue truncate">{h.result}</td>
                    <td className="p-2 font-bold text-accentGreen truncate">{h.winner}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <button
            onClick={() => setViewedHistory(true)}
            className="bg-accentBlue hover:bg-accentHover text-white py-3 rounded-xl font-bold shadow-lg w-full transition-transform active:scale-95 text-sm sm:text-base shrink-0"
          >
            Continue to Resolution
          </button>
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 3: RESOLUTION & PLAY AGAIN
  // ==========================================
  if (isGameFinished && viewedHistory) {
    return (
      <div className="flex flex-col flex-1 h-full w-full max-w-2xl mx-auto items-center justify-center animate-fade-in">

        <div className="glass-panel w-full flex justify-between items-center p-3 sm:p-4 rounded-xl mb-4 shrink-0 gap-2">
          <div className="text-sm sm:text-xl font-bold text-accentGreen flex-1 truncate text-left">{playerA}: {gameState.scores[playerA] || 0}</div>
          <div className="text-xs sm:text-base text-textMuted font-bold whitespace-nowrap px-1">FINAL SCORE</div>
          <div className="text-sm sm:text-xl font-bold text-accentGreen flex-1 truncate text-right">{playerB}: {gameState.scores[playerB] || 0}</div>
        </div>

        <div className="glass-panel w-full p-6 sm:p-8 rounded-2xl text-center flex flex-col justify-center flex-1">
          <h2 className="text-2xl sm:text-3xl font-bold mb-6">
            {gameState.winner === 'tie' ? "Match Drawn" : gameState.winner + " is the Champion!"}
          </h2>

          {gameState.resolutionPending && playerId === gameState.loser && (
            <div className="flex flex-col items-center gap-3 w-full max-w-md mx-auto text-left relative">
              <p className="text-[#ffc107] font-bold text-sm sm:text-base mb-1 text-center w-full">Time to pay up! Search for a real stock:</p>

              {!selectedStock ? (
                <div className="w-full relative">
                  <input
                    type="text"
                    placeholder="Search company (e.g., Apple, Reliance)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="p-3 bg-black/30 border border-border rounded-xl text-white w-full focus:border-accentBlue focus:outline-none text-base"
                  />
                  {isSearching && <p className="text-textMuted text-xs mt-2 text-center">Searching Live Market...</p>}

                  {searchResults.length > 0 && (
                    <ul className="absolute z-20 w-full bg-[#1e1e1e] border border-border rounded-xl mt-1 max-h-48 overflow-y-auto shadow-2xl overflow-hidden hide-scrollbar">
                      {searchResults.map((result, idx) => (
                        <li
                          key={idx}
                          onClick={() => {
                            setSelectedStock(result);
                            setSearchResults([]);
                            setSearchQuery('');
                          }}
                          className="p-3 border-b border-border last:border-0 hover:bg-white/10 cursor-pointer transition-colors flex justify-between items-center"
                        >
                          <span className="font-bold text-white truncate mr-2 text-sm">{result.name}</span>
                          <span className="text-xs text-accentBlue font-mono shrink-0">{result.ticker}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ) : (
                <div className="w-full flex flex-col gap-3 animate-fade-in mt-2">
                  <div className="flex justify-between items-center bg-black/40 p-3 rounded-xl border border-accentBlue/30">
                    <div className="flex flex-col overflow-hidden">
                      <span className="text-xs text-textMuted uppercase">Selected Asset</span>
                      <span className="font-bold text-accentBlue truncate">{selectedStock.name}</span>
                      <span className="text-xs text-white font-mono">{selectedStock.ticker}</span>
                    </div>
                    <button
                      onClick={() => setSelectedStock(null)}
                      className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-lg transition-colors shrink-0 ml-2"
                    >
                      Change
                    </button>
                  </div>

                  <input
                    type="number"
                    placeholder="Number of Shares (e.g., 2.5)"
                    value={shares}
                    onChange={(e) => setShares(e.target.value)}
                    className="p-3 bg-black/30 border border-border rounded-xl text-white w-full focus:border-accentBlue focus:outline-none text-base"
                  />
                  <input
                    type="number"
                    placeholder="Purchase Price per Share (₹)"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    className="p-3 bg-black/30 border border-border rounded-xl text-white w-full focus:border-accentBlue focus:outline-none text-base"
                  />

                  <div className="flex justify-between items-center px-2 py-1 text-sm bg-black/20 rounded-lg">
                    <span className="text-textMuted font-bold">Total Transfer Value:</span>
                    <span className="font-bold text-accentGreen text-lg">
                      ₹{shares && purchasePrice ? (parseFloat(shares) * parseFloat(purchasePrice)).toFixed(2) : "0.00"}
                    </span>
                  </div>

                  <button
                    onClick={() => sendResolveBet(selectedStock.ticker, selectedStock.name, parseFloat(shares), parseFloat(purchasePrice))}
                    disabled={!shares || !purchasePrice || parseFloat(shares) <= 0 || parseFloat(purchasePrice) <= 0}
                    className="bg-accentGreen hover:bg-[#218838] text-white py-3 rounded-xl font-bold w-full mt-2 text-base shadow-[0_4px_15px_rgba(40,167,69,0.3)] transition-transform active:scale-95 disabled:opacity-50"
                  >
                    Confirm Investment 💸
                  </button>
                </div>
              )}
            </div>
          )}

          {gameState.resolutionPending && playerId === gameState.winner && (
            <div className="p-4">
              <p className="text-base sm:text-xl">Waiting for <span className="font-bold text-accentBlue">{gameState.loser}</span> to pay up and gift you a stock...</p>
              <div className="mt-4 animate-spin-slow text-3xl">⏳</div>
            </div>
          )}

          {!gameState.resolutionPending && gameState.gameOver && (
            <div className="flex flex-col items-center animate-fade-in">
              {gameState.statusMessage && (
                <p className="text-accentGreen font-bold mb-4 text-base sm:text-lg">{gameState.statusMessage}</p>
              )}
              <button
                onClick={sendPlayAgain}
                className="bg-accentBlue hover:bg-accentHover text-white px-8 py-3 rounded-xl font-bold shadow-lg text-lg transition-transform active:scale-95"
              >
                Play Again 🔄
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ==========================================
  // PHASE 1: ACTIVE GAME UI (FULLY SPACED OUT)
  // ==========================================
  return (
    <div className="flex flex-col flex-1 h-full w-full max-w-2xl mx-auto items-center justify-between animate-fade-in pb-2">

      <div className="w-full shrink-0">
        {gameState.myRole && (
          <div className="bg-[#007bff1a] text-[#9fd3ff] p-2.5 sm:p-3 rounded-xl border border-[#007bff4d] font-bold w-full text-center text-sm sm:text-base mb-2">
            {gameState.myRole === 'guesser' ? "You are the GUESSER 🤔" : "You are the FLIPPER 🪙"}
          </div>
        )}

        <div className="glass-panel w-full flex justify-between items-center p-3 sm:p-4 rounded-xl gap-2">
          <div className="text-sm sm:text-xl font-bold flex-1 truncate text-left">{playerA}: ?</div>
          <div className="text-xs sm:text-base text-accentBlue font-bold whitespace-nowrap px-1">Toss: {gameState.currentToss}/{gameState.maxTosses}</div>
          <div className="text-sm sm:text-xl font-bold flex-1 truncate text-right">{playerB}: ?</div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center my-4 w-full">
        <div id="coin-wrapper">
          <div id="coin" style={{ transform: "rotateX(" + flipDegrees + "deg)" }}>
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
      </div>

      <div className="w-full flex flex-col items-center justify-center h-[140px] shrink-0">
        <div className="text-textMuted text-sm sm:text-lg h-[2.5rem] flex items-center justify-center text-center transition-opacity duration-300 mb-2 w-full">
          {gameState.statusMessage}
        </div>

        {gameState.awaitingGuess && gameState.myRole === 'guesser' && (
          <div className="flex flex-col items-center gap-2 sm:gap-3 w-full px-2 sm:px-6 animate-fade-in">
            <p className="text-white text-sm sm:text-base m-0">Your call — heads or tails?</p>
            <div className="flex gap-3 w-full">
              <button onClick={() => sendGuess('heads')} className="flex-1 bg-accentBlue hover:bg-accentHover text-white py-3 rounded-xl font-bold text-base transition-transform active:scale-95 shadow-lg">Heads</button>
              <button onClick={() => sendGuess('tails')} className="flex-1 bg-[#555] hover:bg-[#666] text-white py-3 rounded-xl font-bold text-base transition-transform active:scale-95 shadow-lg">Tails</button>
            </div>
          </div>
        )}

        {!gameState.awaitingGuess && gameState.myRole === 'flipper' && (
          <button
            onClick={sendFlip}
            disabled={gameState.flipResult !== null}
            className="bg-accentGreen hover:bg-[#218838] text-white px-12 sm:px-16 py-3.5 sm:py-4 rounded-xl font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_15px_rgba(40,167,69,0.3)] animate-fade-in transition-transform active:scale-95 w-full sm:w-auto"
          >
            Flip Coin!
          </button>
        )}

        {!gameState.awaitingGuess && gameState.myRole === 'guesser' && !isGameFinished && (
           <div className="flex flex-col items-center opacity-50 animate-pulse w-full">
              <span className="text-xl sm:text-2xl mb-1">👀</span>
              <p className="text-xs sm:text-sm">Watching opponent...</p>
           </div>
        )}
      </div>
    </div>
  );
}
