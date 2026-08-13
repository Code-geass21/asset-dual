import React, { useState } from 'react';
import AuthScreen from './AuthScreen';
import GameRoom from './GameRoom';
import { useGameWebSocket } from './useGameWebSocket';
import Dashboard from './Dashboard';

function MainApp({ player, setPlayer }) {
  const [activeTab, setActiveTab] = useState('game');

  const { gameState, lifetimeStats, sendGuess, sendFlip, sendResolveBet, sendPlayAgain } = useGameWebSocket(player.username);

  return (
    <div className="glass-panel p-4 sm:p-6 rounded-2xl w-[95%] max-w-[900px] flex flex-col min-h-[600px] max-h-[95vh]">

      {/* FULLY RESPONSIVE NAVBAR: Uses flex-wrap so borders never clip, and dynamic text sizes! */}
      <nav className="flex flex-wrap justify-between items-center border-b border-border pb-3 sm:pb-4 mb-4 sm:mb-6 w-full gap-y-3">
        <div className="flex gap-2 sm:gap-4">
          <button
            onClick={() => setActiveTab('game')}
            className={"pb-1 text-sm sm:text-base md:text-lg whitespace-nowrap transition-colors " + (activeTab === 'game' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white")}
          >
            🎮 Game Room
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={"pb-1 text-sm sm:text-base md:text-lg whitespace-nowrap transition-colors " + (activeTab === 'dashboard' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white")}
          >
            📊 Dashboard
          </button>
        </div>
        <button
          onClick={() => setPlayer(null)}
          className="border border-danger text-danger px-3 sm:px-4 py-1 rounded hover:bg-danger hover:text-white transition-colors text-xs sm:text-sm md:text-base whitespace-nowrap"
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
