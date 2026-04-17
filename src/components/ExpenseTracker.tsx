import React, { useState, useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { collection, addDoc, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Trash2, Tag, Calendar, IndianRupee, Smile, Frown, Zap, AlertTriangle, Loader2, BrainCircuit } from 'lucide-react';
import { formatCurrency, OperationType, handleFirestoreError } from '../lib/utils';
import { checkTransactionImpact } from '../lib/gemini';
import { format } from 'date-fns';

const ExpenseTracker = () => {
  const { expenses, user, goals } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('Food');
  const [description, setDescription] = useState('');
  const [isImpulsive, setIsImpulsive] = useState(false);
  
  // Regret Alert State
  const [impactAlert, setImpactAlert] = useState<{ shouldProceed: boolean, alert: string | null, severity: string } | null>(null);
  const [isCheckingImpact, setIsCheckingImpact] = useState(false);

  // Mock balance check
  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const mockBalance = 500000 - totalExpenses;

  useEffect(() => {
    const checkImpact = async () => {
      if (parseFloat(amount) > 100 && description.length > 3) {
        setIsCheckingImpact(true);
        const result = await checkTransactionImpact(parseFloat(amount), description, mockBalance, goals);
        setImpactAlert(result);
        setIsCheckingImpact(false);
      } else {
        setImpactAlert(null);
      }
    };
    
    const timer = setTimeout(checkImpact, 1000);
    return () => clearTimeout(timer);
  }, [amount, description]);

  const categories = ['Food', 'Transport', 'Shopping', 'Bills', 'Entertainment', 'Health', 'Other'];

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !user) return;

    try {
      await addDoc(collection(db, 'expenses'), {
        uid: user.uid,
        amount: parseFloat(amount),
        category,
        description,
        isImpulsive,
        date: serverTimestamp(),
        emotion: isImpulsive ? 'Impulsive' : 'Planned'
      });
      setAmount('');
      setDescription('');
      setIsImpulsive(false);
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'expenses', auth);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'expenses', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'expenses', auth);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <header className="flex justify-between items-center">
        <h2 className="text-3xl font-display font-bold">Smart Tracker</h2>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 bg-emerald-500 text-black rounded-full hover:bg-emerald-400 transition-colors shadow-lg shadow-emerald-500/20"
        >
          <Plus className={isAdding ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </header>

      <AnimatePresence>
        {isAdding && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleAddExpense} className="card space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="card-label">Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-text-s" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-black/50 border border-glass rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:border-accent transition-colors text-2xl font-bold"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="card-label">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors appearance-none"
                  >
                    {categories.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="card-label">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What was this for?"
                  className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors"
                />
              </div>

              {/* Regret Alert System */}
              <AnimatePresence>
                {(isCheckingImpact || impactAlert) && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className={`p-4 rounded-2xl border flex gap-4 items-start ${
                      isCheckingImpact ? 'bg-surface/50 border-glass' :
                      impactAlert?.severity === 'high' ? 'bg-danger/10 border-danger/30' :
                      impactAlert?.severity === 'medium' ? 'bg-amber-500/10 border-amber-500/30' :
                      'bg-accent/10 border-accent/30'
                    }`}>
                      <div className="mt-1">
                        {isCheckingImpact ? (
                          <Loader2 className="w-5 h-5 text-text-s animate-spin" />
                        ) : impactAlert?.severity === 'high' ? (
                          <AlertTriangle className="w-5 h-5 text-danger" />
                        ) : (
                          <BrainCircuit className="w-5 h-5 text-accent" />
                        )}
                      </div>
                      <div className="flex-1">
                        <p className={`text-xs font-bold uppercase tracking-widest mb-1 ${
                          isCheckingImpact ? 'text-text-s' :
                          impactAlert?.severity === 'high' ? 'text-danger' :
                          impactAlert?.severity === 'medium' ? 'text-amber-500' :
                          'text-accent'
                        }`}>
                          {isCheckingImpact ? "Time Travel Check..." : "Regret Alert Analysis"}
                        </p>
                        <p className="text-sm text-text-s leading-relaxed">
                          {isCheckingImpact ? "Analyzing historical impact and future trends..." : 
                           impactAlert?.alert || "This movement looks healthy for your current timeline."}
                        </p>
                        {!isCheckingImpact && impactAlert?.severity === 'high' && (
                          <p className="text-[10px] font-bold text-danger mt-2 uppercase italic">Caution Recommended</p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="flex items-center justify-between p-4 bg-black/30 rounded-2xl border border-glass">
                <div className="flex items-center gap-3">
                  <div className={isImpulsive ? "text-danger" : "text-accent"}>
                    {isImpulsive ? <Zap className="w-5 h-5" /> : <Smile className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">Impulsive Spending?</p>
                    <p className="text-xs text-text-s">Be honest, did you really need this?</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsImpulsive(!isImpulsive)}
                  className={`w-12 h-6 rounded-full transition-colors relative ${isImpulsive ? 'bg-danger' : 'bg-zinc-700'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${isImpulsive ? 'left-7' : 'left-1'}`} />
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-4 bg-accent text-bg font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-widest"
              >
                Add to Universe
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          Recent Movements
          <span className="text-[10px] font-bold text-text-s bg-surface px-2 py-1 rounded-full border border-glass uppercase tracking-widest">
            {expenses.length} total
          </span>
        </h3>
        
        <div className="space-y-3">
          {expenses.map((expense) => (
            <motion.div
              layout
              key={expense.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="card p-4 flex items-center justify-between group"
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl ${expense.isImpulsive ? 'bg-danger/10 text-danger' : 'bg-accent/10 text-accent'}`}>
                  <Tag className="w-5 h-5" />
                </div>
                <div>
                  <p className="font-bold">{expense.description || expense.category}</p>
                  <div className="flex items-center gap-2 text-xs text-text-s">
                    <Calendar className="w-3 h-3" />
                    {expense.date ? format(new Date(expense.date.seconds * 1000), 'MMM d, h:mm a') : 'Just now'}
                    <span className="px-1.5 py-0.5 bg-black/30 rounded text-[10px] uppercase tracking-tighter border border-glass">
                      {expense.category}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="font-bold text-lg">{formatCurrency(expense.amount)}</p>
                  {expense.isImpulsive && (
                    <p className="text-[10px] text-danger font-bold uppercase tracking-widest">Impulsive</p>
                  )}
                </div>
                <button
                  onClick={() => handleDelete(expense.id)}
                  className="opacity-0 group-hover:opacity-100 p-2 text-text-s hover:text-danger transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
          {expenses.length === 0 && (
            <div className="text-center py-24 card border-dashed border-2 border-glass">
              <p className="text-text-s">No expenses yet. Start your journey!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExpenseTracker;
