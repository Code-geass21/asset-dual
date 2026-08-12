import React, { useState, useEffect } from 'react';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Doughnut, Bar } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);
ChartJS.defaults.color = '#a0a0a0'; // Match dark theme text

export default function Dashboard({ playerId, lifetimeStats }) {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch transaction history on mount
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const res = await fetch(`/api/transactions/${playerId}`);
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

  // Safely extract stats (default to 0 if undefined)
  const wins = lifetimeStats?.wins || 0;
  const losses = lifetimeStats?.losses || 0;
  const ties = lifetimeStats?.ties || 0;
  const playTimeMins = Math.floor((lifetimeStats?.total_play_time_seconds || 0) / 60);

  // Calculate total money won and lost for the Bar Chart
  let moneyWon = 0;
  let moneyLost = 0;
  transactions.forEach(t => {
    if (t.winner === playerId) moneyWon += t.amount;
    if (t.loser === playerId) moneyLost += t.amount;
  });

  // Chart Configurations
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
    <div className="flex flex-col flex-grow w-full max-w-4xl mx-auto overflow-hidden">
      <h2 className="text-2xl font-bold mb-4">Your Investment Journey</h2>

      {/* Lifetime Stats Grid */}
      <div className="grid grid-cols-2 gap-4 text-left mb-6 bg-black/25 p-4 rounded-xl border border-border">
        <div><strong className="text-white">Total Wins:</strong> {wins}</div>
        <div><strong className="text-white">Total Losses:</strong> {losses}</div>
        <div><strong className="text-white">Ties:</strong> {ties}</div>
        <div><strong className="text-white">Playtime:</strong> {playTimeMins} mins</div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-black/25 p-4 rounded-xl border border-border h-64 flex justify-center items-center">
          <Doughnut data={winLossData} options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} />
        </div>
        <div className="bg-black/25 p-4 rounded-xl border border-border h-64 flex justify-center items-center">
          <Bar data={investmentData} options={{ maintainAspectRatio: false, plugins: { legend: { display: false } } }} />
        </div>
      </div>

      {/* Transaction History (Scrollable) */}
      <div className="flex flex-col flex-grow bg-black/25 p-4 rounded-xl border border-border overflow-hidden">
        <h3 className="text-lg text-textMuted border-b border-border pb-2 mb-2">Recent Transfers</h3>
        <div className="overflow-y-auto pr-2 flex-grow">
          {loading ? (
            <p>Loading history...</p>
          ) : transactions.length === 0 ? (
            <p>No investments yet. Go win some bets!</p>
          ) : (
            <ul className="space-y-3">
              {transactions.map(t => {
                const isWinner = t.winner === playerId;
                return (
                  <li key={t.id} className="flex justify-between items-center border-b border-white/5 pb-2 last:border-0">
                    <span>
                      {isWinner ? (
                        <span className="text-accentGreen font-bold">+₹{t.amount} ({t.stock_name})</span>
                      ) : (
                        <span className="text-danger font-bold">-₹{t.amount} ({t.stock_name})</span>
                      )}
                      <span className="text-textMain ml-2">
                        {isWinner ? `from ${t.loser}` : `to ${t.winner}`}
                      </span>
                    </span>
                    <span className="text-xs text-[#666]">{t.timestamp_ist.split(' ')[0]}</span>
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
