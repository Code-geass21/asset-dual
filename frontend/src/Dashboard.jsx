import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, Wallet, ArrowRightLeft } from 'lucide-react';

export default function Dashboard({ playerId, lifetimeStats }) {
  const [transactions, setTransactions] = useState([]);
  const [portfolio, setPortfolio] = useState({ holdings: [], total_invested: 0, total_current_value: 0, total_pl: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [txRes, portRes] = await Promise.all([
          fetch("/api/transactions/" + playerId),
          fetch("/api/portfolio/" + playerId)
        ]);

        const txData = await txRes.json();
        const portData = await portRes.json();

        setTransactions(txData);
        setPortfolio(portData);
      } catch (err) {
        console.error("Failed to fetch data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [playerId]);

  const wins = lifetimeStats?.wins || 0;
  const losses = lifetimeStats?.losses || 0;
  const ties = lifetimeStats?.ties || 0;
  const totalGames = wins + losses + ties;
  const winRate = totalGames > 0 ? Math.round((wins / totalGames) * 100) : 0;

  const isProfit = portfolio.total_pl >= 0;

  return (
    <div className="flex flex-col w-full max-w-4xl mx-auto animate-fade-in p-2 pb-6 space-y-4 sm:space-y-6">

      {/* STATS GRID */}
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        <div className="glass-panel p-3 sm:p-4 rounded-xl text-center shadow-lg">
          <div className="text-xl sm:text-3xl font-bold text-accentGreen">{wins}</div>
          <div className="text-textMuted text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1">Wins</div>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-xl text-center shadow-lg">
          <div className="text-xl sm:text-3xl font-bold text-danger">{losses}</div>
          <div className="text-textMuted text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1">Losses</div>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-xl text-center shadow-lg">
          <div className="text-xl sm:text-3xl font-bold text-white">{ties}</div>
          <div className="text-textMuted text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1">Ties</div>
        </div>
        <div className="glass-panel p-3 sm:p-4 rounded-xl text-center shadow-lg">
          <div className="text-xl sm:text-3xl font-bold text-accentBlue">{winRate}%</div>
          <div className="text-textMuted text-[10px] sm:text-xs font-semibold uppercase tracking-wider mt-1">Win Rate</div>
        </div>
      </div>

      {/* PORTFOLIO OVERVIEW */}
      <div className="glass-panel p-5 sm:p-8 rounded-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none hidden sm:block">
          <Wallet size={120} />
        </div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-textMuted mb-2">Live Portfolio Value</h3>
        <div className="text-4xl sm:text-5xl font-bold text-white mb-4">
          ₹{portfolio.total_current_value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
        </div>

        <div className="flex gap-4 sm:gap-8 border-t border-white/10 pt-4">
          <div>
            <div className="text-[10px] sm:text-xs text-textMuted uppercase mb-1">Total Cost Basis</div>
            <div className="font-bold text-sm sm:text-lg">₹{portfolio.total_invested.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
          </div>
          <div>
            <div className="text-[10px] sm:text-xs text-textMuted uppercase mb-1">All-Time Return</div>
            <div className={"font-bold text-sm sm:text-lg flex items-center gap-1 " + (isProfit ? "text-accentGreen" : "text-danger")}>
              {isProfit ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
              {isProfit ? "+" : ""}₹{portfolio.total_pl.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
            </div>
          </div>
        </div>
      </div>

      {/* TWO COLUMN LAYOUT ON DESKTOP */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">

        {/* HOLDINGS TABLE */}
        <div className="glass-panel flex flex-col p-4 sm:p-6 rounded-xl overflow-hidden h-[300px] sm:h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-textMuted mb-4 shrink-0 border-b border-border pb-2">Your Assets</h3>
          <div className="overflow-y-auto flex-grow hide-scrollbar pr-2">
            {loading ? (
              <p className="text-center text-textMuted py-4 text-sm animate-pulse">Syncing with live market...</p>
            ) : portfolio.holdings.length === 0 ? (
              <p className="text-center text-textMuted py-4 text-sm">No stocks owned. Win some bets!</p>
            ) : (
              <ul className="space-y-3">
                {portfolio.holdings.map((h, i) => (
                  <li key={i} className="flex justify-between items-center bg-black/20 p-3 rounded-lg border border-white/5 hover:bg-white/5 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-bold text-white text-sm sm:text-base">{h.ticker}</span>
                      <span className="text-xs text-textMuted">{h.shares} Shares @ ₹{h.avg_price}</span>
                    </div>
                    <div className="flex flex-col items-end">
                      <span className="font-bold text-white text-sm sm:text-base">₹{h.current_value.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
                      <span className={"text-xs font-bold " + (h.pl >= 0 ? "text-accentGreen" : "text-danger")}>
                        {h.pl >= 0 ? "+" : ""}₹{h.pl.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})} ({h.pl_percent}%)
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* TRANSACTIONS TABLE */}
        <div className="glass-panel flex flex-col p-4 sm:p-6 rounded-xl overflow-hidden h-[300px] sm:h-[400px]">
          <h3 className="text-sm font-bold uppercase tracking-wider text-textMuted mb-4 shrink-0 border-b border-border pb-2">Activity Log</h3>
          <div className="overflow-y-auto flex-grow hide-scrollbar pr-2">
            {loading ? (
              <p className="text-center text-textMuted py-4 text-sm animate-pulse">Loading history...</p>
            ) : transactions.length === 0 ? (
              <p className="text-center text-textMuted py-4 text-sm">No recent activity.</p>
            ) : (
              <ul className="space-y-3">
                {transactions.map(t => {
                  const isWinner = t.winner === playerId;
                  const totalVal = t.shares * t.purchase_price;
                  return (
                    <li key={t.id} className="flex flex-col bg-black/20 p-3 rounded-lg border border-white/5 gap-2 hover:bg-white/5 transition-colors">
                      <div className="flex justify-between items-center">
                        <span className={"font-bold text-sm sm:text-base flex items-center gap-1 " + (isWinner ? "text-accentGreen" : "text-danger")}>
                          {isWinner ? "+" : "-"}₹{totalVal.toLocaleString('en-IN', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                        </span>
                        <span className="text-[10px] text-textMuted font-mono bg-black/50 px-2 py-1 rounded">
                          {t.timestamp_ist.split(' ')[0]}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-white font-mono bg-accentBlue/20 text-accentBlue px-2 py-0.5 rounded">
                          {t.shares} {t.ticker}
                        </span>
                        <span className="text-textMuted flex items-center gap-1">
                          <ArrowRightLeft size={12} />
                          {isWinner ? "From " + t.loser : "To " + t.winner}
                        </span>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
