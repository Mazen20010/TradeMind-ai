
import React, { useState, useRef, useEffect } from 'react';
import { Search, Loader2, Upload, X, ImageIcon, Shield, Swords, Scale, DollarSign, Percent, Calculator, History, LineChart, FlaskConical } from 'lucide-react';
import { UserInput } from '../types';
import { TIMEFRAMES, RISK_LEVELS } from '../constants';

interface InputFormProps {
  onAnalyze: (data: UserInput) => void;
  isLoading: boolean;
}

export const InputForm: React.FC<InputFormProps> = ({ onAnalyze, isLoading }) => {
  const [mode, setMode] = useState<'LIVE' | 'BACKTEST'>('LIVE');
  const [symbol, setSymbol] = useState('');
  const [timeframe, setTimeframe] = useState(TIMEFRAMES[1]);
  const [context, setContext] = useState('');
  const [image, setImage] = useState<string | null>(null);
  const [riskLevel, setRiskLevel] = useState(RISK_LEVELS[1]); // Default Moderate
  
  // Backtest specific
  const [strategyToTest, setStrategyToTest] = useState('');
  const [backtestDuration, setBacktestDuration] = useState('Last 6 Months');
  
  // Money Management State
  const [balance, setBalance] = useState<string>('');
  const [riskPercent, setRiskPercent] = useState<string>('1.0');
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load preference from local storage on mount
  useEffect(() => {
    const savedRisk = localStorage.getItem('tradeMind_riskLevel');
    if (savedRisk && RISK_LEVELS.includes(savedRisk)) {
      setRiskLevel(savedRisk);
    }
    
    // Load balance if saved previously
    const savedBalance = localStorage.getItem('tradeMind_balance');
    if (savedBalance) setBalance(savedBalance);
  }, []);

  // Save preference when changed
  useEffect(() => {
    localStorage.setItem('tradeMind_riskLevel', riskLevel);
  }, [riskLevel]);

  // Save balance when changed
  useEffect(() => {
    if (balance) localStorage.setItem('tradeMind_balance', balance);
  }, [balance]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("File size should be less than 5MB");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol) return;
    
    if (mode === 'LIVE' && (!context && !image)) return;
    if (mode === 'BACKTEST' && !strategyToTest) return;

    onAnalyze({
      mode,
      symbol: symbol.toUpperCase(), // Logic in App.tsx handles splitting
      timeframe,
      marketContext: context,
      image: image || undefined,
      riskLevel,
      accountBalance: balance ? parseFloat(balance) : undefined,
      riskPercentage: riskPercent ? parseFloat(riskPercent) : undefined,
      strategyToTest: mode === 'BACKTEST' ? strategyToTest : undefined,
      backtestDuration: mode === 'BACKTEST' ? backtestDuration : undefined
    });
  };

  const getRiskIcon = (level: string) => {
    switch(level) {
      case 'Conservative': return <Shield className="w-4 h-4" />;
      case 'Aggressive': return <Swords className="w-4 h-4" />;
      default: return <Scale className="w-4 h-4" />;
    }
  };

  // Calculate Risk Amount
  const riskAmount = balance && riskPercent 
    ? (parseFloat(balance) * parseFloat(riskPercent) / 100).toFixed(2) 
    : '0.00';

  return (
    <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 md:p-8 shadow-xl shadow-black/20">
      
      {/* Header and Mode Switch */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-white mb-1">
            {mode === 'LIVE' ? 'Market Scanner' : 'Strategy Lab'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'LIVE' 
              ? 'Real-time analysis using institutional models.' 
              : 'Simulate strategy performance on historical data.'}
          </p>
        </div>
        
        <div className="bg-slate-950 p-1 rounded-xl border border-slate-800 flex shrink-0">
          <button
            onClick={() => setMode('LIVE')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'LIVE' 
                ? 'bg-emerald-500 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <LineChart className="w-4 h-4" />
            Live Analysis
          </button>
          <button
            onClick={() => setMode('BACKTEST')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'BACKTEST' 
                ? 'bg-indigo-500 text-white shadow-lg' 
                : 'text-slate-500 hover:text-slate-300'
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            Backtest
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Ticker Symbol(s)</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              placeholder="BTCUSD, ETHUSD (Comma separated)"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all uppercase"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium text-slate-300">Timeframe</label>
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all appearance-none"
            >
              {TIMEFRAMES.map((tf) => (
                <option key={tf} value={tf}>{tf}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Backtest Specific Inputs */}
        {mode === 'BACKTEST' && (
           <div className="border border-indigo-500/30 bg-indigo-500/5 rounded-xl p-5 animate-in fade-in slide-in-from-top-4 relative overflow-hidden">
             {/* Decor */}
             <div className="absolute -top-10 -right-10 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl" />
             
             <h3 className="text-indigo-300 font-bold text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
               <History className="w-4 h-4" /> Configuration
             </h3>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
               <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Strategy Name</label>
                  <input
                    type="text"
                    value={strategyToTest}
                    onChange={(e) => setStrategyToTest(e.target.value)}
                    placeholder="e.g. ICT Silver Bullet, MACD Divergence"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    required={mode === 'BACKTEST'}
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-sm font-medium text-white">Simulation Duration</label>
                  <select
                    value={backtestDuration}
                    onChange={(e) => setBacktestDuration(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                  >
                    <option>Last 1 Month</option>
                    <option>Last 3 Months</option>
                    <option>Last 6 Months</option>
                    <option>Last 1 Year</option>
                    <option>Last 3 Years</option>
                  </select>
               </div>
             </div>
           </div>
        )}

        {/* Live Analysis Specific Inputs */}
        {mode === 'LIVE' && (
          <>
            {/* Money Management Section */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800">
              <div className="flex items-center gap-2 mb-4 text-emerald-400">
                <Calculator className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wide">Position Calculator</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <DollarSign className="w-3 h-3" /> Account Balance
                  </label>
                  <input
                    type="number"
                    value={balance}
                    onChange={(e) => setBalance(e.target.value)}
                    placeholder="10000"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-400 flex items-center gap-1">
                    <Percent className="w-3 h-3" /> Risk per Trade
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={riskPercent}
                    onChange={(e) => setRiskPercent(e.target.value)}
                    placeholder="1.0"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                </div>
                <div className="bg-slate-900/50 border border-slate-700 rounded-lg p-2 flex flex-col justify-center items-center">
                  <span className="text-xs text-slate-500 uppercase font-bold">Total Risk Amount</span>
                  <span className="text-xl font-mono font-bold text-rose-400">
                    ${riskAmount}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Level Selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Risk Profile</label>
              <div className="grid grid-cols-3 gap-3">
                {RISK_LEVELS.map((level) => {
                  const isSelected = riskLevel === level;
                  return (
                    <button
                      key={level}
                      type="button"
                      onClick={() => setRiskLevel(level)}
                      className={`flex items-center justify-center gap-2 px-3 py-3 rounded-lg text-sm font-medium transition-all border ${
                        isSelected 
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-900 hover:border-slate-700'
                      }`}
                    >
                      {getRiskIcon(level)}
                      <span className="hidden sm:inline">{level}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Image Upload Section */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Chart Screenshot (Recommended)</label>
              
              {!image ? (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-800 hover:border-emerald-500/50 hover:bg-slate-800/50 rounded-xl p-8 transition-all cursor-pointer group flex flex-col items-center justify-center gap-3"
                >
                  <div className="p-3 bg-slate-900 rounded-full group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-300 font-medium">Click to upload chart image</p>
                    <p className="text-slate-500 text-xs mt-1">Supports PNG, JPG (Max 5MB)</p>
                  </div>
                </div>
              ) : (
                <div className="relative group rounded-xl overflow-hidden border border-slate-700 bg-slate-900">
                   <img src={image} alt="Chart Preview" className="w-full h-48 object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                   <button
                    type="button"
                    onClick={removeImage}
                    className="absolute top-2 right-2 bg-slate-900/90 hover:bg-rose-500/90 text-white p-2 rounded-lg transition-colors border border-slate-700 hover:border-rose-500"
                   >
                     <X className="w-4 h-4" />
                   </button>
                   <div className="absolute bottom-2 left-2 bg-slate-900/90 px-3 py-1 rounded-lg text-xs text-emerald-400 font-medium border border-slate-700 flex items-center gap-2">
                     <ImageIcon className="w-3 h-3" /> Image Loaded
                   </div>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">
                {image ? "Additional Context (Optional)" : "Market Context (Required if no image)"}
              </label>
              <textarea
                value={context}
                onChange={(e) => setContext(e.target.value)}
                placeholder={image ? "Add any specific indicators or notes not visible in the image..." : "E.g., Price is consolidating near 65k resistance. RSI is showing bearish divergence..."}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all h-24 resize-none"
                required={!image}
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={isLoading || !symbol || (mode === 'LIVE' && !context && !image) || (mode === 'BACKTEST' && !strategyToTest)}
          className={`w-full font-bold py-4 rounded-xl transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 group ${
            mode === 'LIVE' 
              ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 shadow-emerald-900/20' 
              : 'bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 shadow-indigo-900/20'
          }`}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              {mode === 'LIVE' ? 'Analyzing Market Data...' : 'Running Simulation...'}
            </>
          ) : (
            <>
              {mode === 'LIVE' ? (
                <>
                  <Search className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Generate Trading Plan
                </>
              ) : (
                <>
                  <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
                  Run Historical Backtest
                </>
              )}
            </>
          )}
        </button>
      </form>
    </div>
  );
};
