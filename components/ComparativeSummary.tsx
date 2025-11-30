
import React from 'react';
import { TradeAnalysis } from '../types';
import { Trophy, ArrowRight, Zap, Target, TrendingUp } from 'lucide-react';

interface ComparativeSummaryProps {
  analyses: TradeAnalysis[];
}

export const ComparativeSummary: React.FC<ComparativeSummaryProps> = ({ analyses }) => {
  // Sort by confidence to find the best setup
  const sortedAnalyses = [...analyses].sort((a, b) => b.confidenceScore - a.confidenceScore);
  const bestSetup = sortedAnalyses[0];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl mb-8 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />

      <div className="flex items-center gap-3 mb-6 relative z-10">
        <div className="p-2 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
          <Trophy className="w-5 h-5 text-yellow-400" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-white">Market Comparison Matrix</h3>
          <p className="text-sm text-slate-400">Comparing technical strength across {analyses.length} assets</p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-slate-400">
          <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
            <tr>
              <th className="px-4 py-3 rounded-l-lg">Symbol</th>
              <th className="px-4 py-3">Signal</th>
              <th className="px-4 py-3">Confidence</th>
              <th className="px-4 py-3">Strategy</th>
              <th className="px-4 py-3">R:R Ratio</th>
              <th className="px-4 py-3 rounded-r-lg">Sentiment</th>
            </tr>
          </thead>
          <tbody>
            {analyses.map((item) => (
              <tr 
                key={item.symbol} 
                className={`border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors ${item.symbol === bestSetup.symbol ? 'bg-emerald-500/5' : ''}`}
              >
                <td className="px-4 py-3 font-bold text-white flex items-center gap-2">
                   {item.symbol}
                   {item.symbol === bestSetup.symbol && (
                     <Trophy className="w-3 h-3 text-yellow-500" />
                   )}
                </td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    item.action === 'BUY' ? 'bg-emerald-500/20 text-emerald-400' :
                    item.action === 'SELL' ? 'bg-rose-500/20 text-rose-400' :
                    'bg-amber-500/20 text-amber-400'
                  }`}>
                    {item.action}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <div 
                        className={`h-full ${
                          item.confidenceScore >= 80 ? 'bg-emerald-500' : 
                          item.confidenceScore >= 60 ? 'bg-indigo-500' : 'bg-amber-500'
                        }`} 
                        style={{ width: `${item.confidenceScore}%` }} 
                      />
                    </div>
                    <span className="text-white font-mono">{item.confidenceScore}%</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-300">
                   <span className="truncate max-w-[150px] block" title={item.strategyUsed}>
                     {item.strategyUsed}
                   </span>
                </td>
                <td className="px-4 py-3 font-mono text-emerald-400">{item.riskRewardRatio}</td>
                <td className="px-4 py-3">
                   {item.newsAnalysis?.sentiment === 'BULLISH' && <span className="text-emerald-400">Bullish</span>}
                   {item.newsAnalysis?.sentiment === 'BEARISH' && <span className="text-rose-400">Bearish</span>}
                   {item.newsAnalysis?.sentiment === 'NEUTRAL' && <span className="text-slate-400">Neutral</span>}
                   {!item.newsAnalysis && <span className="text-slate-600">-</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Top Pick Highlight */}
      <div className="mt-4 bg-slate-950/50 rounded-xl p-4 border border-slate-800 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex items-center gap-3">
           <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
             <Target className="w-5 h-5 text-emerald-400" />
           </div>
           <div>
             <span className="text-xs font-bold text-emerald-500 uppercase tracking-wide">Top Trade Opportunity</span>
             <p className="text-lg font-bold text-white">{bestSetup.symbol} {bestSetup.action}</p>
           </div>
        </div>
        <div className="h-8 w-px bg-slate-800 hidden md:block" />
        <p className="text-sm text-slate-400 flex-1">
          {bestSetup.symbol} shows the highest probability setup ({bestSetup.confidenceScore}%) with a {bestSetup.riskRewardRatio} risk-to-reward ratio using the <span className="text-indigo-400">{bestSetup.strategyUsed}</span> strategy.
        </p>
        <button 
           onClick={() => document.getElementById(`analysis-${bestSetup.symbol}`)?.scrollIntoView({ behavior: 'smooth' })}
           className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shrink-0"
        >
          View Analysis <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
