import React, { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { collection, addDoc, serverTimestamp, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion, AnimatePresence } from 'motion/react';
import { Target, Plus, Lock, Unlock, TrendingUp, ChevronRight } from 'lucide-react';
import { formatCurrency, OperationType, handleFirestoreError, cn } from '../lib/utils';

const Goals = () => {
  const { goals, user } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const [target, setTarget] = useState('');

  const handleAddGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !target || !user) return;

    try {
      await addDoc(collection(db, 'goals'), {
        uid: user.uid,
        title,
        targetAmount: parseFloat(target),
        currentAmount: 0,
        isLocked: false,
        createdAt: serverTimestamp()
      });
      setTitle('');
      setTarget('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'goals', auth);
    }
  };

  const toggleLock = async (goalId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'goals', goalId), {
        isLocked: !currentStatus
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'goals', auth);
    }
  };

  return (
    <div className="space-y-12 max-w-5xl mx-auto py-10">
      <header className="flex justify-between items-end">
        <div>
          <h2 className="massive-title text-6xl">Savings Goals</h2>
          <p className="text-text-s mt-2">Lock your future, one goal at a time.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="w-14 h-14 bg-accent text-bg rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,255,136,0.3)]"
        >
          <Plus className={cn("w-8 h-8 transition-transform", isAdding && "rotate-45")} />
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
            <form onSubmit={handleAddGoal} className="card space-y-6 mb-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="card-label">Goal Title</label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. New iPhone, Vacation"
                    className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-6 focus:outline-none focus:border-accent transition-colors"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="card-label">Target Amount</label>
                  <input
                    type="number"
                    value={target}
                    onChange={(e) => setTarget(e.target.value)}
                    placeholder="₹0.00"
                    className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-6 focus:outline-none focus:border-accent transition-colors text-xl font-bold"
                    required
                  />
                </div>
              </div>
              <button
                type="submit"
                className="w-full py-4 bg-accent text-bg font-black rounded-2xl hover:scale-[1.02] transition-all uppercase tracking-widest"
              >
                Create Goal
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((goal) => {
          const progress = (goal.currentAmount / goal.targetAmount) * 100;
          return (
            <motion.div
              layout
              key={goal.id}
              className="card relative overflow-hidden group"
            >
              <div className="absolute top-0 right-0 p-6">
                <button
                  onClick={() => toggleLock(goal.id, goal.isLocked)}
                  className={cn(
                    "p-3 rounded-2xl transition-all",
                    goal.isLocked ? 'bg-accent/20 text-accent' : 'bg-zinc-800 text-zinc-500 hover:text-white'
                  )}
                >
                  {goal.isLocked ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
                </button>
              </div>

              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="p-4 bg-accent/10 rounded-2xl">
                    <Target className="w-8 h-8 text-accent" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold">{goal.title}</h3>
                    <p className="text-text-s text-sm">Target: {formatCurrency(goal.targetAmount)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-text-s">Progress</span>
                    <span className="font-bold text-accent">{Math.round(progress)}%</span>
                  </div>
                  <div className="h-3 bg-black/50 rounded-full overflow-hidden border border-glass">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      className="h-full bg-accent shadow-[0_0_15px_rgba(0,255,136,0.5)]"
                    />
                  </div>
                </div>

                <div className="flex justify-between items-end pt-4">
                  <div>
                    <p className="card-label mb-1">Saved So Far</p>
                    <p className="stat-value text-3xl">{formatCurrency(goal.currentAmount)}</p>
                  </div>
                  <button className="flex items-center gap-2 text-accent font-bold hover:gap-3 transition-all text-sm uppercase tracking-widest">
                    Add Funds <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {goal.isLocked && (
                <div className="absolute inset-0 bg-bg/60 backdrop-blur-[2px] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="text-center space-y-2">
                    <Lock className="w-12 h-12 text-accent mx-auto" />
                    <p className="font-bold text-accent uppercase tracking-widest text-xs">Funds Locked</p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
        {goals.length === 0 && (
          <div className="md:col-span-2 text-center py-32 card border-dashed border-2 border-glass">
            <p className="text-text-s">No goals yet. What are you saving for?</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals;
