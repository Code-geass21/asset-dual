import React, { useState } from 'react';

export default function AuthScreen({ onAuthSuccess }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async (endpoint) => {
    if (!username || !password) {
      setStatus('Enter username & password.');
      return;
    }
    
    setStatus('Please wait...');
    setLoading(true);

    try {
      const res = await fetch(`/api/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });

      const data = await res.json();

      if (!res.ok) {
        setStatus(data.detail || 'Error.');
      } else {
        // Pass the player data (username and stats) up to App.jsx
        onAuthSuccess(data); 
      }
    } catch (err) {
      console.error("Network Error:", err);
      setStatus('Network error. Could not reach server.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel p-10 rounded-2xl w-[95%] max-w-[500px] flex flex-col items-center">
      <h1 className="glow-text text-4xl font-bold text-white mb-2">Fair Coin Flip</h1>
      <p className="text-textMuted text-sm mb-8">Settle bets with investments, not cash.</p>
      
      <div className="w-full flex flex-col space-y-4">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 bg-black/30 border border-border rounded-lg text-white w-full focus:outline-none focus:border-accentBlue transition-colors"
          autoComplete="username"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 bg-black/30 border border-border rounded-lg text-white w-full focus:outline-none focus:border-accentBlue transition-colors"
          autoComplete="current-password"
        />
        
        <div className="flex space-x-4 pt-2">
          <button 
            onClick={() => handleAuth('login')} 
            disabled={loading}
            className="flex-1 bg-accentBlue text-white shadow-[0_4px_15px_rgba(0,123,255,0.3)] hover:bg-accentHover p-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Log In
          </button>
          <button 
            onClick={() => handleAuth('register')} 
            disabled={loading}
            className="flex-1 bg-[#555] text-white hover:bg-[#666] p-3 rounded-lg font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Register
          </button>
        </div>
        
        {status && (
          <div className="text-textMuted text-center mt-4 min-h-[1.5em]">
            {status}
          </div>
        )}
      </div>
    </div>
  );
}
