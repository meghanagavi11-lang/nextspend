import React, { useState, useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { Globe, Plus, Trash2, AlertCircle, TrendingDown, Loader2 } from 'lucide-react';
import { formatCurrency, OperationType, handleFirestoreError } from '../lib/utils';
import { detectSubscriptionWaste } from '../lib/gemini';

const SubscriptionManager = () => {
  const { subscriptions, user } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [newSub, setNewSub] = useState({ name: '', amount: '', frequency: 'monthly' });
  const [aiWaste, setAiWaste] = useState<{ savings: number, reason: string } | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const analyzeWaste = async () => {
      if (subscriptions.length > 2) {
        setIsAnalyzing(true);
        const result = await detectSubscriptionWaste(subscriptions);
        setAiWaste(result);
        setIsAnalyzing(false);
      }
    };
    analyzeWaste();
  }, [subscriptions]);

  const handleAddSub = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSub.name || !newSub.amount || !user) return;

    try {
      await addDoc(collection(db, 'subscriptions'), {
        ...newSub,
        uid: user.uid,
        amount: parseFloat(newSub.amount),
        isActive: true,
        createdAt: serverTimestamp()
      });
      setNewSub({ name: '', amount: '', frequency: 'monthly' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'subscriptions', auth);
    }
  };

  const totalMonthly = subscriptions.reduce((acc, sub) => {
    return acc + (sub.frequency === 'yearly' ? sub.amount / 12 : sub.amount);
  }, 0);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Subscriptions</h2>
          <p className="text-zinc-500">Track recurring services and find unused waste.</p>
        </div>
        <div className="flex gap-4">
          <div className="hidden sm:block text-right">
            <p className="card-label">Monthly Burn</p>
            <p className="text-xl font-bold text-danger">{formatCurrency(totalMonthly)}</p>
          </div>
          <button
            onClick={() => setIsAdding(!isAdding)}
            className="p-3 bg-danger text-white rounded-full hover:scale-105 transition-transform shadow-lg shadow-danger/20"
          >
            <Plus className={isAdding ? "rotate-45 transition-transform" : "transition-transform"} />
          </button>
        </div>
      </header>

      {isAdding && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          <form onSubmit={handleAddSub} className="card p-8 space-y-6 mb-8 border-danger/20">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="card-label">Service Name</label>
                <input
                  type="text"
                  value={newSub.name}
                  onChange={(e) => setNewSub({ ...newSub, name: e.target.value })}
                  placeholder="e.g. Netflix, Spotify"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-danger transition-colors text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="card-label">Amount</label>
                <input
                  type="number"
                  value={newSub.amount}
                  onChange={(e) => setNewSub({ ...newSub, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-danger transition-colors text-white"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="card-label">Billing Frequency</label>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => setNewSub({ ...newSub, frequency: 'monthly' })}
                    className={`py-4 rounded-2xl font-bold border transition-all ${newSub.frequency === 'monthly' ? 'bg-danger text-white border-danger' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                  >
                    Monthly
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewSub({ ...newSub, frequency: 'yearly' })}
                    className={`py-4 rounded-2xl font-bold border transition-all ${newSub.frequency === 'yearly' ? 'bg-danger text-white border-danger' : 'bg-white/5 border-white/10 text-zinc-500'}`}
                  >
                    Yearly
                  </button>
                </div>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-danger text-white font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg shadow-danger/20"
            >
              Add Subscription
            </button>
          </form>
        </motion.div>
      )}

      {/* Waste Detector Alert */}
      {(isAnalyzing || aiWaste) && (
        <div className="card bg-danger/10 border-danger/30 p-6 flex items-center gap-4">
          <div className="bg-danger rounded-full p-2">
            {isAnalyzing ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <TrendingDown className="w-5 h-5 text-white" />
            )}
          </div>
          <div>
            <p className="font-bold text-white">
              {isAnalyzing ? "AI Analyzing Subscriptions..." : "AI Waste Detector"}
            </p>
            <p className="text-zinc-500 text-sm">
              {isAnalyzing 
                ? "Looking for overlapping services and potential savings..." 
                : aiWaste?.reason || "Your subscription health looks great!"}
              {aiWaste && aiWaste.savings > 0 && (
                <span className="text-danger font-bold ml-1"> Potential savings: {formatCurrency(aiWaste.savings)}/mo.</span>
              )}
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {subscriptions.map((sub) => (
          <motion.div
            key={sub.id}
            className="card p-8 space-y-6 group hover:border-danger/30 transition-all border-white/10"
          >
            <div className="flex justify-between items-start">
              <div className="p-4 bg-danger/10 rounded-2xl">
                <Globe className="w-8 h-8 text-danger" />
              </div>
              <button className="text-zinc-600 hover:text-danger p-2 transition-colors">
                <Trash2 className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">{sub.name}</h3>
              <p className="text-zinc-500 text-sm capitalize">{sub.frequency}</p>
            </div>

            <div className="pt-4 border-t border-white/5">
              <p className="card-label">Cost</p>
              <p className="text-2xl font-bold text-white tracking-tight">
                {formatCurrency(sub.amount)}
                <span className="text-xs text-zinc-500 font-normal ml-1">/{sub.frequency === 'monthly' ? 'mo' : 'yr'}</span>
              </p>
            </div>
          </motion.div>
        ))}
        {subscriptions.length === 0 && (
          <div className="md:col-span-3 text-center py-24 card border-dashed border-white/5 opacity-50">
            <p className="text-zinc-500">No active subscriptions detected.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubscriptionManager;
