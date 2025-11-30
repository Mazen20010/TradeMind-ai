
import React, { useMemo } from 'react';
import { BacktestResult, TradeLogEntry } from '../types';
import { Trophy, TrendingDown, Target, BarChart2, Calendar, Activity, Table } from 'lucide-react';
import { ResponsiveContainer, ComposedChart, Area, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine, Scatter, Cell } from 'recharts';

interface BacktestResultProps {
  data: BacktestResult;
}

export const BacktestResultDisplay: React.FC<BacktestResultProps> = ({ data }) => {
  
  // Advanced Chart Data Construction
  const { chartData, hasGranularData } = useMemo(() => {
    // 1. Try to build from granular Trade Log if available
    if (data.recentTrades && data.recentTrades.length > 0) {
      // Sort trades by date ascending
      const sortedTrades = [...data.recentTrades].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      let equity = 10000;
      let peakEquity = 10000;
      
      const points = [{ 
        name: 'Start', 
        date: 'Start',
        equity, 
        drawdown: 0, 
        monthlyPct: 0,
        trade: null as TradeLogEntry | null,
        win: 0, // for scatter z-index/color
      }];

      sortedTrades.forEach(trade => {
        // Parse PnL (handle both "4.5%" and "2.5R" formats)
        let pnlVal = 0;
        const pnlStr = trade.pnl.replace('%', '').replace('+', '').trim();
        
        if (pnlStr.includes('R')) {
           // Assume 1R = 2% risk for simulation visualization if R-multiples used
           pnlVal = parseFloat(pnlStr.replace('R', '')) * 2;
        } else {
           pnlVal = parseFloat(pnlStr);
        }

        if (isNaN(pnlVal)) pnlVal = 0;

        // Apply PnL
        equity = equity * (1 + pnlVal / 100);
        
        // Update Drawdown stats
        if (equity > peakEquity) peakEquity = equity;
        const drawdown = peakEquity > 0 ? ((peakEquity - equity) / peakEquity) * 100 : 0;

        points.push({
          name: trade.date.split('-').slice(1).join('/'), // MM/DD
          date: trade.date,
          equity: parseFloat(equity.toFixed(2)),
          drawdown: parseFloat(drawdown.toFixed(2)),
          monthlyPct: 0, // Granular data doesn't map easily to monthly bars without aggregation
          trade: trade,
          win: trade.result === 'WIN' ? 1 : -1
        });
      });

      return { chartData: points, hasGranularData: true };
    } 
    
    // 2. Fallback to Monthly Returns
    const startEquity = 10000;
    let currentEquity = startEquity;
    let peakEquity = startEquity;
    const returns = data.monthlyReturn || [2.5, -1.2, 4.8, 3.1, -0.5, 6.2];
    
    const fallbackPoints = [
      { name: 'Start', equity: startEquity, drawdown: 0, monthlyPct: 0, trade: null, win: 0 },
      ...returns.map((ret, i) => {
        currentEquity = currentEquity * (1 + ret / 100);
        
        // Calculate Drawdown based on Peak Equity
        if (currentEquity > peakEquity) peakEquity = currentEquity;
        const dd = peakEquity > 0 ? ((peakEquity - currentEquity) / peakEquity) * 100 : 0;

        return {
          name: `Month ${i + 1}`,
          equity: parseFloat(currentEquity.toFixed(2)),
          drawdown: parseFloat(dd.toFixed(2)),
          monthlyPct: ret,
          trade: null,
          win: ret >= 0 ? 1 : -1
        };
      })
    ];

    return { chartData: fallbackPoints, hasGranularData: false };
  }, [data]);

  const totalReturn = chartData.length > 0 
    ? ((chartData[chartData.length - 1].equity - 10000) / 10000) * 100 
    : 0;
  const isPositive = totalReturn >= 0;

  // Custom Tooltip Renderer
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      // Find the payload item that has the trade data (usually in the scatter or area)
      const point = payload[0].payload;
      
      return (
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-xl shadow-2xl min-w-[200px]">
          <p className="font-bold text-slate-300 text-sm mb-2 border-b border-slate-800 pb-2">{point.date || label}</p>
          
          <div className="space-y-1 mb-3">
            <div className="flex justify-between items-center gap-4">
               <span className="text-xs text-slate-500 uppercase font-bold">Equity</span>
               <span className="text-emerald-400 font-mono font-bold">${point.equity.toLocaleString()}</span>
            </div>
            {point.drawdown > 0 && (
              <div className="flex justify-between items-center gap-4">
                 <span className="text-xs text-slate-500 uppercase font-bold">Drawdown</span>
                 <span className="text-rose-400 font-mono text-xs">-{point.drawdown}%</span>
              </div>
            )}
            {!hasGranularData && point.monthlyPct !== undefined && point.name !== 'Start' && (
              <div className="flex justify-between items-center gap-4">
                 <span className="text-xs text-slate-500 uppercase font-bold">Monthly Rtn</span>
                 <span className={`${point.monthlyPct >= 0 ? 'text-emerald-400' : 'text-rose-400'} font-mono text-xs font-bold`}>
                   {point.monthlyPct > 0 ? '+' : ''}{point.monthlyPct}%
                 </span>
              </div>
            )}
          </div>

          {point.trade && (
             <div className="bg-slate-950/50 rounded-lg p-3 text-xs border border-slate-800 animate-in fade-in zoom-in duration-200">
                <div className="flex items-center gap-2 mb-2">
                   <span className={`px-2 py-0.5 rounded font-bold uppercase tracking-wider ${point.trade.type === 'LONG' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                     {point.trade.type}
                   </span>
                   <span className={`font-black ml-auto ${point.trade.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                     {point.trade.result}
                   </span>
                </div>
                <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-slate-400">
                   <span>Entry:</span> <span className="text-white font-mono text-right">{point.trade.entryPrice}</span>
                   <span>Exit:</span> <span className="text-white font-mono text-right">{point.trade.exitPrice}</span>
                   <span className="font-bold text-slate-300">PnL:</span> <span className={`font-mono text-right font-black ${point.trade.pnl.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>{point.trade.pnl}</span>
                </div>
             </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-8 duration-700">
      
      {/* Header */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-bl-full -mr-16 -mt-16 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
              <Activity className="w-5 h-5 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Historical Strategy Report</h2>
          </div>
          <p className="text-slate-400 flex items-center gap-2 text-sm">
            <span className="bg-slate-800 px-2 py-0.5 rounded text-slate-300 font-mono">{data.symbol}</span>
            <span>•</span>
            <span className="text-indigo-300">{data.strategyName}</span>
            <span>•</span>
            <span>{data.timeframe}</span>
          </p>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="mb-2 p-3 rounded-full bg-emerald-500/10 text-emerald-400">
            <Trophy className="w-6 h-6" />
          </div>
          <span className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Win Rate</span>
          <span className="text-3xl font-black text-white">{data.winRate}%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="mb-2 p-3 rounded-full bg-blue-500/10 text-blue-400">
            <Target className="w-6 h-6" />
          </div>
          <span className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Profit Factor</span>
          <span className="text-3xl font-black text-white">{data.profitFactor}</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="mb-2 p-3 rounded-full bg-rose-500/10 text-rose-400">
            <TrendingDown className="w-6 h-6" />
          </div>
          <span className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Max Drawdown</span>
          <span className="text-3xl font-black text-white">{data.maxDrawdown}%</span>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-center items-center text-center">
          <div className="mb-2 p-3 rounded-full bg-purple-500/10 text-purple-400">
            <BarChart2 className="w-6 h-6" />
          </div>
          <span className="text-sm text-slate-400 uppercase font-bold tracking-wider mb-1">Total Trades</span>
          <span className="text-3xl font-black text-white">{data.totalTrades}</span>
        </div>
      </div>

      {/* Performance Summary & Advanced Chart */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-xl flex flex-col">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
             <div>
               <h3 className="text-xl font-bold text-white flex items-center gap-2">
                 <Calendar className="w-5 h-5 text-slate-400" />
                 Equity Curve & Growth
               </h3>
               <p className="text-xs text-slate-500 mt-1">Simulated account growth and periodic returns</p>
             </div>
             
             {/* Chart Legend */}
             <div className="flex flex-wrap gap-4 text-xs bg-slate-950/50 p-2 rounded-lg border border-slate-800">
                <div className="flex items-center gap-1.5">
                   <div className="w-3 h-3 rounded-full bg-emerald-500" />
                   <span className="text-slate-400 font-medium">Equity ($)</span>
                </div>
                {!hasGranularData ? (
                  <>
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded bg-emerald-400 opacity-60" />
                       <span className="text-slate-400 font-medium">+ Month</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                       <div className="w-2 h-2 rounded bg-rose-400 opacity-60" />
                       <span className="text-slate-400 font-medium">- Month</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-1.5">
                     <div className="w-3 h-3 rounded bg-rose-500/30 border border-rose-500/50" />
                     <span className="text-slate-400 font-medium">Drawdown (%)</span>
                  </div>
                )}
                {hasGranularData && (
                  <>
                    <div className="flex items-center gap-1.5 pl-2 border-l border-slate-800">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-emerald-500/30" />
                      <span className="text-emerald-400 font-bold">Win</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-rose-400 ring-2 ring-rose-500/30" />
                      <span className="text-rose-400 font-bold">Loss</span>
                    </div>
                  </>
                )}
             </div>
           </div>
           
           <div className="prose prose-invert prose-slate max-w-none text-slate-300 leading-relaxed font-light text-sm mb-6">
             <p>{data.performanceSummary}</p>
           </div>
           
           <div className="flex-1 min-h-[350px] w-full mt-4">
             <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorEquity" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0.3}/>
                      <stop offset="95%" stopColor={isPositive ? "#10b981" : "#f43f5e"} stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorDrawdown" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.05}/>
                    </linearGradient>
                  </defs>
                  
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  
                  <XAxis 
                    dataKey="name" 
                    tick={{fill: '#64748b', fontSize: 10}} 
                    axisLine={false}
                    tickLine={false}
                    interval={hasGranularData ? "preserveStartEnd" : 0}
                    minTickGap={30}
                  />
                  
                  {/* Left Axis: Equity */}
                  <YAxis 
                    yAxisId="left"
                    domain={['auto', 'auto']} 
                    tick={{fill: '#64748b', fontSize: 10}} 
                    tickFormatter={(value) => `$${(value/1000).toFixed(1)}k`}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />
                  
                  {/* Right Axis: Shared by Drawdown and Monthly Return */}
                  <YAxis 
                    yAxisId="right"
                    orientation="right"
                    // If monthly bars (can be neg/pos), handle range. If Drawdown (0-100), handle that.
                    domain={!hasGranularData ? [-10, 10] : [0, 'auto']} 
                    tick={{fill: '#94a3b8', fontSize: 10, opacity: 0.5}}
                    tickFormatter={(value) => `${value}%`}
                    axisLine={false}
                    tickLine={false}
                    width={40}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  
                  <ReferenceLine yAxisId="left" y={10000} stroke="#475569" strokeDasharray="3 3" />
                  
                  {/* Drawdown Area (Background Layer) - Only show if Granular Data */}
                  {hasGranularData && (
                    <Area
                      yAxisId="right"
                      type="monotone"
                      dataKey="drawdown"
                      stroke="none"
                      fill="url(#colorDrawdown)"
                      isAnimationActive={true}
                    />
                  )}

                  {/* Monthly Return Bars (Only if not granular data) */}
                  {!hasGranularData && (
                    <Bar 
                      yAxisId="right"
                      dataKey="monthlyPct"
                      barSize={20}
                      radius={[4, 4, 0, 0]}
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.monthlyPct >= 0 ? '#10b981' : '#f43f5e'} fillOpacity={0.6} />
                      ))}
                    </Bar>
                  )}

                  {/* Equity Area (Foreground Layer) */}
                  <Area 
                    yAxisId="left"
                    type="monotone" 
                    dataKey="equity" 
                    stroke={isPositive ? "#10b981" : "#f43f5e"} 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorEquity)" 
                    isAnimationActive={true}
                  />

                  {/* Trade Markers (Scatter Layer) */}
                  {hasGranularData && (
                    <Scatter
                       yAxisId="left"
                       data={chartData.filter(d => d.trade)}
                    >
                        {chartData.filter(d => d.trade).map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={entry.win === 1 ? '#10b981' : '#f43f5e'} 
                            stroke="#020617" 
                            strokeWidth={2}
                          />
                        ))}
                    </Scatter>
                  )}
                </ComposedChart>
             </ResponsiveContainer>
           </div>
        </div>

        <div className="md:col-span-1 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h4 className="text-xs font-bold text-emerald-500 uppercase tracking-wider mb-3">Best Trade</h4>
             <p className="text-sm text-slate-300 leading-snug mb-4">{data.bestTrade.description}</p>
             <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
               <div>
                 <span className="text-slate-500 block">Entry</span>
                 <span className="text-white font-mono">{data.bestTrade.entryPrice}</span>
               </div>
               <div>
                 <span className="text-slate-500 block">Exit</span>
                 <span className="text-white font-mono">{data.bestTrade.exitPrice}</span>
               </div>
               <div className="col-span-2 mt-1">
                 <span className="text-slate-500 inline-block mr-2">Return</span>
                 <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded">{data.bestTrade.rMultiple}</span>
               </div>
             </div>
          </div>
          
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
             <h4 className="text-xs font-bold text-rose-500 uppercase tracking-wider mb-3">Worst Trade</h4>
             <p className="text-sm text-slate-300 leading-snug mb-4">{data.worstTrade.description}</p>
             <div className="grid grid-cols-2 gap-2 text-xs border-t border-slate-800 pt-3">
               <div>
                 <span className="text-slate-500 block">Entry</span>
                 <span className="text-white font-mono">{data.worstTrade.entryPrice}</span>
               </div>
               <div>
                 <span className="text-slate-500 block">Exit</span>
                 <span className="text-white font-mono">{data.worstTrade.exitPrice}</span>
               </div>
               <div className="col-span-2 mt-1">
                 <span className="text-slate-500 inline-block mr-2">Return</span>
                 <span className="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded">{data.worstTrade.rMultiple}</span>
               </div>
             </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-center">
             <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Net Profit Estimate</h4>
             <p className="text-4xl font-mono text-white tracking-tight">{data.netProfit}</p>
          </div>
        </div>
      </div>

      {/* Trade Log Table */}
      {data.recentTrades && data.recentTrades.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-slate-800 rounded-lg">
              <Table className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Recent Trade Log (Simulated)</h3>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-slate-400">
              <thead className="text-xs text-slate-500 uppercase bg-slate-950/50">
                <tr>
                  <th className="px-4 py-3 rounded-l-lg">Date</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Entry</th>
                  <th className="px-4 py-3">Exit</th>
                  <th className="px-4 py-3">Result</th>
                  <th className="px-4 py-3 rounded-r-lg text-right">PnL</th>
                </tr>
              </thead>
              <tbody>
                {data.recentTrades.map((trade, idx) => (
                  <tr key={idx} className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors">
                    <td className="px-4 py-3">{trade.date}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        trade.type === 'LONG' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                      }`}>
                        {trade.type}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-300">{trade.entryPrice}</td>
                    <td className="px-4 py-3 font-mono text-slate-300">{trade.exitPrice}</td>
                    <td className="px-4 py-3">
                      <span className={`font-bold ${trade.result === 'WIN' ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {trade.result}
                      </span>
                    </td>
                    <td className={`px-4 py-3 text-right font-mono font-bold ${trade.pnl.includes('+') ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {trade.pnl}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
