import React, { useState } from 'react';
import AuthScreen from './AuthScreen';
import GameRoom from './GameRoom';
import { useGameWebSocket } from './useGameWebSocket';
import Dashboard from './Dashboard';
import { Gamepad2, BarChart3, LogOut } from 'lucide-react';

function MainApp({ player, setPlayer }) {
  const [activeTab, setActiveTab] = useState('game');

  const { gameState, lifetimeStats, sendGuess, sendFlip, sendResolveBet, sendPlayAgain } = useGameWebSocket(player.username);

  // FIXED: The websocket sends a dictionary of ALL players. We must extract just YOUR stats!
  // If the websocket hasn't sent stats yet, we fall back to the initial stats from login.
  const currentPlayerStats = lifetimeStats[player.username] || player.stats || {};

  return (
    // FIXED HEIGHT CONTAINER: Prevents jarring layout shifts between tabs!
    <div className="glass-panel p-4 sm:p-6 rounded-2xl w-[95%] max-w-[900px] flex flex-col h-[85vh] sm:h-[750px]">

      <nav className="flex justify-between items-center border-b border-border pb-2 sm:pb-4 mb-4 sm:mb-6 w-full shrink-0">
        <div className="flex gap-6 sm:gap-8">
          <button
            onClick={() => setActiveTab('game')}
            className={"flex items-center gap-2 pb-2 text-sm sm:text-base md:text-lg transition-colors " + (activeTab === 'game' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white border-b-2 border-transparent")}
          >
            <Gamepad2 size={20} />
            <span className="font-semibold">Play</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={"flex items-center gap-2 pb-2 text-sm sm:text-base md:text-lg transition-colors " + (activeTab === 'dashboard' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white border-b-2 border-transparent")}
          >
            <BarChart3 size={20} />
            <span className="font-semibold">Stats</span>
          </button>
        </div>

        <button
          onClick={() => setPlayer(null)}
          title="Exit Game"
          className="text-danger border border-transparent hover:border-danger hover:bg-danger/10 p-2 sm:p-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
        >
          <LogOut size={20} />
        </button>
      </nav>

      {/* INNER CONTENT AREA: Takes up remaining height and scrolls smoothly if needed */}
      <div className="flex-grow overflow-y-auto hide-scrollbar relative">
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
          <Dashboard playerId={player.username} lifetimeStats={currentPlayerStats} />
        )}
      </div>
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
