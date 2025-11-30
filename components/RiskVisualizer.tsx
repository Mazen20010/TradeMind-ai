import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine, Cell } from 'recharts';
import { TradeAction } from '../types';

interface RiskVisualizerProps {
  entry: string;
  stopLoss: string;
  takeProfit: string;
  action: TradeAction;
}

export const RiskVisualizer: React.FC<RiskVisualizerProps> = ({ entry, stopLoss, takeProfit, action }) => {
  // Parse strings to numbers for the chart, handling 'k' or '$' potentially if API returns them.
  // We assume the API returns relatively clean strings, but let's strip non-numerics just in case.
  const parsePrice = (p: string) => parseFloat(p.replace(/[^0-9.]/g, ''));
  
  const entryP = parsePrice(entry);
  const slP = parsePrice(stopLoss);
  const tpP = parsePrice(takeProfit);

  if (isNaN(entryP) || isNaN(slP) || isNaN(tpP)) {
    return <div className="h-40 flex items-center justify-center text-slate-500">Visualization unavailable for complex price formats</div>;
  }

  // Create data for a simple range visual
  const data = [
    { name: 'Stop Loss', price: slP, type: 'Loss' },
    { name: 'Entry', price: entryP, type: 'Entry' },
    { name: 'Take Profit', price: tpP, type: 'Profit' },
  ];

  // Calculate domain padding
  const min = Math.min(slP, entryP, tpP);
  const max = Math.max(slP, entryP, tpP);
  const padding = (max - min) * 0.1;

  return (
    <div className="w-full h-64 mt-4">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 20, right: 30, left: 40, bottom: 5 }}
        >
          <XAxis type="number" domain={[min - padding, max + padding]} hide />
          <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={80} />
          <Tooltip 
            cursor={{fill: 'transparent'}}
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f1f5f9' }}
          />
          <ReferenceLine x={entryP} stroke="#94a3b8" strokeDasharray="3 3" />
          <Bar dataKey="price" barSize={20} radius={[0, 4, 4, 0]}>
             {data.map((entry, index) => {
               let color = '#94a3b8'; // Entry
               if (entry.type === 'Loss') color = '#f43f5e'; // Red
               if (entry.type === 'Profit') color = '#10b981'; // Green
               return <Cell key={`cell-${index}`} fill={color} />;
             })}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      <div className="flex justify-between text-xs text-slate-500 px-4">
        <span>Stop Loss</span>
        <span>Target</span>
      </div>
    </div>
  );
};
