import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
ChartJS.defaults.color = '#a0a0a0';

export default function Dashboard({ playerId, lifetimeStats }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch("/api/transactions/" + playerId);
        const data = await res.json();
        setTransactions(data);
      } catch (err) {
        console.error("Failed to fetch transactions", err);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [playerId]);

  const wins = lifetimeStats?.wins || 0;
  const losses = lifetimeStats?.losses || 0;
  const ties = lifetimeStats?.ties || 0;
  const playTimeMins = Math.floor((lifetimeStats?.total_play_time_seconds || 0) / 60);

  let moneyWon = 0;
  let moneyLost = 0;
  transactions.forEach(t => {
    if (t.winner === playerId) moneyWon += t.amount;
    if (t.loser === playerId) moneyLost += t.amount;
  });

  const winLossData = {
    labels: ['Wins', 'Losses'],
    datasets: [{
      data: [wins, losses],
      backgroundColor: ['#28a745', '#dc3545'],
      borderWidth: 0
    }]
  };

  const investmentData = {
    labels: ['Value Won', 'Value Lost'],
    datasets: [{
      label: 'Rupees (₹)',
      data: [moneyWon, moneyLost],
      backgroundColor: ['rgba(40, 167, 69, 0.6)', 'rgba(220, 53, 69, 0.6)'],
      borderColor: ['#28a745', '#dc3545'],
      borderWidth: 1
    }]
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mx-auto animate-fade-in p-2 pb-6">

      {/* UPGRADED PREMIUM STATS GRID */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="glass-panel p-4 rounded-xl text-center shadow-lg">
          <div className="text-3xl font-bold text-accentGreen">{wins}</div>
          <div className="text-textMuted text-sm font-semibold uppercase tracking-wider mt-1">Wins</div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center shadow-lg">
          <div className="text-3xl font-bold text-danger">{losses}</div>
          <div className="text-textMuted text-sm font-semibold uppercase tracking-wider mt-1">Losses</div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center shadow-lg">
          <div className="text-3xl font-bold text-white">{ties}</div>
          <div className="text-textMuted text-sm font-semibold uppercase tracking-wider mt-1">Ties</div>
        </div>
        <div className="glass-panel p-4 rounded-xl text-center shadow-lg">
          <div className="text-3xl font-bold text-accentBlue">{playTimeMins}m</div>
          <div className="text-textMuted text-sm font-semibold uppercase tracking-wider mt-1">Playtime</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="glass-panel p-4 rounded-xl h-64 flex flex-col justify-center items-center">
           <h3 className="text-sm font-bold uppercase tracking-wider text-textMuted mb-2 shrink-0">Win / Loss Ratio</h3>
          <div className="relative w-full h-full pb-2">
            <Doughnut data={winLossData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
          </div>
        </div>
        <div className="glass-panel p-4 rounded-xl h-64 flex flex-col justify-center items-center">
          <h3 className="text-sm font-bold uppercase tracking-wider text-textMuted mb-2 shrink-0">Investment Value</h3>
          <div className="relative w-full h-full pb-2">
             <Bar data={investmentData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
          </div>
        </div>
      </div>

      {/* FIXED HEIGHT CONTAINER: Prevents endless stretching. Scrolls internally with no scrollbars! */}
      <div className="glass-panel flex flex-col p-4 sm:p-6 rounded-xl overflow-hidden h-[300px] sm:h-[400px]">
        <h3 className="text-lg text-white font-bold border-b border-border pb-3 mb-4 shrink-0">Recent Transfers</h3>
        <div className="overflow-y-auto pr-2 flex-grow hide-scrollbar">
          {loading ? (
            <p className="text-center text-textMuted py-4">Loading history...</p>
          ) : transactions.length === 0 ? (
            <p className="text-center text-textMuted py-4">No investments yet. Go win some bets!</p>
          ) : (
            <ul className="space-y-4">
              {transactions.map(t => {
                const isWinner = t.winner === playerId;
                return (
                  <li key={t.id} className="flex justify-between items-center border-b border-white/5 pb-3 last:border-0">
                    <span className="flex flex-col gap-1">
                      {isWinner ? (
                        <span className="text-accentGreen font-bold text-base sm:text-lg">+₹{t.amount} ({t.stock_name})</span>
                      ) : (
                        <span className="text-danger font-bold text-base sm:text-lg">-₹{t.amount} ({t.stock_name})</span>
                      )}
                      <span className="text-textMuted text-xs sm:text-sm">
                        {isWinner ? "Received from " + t.loser : "Sent to " + t.winner}
                      </span>
                    </span>
                    <span className="text-xs text-[#666] font-mono">{t.timestamp_ist.split(' ')[0]}</span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
