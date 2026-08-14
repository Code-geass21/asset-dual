import React, { useState } from 'react';
import AuthScreen from './AuthScreen';
import GameRoom from './GameRoom';
import { useGameWebSocket } from './useGameWebSocket';
import Dashboard from './Dashboard';
import { Gamepad2, BarChart3, LogOut, Settings } from 'lucide-react';

function MainApp({ player, setPlayer }) {
  const [activeTab, setActiveTab] = useState('game');
  const [showSettings, setShowSettings] = useState(false);

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingsStatus, setSettingsStatus] = useState('');
  const [settingsLoading, setSettingsLoading] = useState(false);

  const { gameState, lifetimeStats, sendGuess, sendFlip, sendResolveBet, sendPlayAgain } = useGameWebSocket(player.username);
  const currentPlayerStats = lifetimeStats[player.username] || player.stats || {};

  const handlePasswordChange = async () => {
    if (!oldPassword || !newPassword || !confirmPassword) {
      setSettingsStatus('Please fill in all fields.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setSettingsStatus('New passwords do not match.');
      return;
    }

    setSettingsLoading(true);
    setSettingsStatus('Updating...');

    try {
      const res = await fetch('/api/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: player.username,
          old_password: oldPassword,
          new_password: newPassword
        })
      });

      const data = await res.json();

      if (!res.ok) {
        setSettingsStatus(data.detail || 'Error changing password.');
      } else {
        setSettingsStatus('Password changed successfully!');
        setTimeout(() => {
          setShowSettings(false);
          setOldPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setSettingsStatus('');
        }, 1500);
      }
    } catch (err) {
      console.error(err);
      setSettingsStatus('Network error.');
    } finally {
      setSettingsLoading(false);
    }
  };

  return (
    <div className="glass-panel w-full h-full sm:w-[95%] sm:h-[90vh] sm:max-h-[1000px] sm:max-w-[1200px] flex flex-col p-4 sm:p-6 sm:rounded-3xl border-0 sm:border relative overflow-hidden mx-auto shadow-2xl">

      <nav className="flex justify-between items-center border-b border-border pb-2 sm:pb-4 mb-4 sm:mb-6 w-full shrink-0">
        <div className="flex gap-4 sm:gap-8">
          <button
            onClick={() => setActiveTab('game')}
            className={"flex items-center gap-2 pb-2 text-sm sm:text-base md:text-lg transition-colors " + (activeTab === 'game' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white border-b-2 border-transparent")}
          >
            <Gamepad2 size={20} className="shrink-0" />
            <span className="font-semibold">Play</span>
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className={"flex items-center gap-2 pb-2 text-sm sm:text-base md:text-lg transition-colors " + (activeTab === 'dashboard' ? "text-white border-b-2 border-accentBlue" : "text-textMuted hover:text-white border-b-2 border-transparent")}
          >
            <BarChart3 size={20} className="shrink-0" />
            <span className="font-semibold">Stats</span>
          </button>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowSettings(true)}
            title="Settings"
            className="text-textMuted hover:text-white hover:bg-white/10 p-2 sm:p-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
          >
            <Settings size={20} />
          </button>
          <button
            onClick={() => setPlayer(null)}
            title="Exit Game"
            className="text-danger hover:bg-danger/10 p-2 sm:p-2.5 rounded-lg transition-all active:scale-95 flex items-center justify-center"
          >
            <LogOut size={20} />
          </button>
        </div>
      </nav>

      <div className="flex-1 min-h-0 flex flex-col overflow-y-auto hide-scrollbar w-full relative">
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

      {showSettings && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm sm:rounded-3xl p-4">
          <div className="glass-panel w-full max-w-sm p-8 rounded-2xl flex flex-col animate-fade-in border border-border shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 text-white text-center">Change Password</h2>

            <input
              type="password"
              placeholder="Current Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="p-3 mb-4 bg-black/30 border border-border rounded-lg text-white w-full focus:outline-none focus:border-accentBlue transition-colors"
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="p-3 mb-4 bg-black/30 border border-border rounded-lg text-white w-full focus:outline-none focus:border-accentBlue transition-colors"
            />
            <input
              type="password"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="p-3 mb-6 bg-black/30 border border-border rounded-lg text-white w-full focus:outline-none focus:border-accentBlue transition-colors"
            />

            <button
              onClick={handlePasswordChange}
              disabled={settingsLoading}
              className="w-full bg-accentBlue text-white shadow-[0_4px_15px_rgba(0,123,255,0.3)] hover:bg-accentHover p-3 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 mb-3"
            >
              {settingsLoading ? 'Updating...' : 'Save Password'}
            </button>
            <button
              onClick={() => {
                setShowSettings(false);
                setSettingsStatus('');
                setOldPassword('');
                setNewPassword('');
                setConfirmPassword('');
              }}
              className="w-full bg-transparent text-textMuted hover:text-white p-3 rounded-lg font-bold transition-colors"
            >
              Cancel
            </button>

            {settingsStatus && (
              <div className={"mt-4 text-center text-sm font-bold " + (settingsStatus.includes('success') ? "text-accentGreen" : "text-danger")}>
                {settingsStatus}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [player, setPlayer] = useState(null);

  return (
    // BYPASSING ALL CSS BUGS WITH FIXED INSET-0
    <div className="fixed inset-0 w-screen h-[100dvh] flex justify-center items-center bg-[#121212] overflow-hidden">
      {!player ? (
        <AuthScreen onAuthSuccess={setPlayer} />
      ) : (
        <MainApp player={player} setPlayer={setPlayer} />
      )}
    </div>
  );
}
