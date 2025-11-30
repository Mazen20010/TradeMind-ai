
import React, { useState, useEffect, useRef } from 'react';
import { Bell, BellRing, Trash2, Activity, Plus, Play, Pause, Zap, Settings, Volume2, VolumeX, Monitor, BellOff } from 'lucide-react';
import { PriceAlert, AlertCondition } from '../types';

export const AlertsPanel: React.FC = () => {
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);
  const [symbol, setSymbol] = useState('');
  const [condition, setCondition] = useState<AlertCondition>('PRICE_ABOVE');
  const [targetValue, setTargetValue] = useState('');
  const [isSimulating, setIsSimulating] = useState(true);
  
  // Notification Preferences
  const [showSettings, setShowSettings] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [desktopEnabled, setDesktopEnabled] = useState(false);

  // Mock Market Data State
  const [marketData, setMarketData] = useState<Record<string, { price: number; rsi: number }>>({});
  
  // Ref to track triggered state to prevent re-triggering constantly in the loop
  // We use this to play effects only once per trigger event
  const processedTriggers = useRef<Set<string>>(new Set());

  // Programmatic Sound Generator (No external assets needed)
  const playAlertSound = () => {
    if (!soundEnabled) return;
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContext) return;
      
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.connect(gain);
      gain.connect(ctx.destination);

      // Futuristic Ping Sound
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
      osc.frequency.exponentialRampToValueAtTime(1760, ctx.currentTime + 0.1); // Octave up
      
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch (e) {
      console.error("Audio play failed", e);
    }
  };

  const requestDesktopPermission = async () => {
    if (!("Notification" in window)) {
      alert("This browser does not support desktop notifications");
      return;
    }
    
    if (Notification.permission === "granted") {
      setDesktopEnabled(true);
    } else if (Notification.permission !== "denied") {
      const permission = await Notification.requestPermission();
      if (permission === "granted") {
        setDesktopEnabled(true);
        new Notification("TradeMind AI", { body: "Desktop notifications enabled!" });
      } else {
        setDesktopEnabled(false);
      }
    }
  };

  const toggleDesktop = () => {
    if (!desktopEnabled) {
      requestDesktopPermission();
    } else {
      setDesktopEnabled(false);
    }
  };

  // Add Alert
  const handleAddAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symbol || !targetValue) return;

    const newAlert: PriceAlert = {
      id: crypto.randomUUID(),
      symbol: symbol.toUpperCase(),
      condition,
      targetValue: parseFloat(targetValue),
      isActive: true,
      isTriggered: false,
      createdAt: Date.now()
    };

    setAlerts(prev => [newAlert, ...prev]);
    
    // Initialize mock data for this symbol if not exists
    if (!marketData[newAlert.symbol]) {
      // Use target value as a baseline to make the demo realistic immediately
      const basePrice = parseFloat(targetValue);
      setMarketData(prev => ({
        ...prev,
        [newAlert.symbol]: { 
          price: basePrice * (Math.random() > 0.5 ? 0.98 : 1.02), // Start slightly off target
          rsi: 50 
        }
      }));
    }

    setSymbol('');
    setTargetValue('');
  };

  const removeAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
    processedTriggers.current.delete(id);
  };

  // Market Simulator & Trigger Checker
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setMarketData(currentData => {
        const updatedData = { ...currentData };
        const uniqueSymbols: string[] = Array.from(new Set(alerts.map(a => a.symbol)));

        uniqueSymbols.forEach(sym => {
          if (!updatedData[sym]) return;
          
          const currentPrice = updatedData[sym].price;
          const currentRSI = updatedData[sym].rsi;

          // Random Walk Simulation
          const volatility = 0.002; // 0.2% moves
          const change = currentPrice * volatility * (Math.random() - 0.5);
          const newPrice = currentPrice + change;

          // RSI Simulation (Mean reversion to 50)
          const rsiChange = (Math.random() - 0.5) * 5 + (50 - currentRSI) * 0.05;
          let newRSI = currentRSI + rsiChange;
          newRSI = Math.max(0, Math.min(100, newRSI));

          updatedData[sym] = { price: newPrice, rsi: newRSI };
        });

        return updatedData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isSimulating, alerts]);

  // Check Triggers
  useEffect(() => {
    setAlerts(currentAlerts => {
      return currentAlerts.map(alert => {
        if (!alert.isActive || alert.isTriggered) return alert;

        const data = marketData[alert.symbol];
        if (!data) return alert;

        let triggered = false;
        if (alert.condition === 'PRICE_ABOVE' && data.price >= alert.targetValue) triggered = true;
        if (alert.condition === 'PRICE_BELOW' && data.price <= alert.targetValue) triggered = true;
        if (alert.condition === 'RSI_OVERBOUGHT' && data.rsi >= alert.targetValue) triggered = true;
        if (alert.condition === 'RSI_OVERSOLD' && data.rsi <= alert.targetValue) triggered = true;

        if (triggered && !processedTriggers.current.has(alert.id)) {
          // Mark as processed so we don't spam sounds/notifications for the same alert
          processedTriggers.current.add(alert.id);
          
          // 1. Play Sound
          playAlertSound();

          // 2. Desktop Notification
          if (desktopEnabled && Notification.permission === 'granted') {
             new Notification(`Trade Alert: ${alert.symbol}`, {
               body: `${alert.symbol} triggered ${alert.condition} at ${data.price.toFixed(2)}`,
               icon: '/favicon.ico' // fallback
             });
          }

          return { ...alert, isTriggered: true };
        }
        return alert;
      });
    });
  }, [marketData, desktopEnabled, soundEnabled]); // Add dependencies

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-visible animate-in fade-in slide-in-from-bottom-4">
      {/* Background Decor */}
      <div className="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-2xl overflow-hidden pointer-events-none" />

      <div className="flex items-center justify-between mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/20">
            <Bell className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold text-white">Alerts & Market Watch</h3>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Activity className="w-3 h-3" /> 
              {isSimulating ? 'Simulating Live Data Feed' : 'Simulation Paused'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Toggle */}
          <div className="relative">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className={`p-2 rounded-lg border transition-colors ${showSettings ? 'bg-slate-800 border-indigo-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'}`}
            >
              <Settings className="w-4 h-4" />
            </button>

            {/* Notification Settings Dropdown */}
            {showSettings && (
              <div className="absolute right-0 top-full mt-2 w-56 bg-slate-950 border border-slate-800 rounded-xl shadow-xl z-50 p-3 animate-in fade-in zoom-in-95 duration-200">
                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 px-1">Notification Prefs</h4>
                
                <div className="space-y-1">
                   {/* Sound Toggle */}
                   <button 
                     onClick={() => setSoundEnabled(!soundEnabled)}
                     className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 transition-colors group"
                   >
                     <div className="flex items-center gap-2 text-sm text-slate-300">
                        {soundEnabled ? <Volume2 className="w-4 h-4 text-emerald-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
                        Sound Effects
                     </div>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all ${soundEnabled ? 'left-4.5' : 'left-0.5'}`} style={{left: soundEnabled ? '1.1rem' : '0.15rem'}} />
                     </div>
                   </button>

                   {/* Desktop Toggle */}
                   <button 
                     onClick={toggleDesktop}
                     className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-900 transition-colors group"
                   >
                     <div className="flex items-center gap-2 text-sm text-slate-300">
                        {desktopEnabled ? <Monitor className="w-4 h-4 text-emerald-400" /> : <BellOff className="w-4 h-4 text-slate-500" />}
                        Browser Notify
                     </div>
                     <div className={`w-8 h-4 rounded-full relative transition-colors ${desktopEnabled ? 'bg-emerald-500' : 'bg-slate-700'}`}>
                        <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-all`} style={{left: desktopEnabled ? '1.1rem' : '0.15rem'}} />
                     </div>
                   </button>
                </div>
              </div>
            )}
          </div>

          <button 
            onClick={() => setIsSimulating(!isSimulating)}
            className={`p-2 rounded-lg border transition-colors ${
              isSimulating ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-slate-400'
            }`}
            title={isSimulating ? "Pause Simulator" : "Resume Simulator"}
          >
            {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <form onSubmit={handleAddAlert} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-8">
        <input
          type="text"
          value={symbol}
          onChange={(e) => setSymbol(e.target.value)}
          placeholder="Symbol (e.g. BTC)"
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 uppercase"
        />
        <select
          value={condition}
          onChange={(e) => setCondition(e.target.value as AlertCondition)}
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
        >
          <option value="PRICE_ABOVE">Price Above</option>
          <option value="PRICE_BELOW">Price Below</option>
          <option value="RSI_OVERBOUGHT">RSI Above (Overbought)</option>
          <option value="RSI_OVERSOLD">RSI Below (Oversold)</option>
        </select>
        <input
          type="number"
          value={targetValue}
          onChange={(e) => setTargetValue(e.target.value)}
          placeholder="Value"
          className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <button
          type="submit"
          className="bg-indigo-600 hover:bg-indigo-500 text-white font-medium rounded-lg px-4 py-2 flex items-center justify-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" /> Set Alert
        </button>
      </form>

      {/* Alerts List */}
      <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
        {alerts.length === 0 ? (
          <div className="text-center py-8 border-2 border-dashed border-slate-800 rounded-xl">
             <BellRing className="w-8 h-8 text-slate-600 mx-auto mb-2" />
             <p className="text-slate-500 text-sm">No active alerts. Add one above.</p>
          </div>
        ) : (
          alerts.map(alert => {
            const data = marketData[alert.symbol];
            return (
              <div 
                key={alert.id}
                className={`p-4 rounded-xl border transition-all duration-500 ${
                  alert.isTriggered 
                    ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                    : 'bg-slate-950 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${alert.isTriggered ? 'bg-emerald-500 text-slate-950' : 'bg-slate-800 text-slate-400'}`}>
                      {alert.condition.includes('RSI') ? <Zap className="w-4 h-4" /> : <Activity className="w-4 h-4" />}
                    </div>
                    <div>
                      <h4 className="font-bold text-white flex items-center gap-2">
                        {alert.symbol}
                        {alert.isTriggered && (
                          <span className="text-[10px] bg-emerald-500 text-slate-950 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide animate-pulse">
                            Triggered
                          </span>
                        )}
                      </h4>
                      <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <span>Condition:</span>
                        <span className="text-indigo-300 font-medium">
                          {alert.condition === 'PRICE_ABOVE' && '> '}
                          {alert.condition === 'PRICE_BELOW' && '< '}
                          {alert.condition === 'RSI_OVERBOUGHT' && 'RSI > '}
                          {alert.condition === 'RSI_OVERSOLD' && 'RSI < '}
                          {alert.targetValue}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    {data ? (
                      <>
                        <div className="text-sm font-mono text-white">
                          ${data.price.toFixed(2)}
                        </div>
                        <div className={`text-xs font-medium flex items-center justify-end gap-1 ${data.rsi > 70 ? 'text-rose-400' : data.rsi < 30 ? 'text-emerald-400' : 'text-slate-500'}`}>
                          RSI: {data.rsi.toFixed(1)}
                        </div>
                      </>
                    ) : (
                      <span className="text-xs text-slate-600 italic">Waiting for data...</span>
                    )}
                  </div>

                  <button 
                    onClick={() => removeAlert(alert.id)}
                    className="ml-4 p-2 text-slate-600 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
