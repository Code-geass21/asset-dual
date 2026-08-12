import React, { useState } from 'react';
import AuthScreen from './AuthScreen';

function App() {
  // This state will hold the username and stats once logged in
  const [player, setPlayer] = useState(null);

  return (
    <div className="w-full flex justify-center items-center">
      {!player ? (
        <AuthScreen onAuthSuccess={setPlayer} />
      ) : (
        <div className="glass-panel p-10 rounded-2xl w-[95%] max-w-[900px] text-center">
          <h2 className="text-2xl font-bold mb-4">Welcome to the Game, {player.username}!</h2>
          <p className="text-textMuted">The WebSocket and Game Room components will go here next.</p>
          <button 
            onClick={() => setPlayer(null)}
            className="mt-6 border border-danger text-danger hover:bg-danger hover:text-white p-2 rounded-lg transition-all"
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
