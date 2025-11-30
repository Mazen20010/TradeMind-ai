import React from 'react';
import { Check, Star, Zap, Shield, BarChart3 } from 'lucide-react';

interface PricingProps {
  onPlanSelect: (planName: string, price: string) => void;
}

export const Pricing: React.FC<PricingProps> = ({ onPlanSelect }) => {
  const plans = [
    {
      name: 'Basic',
      price: '$11.99',
      period: '/month',
      description: 'Essential tools for beginners to understand market structure.',
      icon: <BarChart3 className="w-6 h-6 text-slate-400" />,
      features: [
        '3 AI Analyses per day',
        'Text-based Market Context',
        'Standard Risk/Reward Calculation',
        'Daily Timeframe Analysis',
        'Basic Support & Resistance Levels'
      ],
      cta: 'Get Started',
      highlight: false,
      color: 'slate'
    },
    {
      name: 'Pro',
      price: '$67.99',
      period: '/month',
      description: 'Advanced capabilities for active traders requiring precision.',
      icon: <Zap className="w-6 h-6 text-emerald-400" />,
      features: [
        'Unlimited AI Market Scans',
        'Chart Image & Screenshot Analysis',
        'Custom Risk Profiles (Aggressive/Safe)',
        'All Timeframes (1m to Weekly)',
        'Advanced Pattern Recognition',
        'Priority Processing Queue'
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
      color: 'emerald'
    },
    {
      name: 'Premium',
      price: '$119.99',
      period: '/month',
      description: 'Institutional-grade power for professional portfolio managers.',
      icon: <Shield className="w-6 h-6 text-purple-400" />,
      features: [
        'Everything in Pro',
        'Macro-Economic Sentiment Analysis',
        'Multi-Asset Correlation Checks',
        'Institutional Liquidity Zones',
        'Direct API Access',
        '24/7 Dedicated Support',
        'Strategy Backtesting Reports'
      ],
      cta: 'Go Premium',
      highlight: false,
      color: 'purple'
    }
  ];

  return (
    <div className="py-24 border-t border-slate-900 mt-20 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-1/4 left-0 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight">
            Professional Trading Intelligence
          </h2>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Choose the power level that fits your trading desk. From basic insights to institutional-grade algo analysis.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {plans.map((plan) => (
            <div 
              key={plan.name}
              className={`relative rounded-3xl p-8 border flex flex-col h-full transition-all duration-300 group hover:shadow-2xl ${
                plan.highlight 
                  ? 'bg-slate-900/80 border-emerald-500/50 shadow-2xl shadow-emerald-900/10 scale-100 md:scale-105 z-10' 
                  : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/60'
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-emerald-600 to-emerald-400 text-slate-950 font-bold px-4 py-1 rounded-full text-sm flex items-center gap-1 shadow-lg shadow-emerald-500/20 whitespace-nowrap">
                  <Star className="w-3 h-3 fill-current" /> Most Popular
                </div>
              )}
              
              <div className="mb-8">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-2xl bg-slate-900 border border-slate-800 ${plan.highlight ? 'bg-emerald-500/10 border-emerald-500/20' : ''}`}>
                    {plan.icon}
                  </div>
                </div>

                <h3 className={`text-xl font-bold mb-2 ${plan.highlight ? 'text-white' : 'text-slate-200'}`}>
                  {plan.name}
                </h3>
                <p className="text-slate-400 text-sm h-10 mb-6 leading-relaxed">
                  {plan.description}
                </p>

                <div className="flex items-baseline gap-1">
                  <span className={`text-4xl font-black ${plan.highlight ? 'text-white' : 'text-slate-200'}`}>
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-slate-500 font-medium">{plan.period}</span>}
                </div>
              </div>

              <div className="border-t border-slate-800/50 my-6" />

              <ul className="space-y-4 mb-8 flex-1">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-slate-300">
                    <div className={`mt-0.5 p-0.5 rounded-full shrink-0 ${
                      plan.color === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
                      plan.color === 'purple' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-slate-800 text-slate-400'
                    }`}>
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="leading-tight">{feature}</span>
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onPlanSelect(plan.name, plan.price)}
                className={`w-full py-4 rounded-xl font-bold transition-all duration-300 ${
                plan.highlight
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400 text-white shadow-lg shadow-emerald-900/20 hover:shadow-emerald-900/40 hover:-translate-y-1'
                  : 'bg-slate-800 hover:bg-slate-700 text-white hover:-translate-y-1'
              }`}>
                {plan.cta}
              </button>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <p className="text-slate-500 text-sm">
            All plans include SSL encryption and secure data handling. Prices are in USD.
          </p>
        </div>
      </div>
    </div>
  );
};