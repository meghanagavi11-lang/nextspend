import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useFirebase } from './FirebaseProvider';
import { getFinancialFuture } from '../lib/gemini';
import { formatCurrency } from '../lib/utils';
import { 
  History, 
  Orbit, 
  Telescope, 
  ArrowRight, 
  TrendingUp, 
  TrendingDown, 
  Zap, 
  BrainCircuit,
  Loader2
} from 'lucide-react';

const PredictiveInsights = () => {
  const { expenses, goals } = useFirebase();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'timeline' | 'simulator'>('timeline');

  // Calculate a mock present balance for simulation if not tracked globally
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mockBalance = 500000 - totalExpenses; // Assuming initial 5L for demo

  useEffect(() => {
    const fetchData = async () => {
      if (expenses.length > 0) {
        setLoading(true);
        const result = await getFinancialFuture(expenses, mockBalance, goals);
        setData(result);
        setLoading(false);
      }
    };
    fetchData();
  }, [expenses.length]);

  if (loading) {
    return (
      <div className="card min-h-[400px] flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 text-accent animate-spin" />
        <p className="text-text-s font-mono text-xs uppercase tracking-widest">Predicting the Multiverse...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-glass pb-4">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab('timeline')}
            className={`flex items-center gap-2 pb-4 -mb-4 transition-all border-b-2 ${activeTab === 'timeline' ? 'border-accent text-accent' : 'border-transparent text-text-s hover:text-white'}`}
          >
            <Orbit className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-widest">Financial Timeline</span>
          </button>
          <button 
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center gap-2 pb-4 -mb-4 transition-all border-b-2 ${activeTab === 'simulator' ? 'border-accent text-accent' : 'border-transparent text-text-s hover:text-white'}`}
          >
            <Zap className="w-4 h-4" />
            <span className="font-bold text-xs uppercase tracking-widest">Future Simulator</span>
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'timeline' ? (
          <motion.div 
            key="timeline"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            {/* Past */}
            <div className="card border-l-4 border-l-text-s/30 bg-surface/30">
              <div className="flex items-center gap-3 mb-6">
                <History className="w-5 h-5 text-text-s" />
                <h4 className="font-bold text-xs uppercase tracking-tighter text-text-s">Past History</h4>
              </div>
              <p className="text-3xl font-display font-black mb-2">{formatCurrency(totalExpenses)}</p>
              <p className="text-xs text-text-s bg-black/30 px-2 py-1 rounded inline-block">Total outflow recorded</p>
            </div>

            {/* Present */}
            <div className="card border-l-4 border-l-accent bg-accent/5">
              <div className="flex items-center gap-3 mb-6">
                <Orbit className="w-5 h-5 text-accent" />
                <h4 className="font-bold text-xs uppercase tracking-tighter text-accent">Present Status</h4>
              </div>
              <p className="text-3xl font-display font-black mb-2">{formatCurrency(mockBalance)}</p>
              <p className="text-xs text-accent bg-accent/20 px-2 py-1 rounded inline-block">Current Liquidity</p>
            </div>

            {/* Future */}
            <div className="card border-l-4 border-l-purple-500 bg-purple-500/5">
              <div className="flex items-center gap-3 mb-6">
                <Telescope className="w-5 h-5 text-purple-500" />
                <h4 className="font-bold text-xs uppercase tracking-tighter text-purple-500">Future Horizon</h4>
              </div>
              {data ? (
                <div className="space-y-4">
                  <p className="text-3xl font-display font-black">{formatCurrency(data.predictions[1].balance)}</p>
                  <p className="text-xs text-purple-300 font-mono italic">"Predicted balance in 1 year"</p>
                </div>
              ) : (
                <p className="text-text-s italic text-sm">Awaiting simulation data...</p>
              )}
            </div>
          </motion.div>
        ) : (
          <motion.div 
            key="simulator"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Current Path */}
              <div className="card group hover:border-danger/30 transition-colors">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingDown className="w-6 h-6 text-danger" />
                  <h4 className="font-display font-bold text-xl">The "Default" Path</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-black/50 p-4 rounded-xl border border-glass">
                    <p className="card-label">Wealth in 5 Years</p>
                    <p className="text-4xl font-black text-danger">{formatCurrency(data?.simulator?.currentTrend?.futureWorth5yr || 0)}</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-text-s">
                    <BrainCircuit className="w-5 h-5 text-danger flex-shrink-0 mt-1" />
                    <p>{data?.simulator?.currentTrend?.consequence || "Analyzing trends..."}</p>
                  </div>
                </div>
              </div>

              {/* Improved Path */}
              <div className="card group hover:border-accent/30 transition-colors border-2 border-accent/20">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-6 h-6 text-accent" />
                  <h4 className="font-display font-bold text-xl">The "Alpha" Path</h4>
                </div>
                <div className="space-y-4">
                  <div className="bg-accent/10 p-4 rounded-xl border border-accent/30 shadow-[0_0_20px_rgba(0,255,136,0.1)]">
                    <p className="card-label text-accent">Wealth in 5 Years</p>
                    <p className="text-4xl font-black text-accent">{formatCurrency(data?.simulator?.improvedTrend?.futureWorth5yr || 0)}</p>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-white">
                    <BrainCircuit className="w-5 h-5 text-accent flex-shrink-0 mt-1" />
                    <p className="font-medium italic">{data?.simulator?.improvedTrend?.benefit || "Calculating gains..."}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Impact Visualization */}
            {data && (
              <div className="card bg-surface/20 border-glass p-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Orbit className="w-32 h-32 text-accent" />
                </div>
                <div className="relative z-10 max-w-2xl">
                  <p className="text-text-s uppercase tracking-widest text-[10px] font-bold mb-2">Long-term Alpha Gap</p>
                  <h3 className="text-4xl font-display font-black mb-4">
                    The Difference is <span className="text-accent underline">{formatCurrency((data.simulator.improvedTrend.futureWorth5yr - data.simulator.currentTrend.futureWorth5yr))}</span>
                  </h3>
                  <p className="text-text-s leading-relaxed">
                    By making small adjustments today, your future self is effectively "earning" this amount without additional work. This is the power of predictive compounding.
                  </p>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default PredictiveInsights;
