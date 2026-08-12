import React, { useState } from 'react';
import AuthScreen from './AuthScreen';
import GameRoom from './GameRoom';
import { useGameWebSocket } from './useGameWebSocket';

// Create a wrapper component so the hook is only called when logged in
function MainApp({ player, setPlayer }) {
  const [activeTab, setActiveTab] = useState('game');

  // Connect to the WebSocket using our custom hook
  const { gameState, lifetimeStats, sendGuess, sendFlip, sendResolveBet, sendPlayAgain } = useGameWebSocket(player.username);

  return (
    <div className="glass-panel p-6 rounded-2xl w-[95%] max-w-[900px] flex flex-col h-[95vh]">
      {/* Navigation Bar */}
      <nav className="flex justify-between border-b border-border pb-4 mb-6">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('game')}
            className={`pb-1 text-lg ${activeTab === 'game' ? 'text-white border-b-2 border-accentBlue' : 'text-textMuted hover:text-white'}`}
          >
            🎮 Game Room
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`pb-1 text-lg ${activeTab === 'dashboard' ? 'text-white border-b-2 border-accentBlue' : 'text-textMuted hover:text-white'}`}
          >
            📊 Dashboard
          </button>
        </div>
        <button
          onClick={() => setPlayer(null)}
          className="border border-danger text-danger px-4 py-1 rounded hover:bg-danger hover:text-white transition-colors"
        >
          Log Out
        </button>
      </nav>

      {/* Tab Content */}
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
        <div className="flex-grow flex flex-col items-center justify-center">
          <h2 className="text-2xl font-bold mb-2">Dashboard Coming Soon!</h2>
          <p className="text-textMuted">This is where we will add the Chart.js graphs next.</p>
        </div>
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
