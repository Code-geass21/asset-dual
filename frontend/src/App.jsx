import React, { useState } from 'react';
import AuthScreen from './AuthScreen';
import GameRoom from './GameRoom';
import { useGameWebSocket } from './useGameWebSocket';
import Dashboard from './Dashboard';

function MainApp({ player, setPlayer }) {
  const [activeTab, setActiveTab] = useState('game');

  const { gameState, lifetimeStats, sendGuess, sendFlip, sendResolveBet, sendPlayAgain } = useGameWebSocket(player.username);

  return (
    <div className="glass-panel p-6 rounded-2xl w-[95%] max-w-[900px] flex flex-col min-h-[600px] max-h-[95vh]">

      {/* FIXED NAVBAR: Added shrink-0 so text is NEVER cut off, and made the whole nav scrollable if needed */}
      <nav className="flex justify-between items-center border-b border-border pb-4 mb-6 w-full overflow-x-auto hide-scrollbar gap-4">
        <div className="flex gap-4 shrink-0">
          <button
            onClick={() => setActiveTab('game')}
            className={"shrink-0 pb-1 text-base sm:text-lg whitespace-nowrap transition-colors " + (activeTab === 'game' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white")}
          >
            🎮 Game Room
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={"shrink-0 pb-1 text-base sm:text-lg whitespace-nowrap transition-colors " + (activeTab === 'dashboard' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white")}
          >
            📊 Dashboard
          </button>
        </div>
        <button
          onClick={() => setPlayer(null)}
          className="shrink-0 border border-danger text-danger px-4 py-1 rounded hover:bg-danger hover:text-white transition-colors text-sm sm:text-base whitespace-nowrap ml-auto"
        >
          Log Out
        </button>
      </nav>

      {activeTab === 'game' ? (
        <GameRoom
          playerId={player.username}
          gameState={gameState}
          sendGuess={sendGuess}
          sendFlip={sendFlip}
          sendResolveBet={sendResolveBet}
          sendPlayAgain={sendPlayAgain}
        />
      ) : (
        <Dashboard playerId={player.username} lifetimeStats={lifetimeStats} />
      )}
    </div>
  );
}

export default function App() {
  const [player, setPlayer] = useState(null);

  return (
    <div className="w-full flex justify-center items-center">
      {!player ? (
        <AuthScreen onAuthSuccess={setPlayer} />
      ) : (
        <MainApp player={player} setPlayer={setPlayer} />
      )}
    </div>
  );
}
