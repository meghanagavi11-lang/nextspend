import React, { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { motion, AnimatePresence } from 'motion/react';
import { TrendingUp, TrendingDown, Plus, Trash2, Edit3, PieChart, DollarSign, Briefcase } from 'lucide-react';
import { collection, addDoc, serverTimestamp, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { formatCurrency, OperationType, handleFirestoreError, cn } from '../lib/utils';

const Investments = () => {
  const { investments, user } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    type: 'stock',
    quantity: '',
    costBasis: '',
    currentPrice: ''
  });

  const totalValue = investments.reduce((acc, inv) => acc + (inv.quantity * (inv.currentPrice || inv.costBasis)), 0);
  const totalCost = investments.reduce((acc, inv) => acc + (inv.quantity * inv.costBasis), 0);
  const totalGain = totalValue - totalCost;
  const totalGainPercent = totalCost > 0 ? (totalGain / totalCost) * 100 : 0;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !formData.name || !formData.quantity || !formData.costBasis) return;

    try {
      await addDoc(collection(db, 'investments'), {
        uid: user.uid,
        name: formData.name,
        type: formData.type,
        quantity: parseFloat(formData.quantity),
        costBasis: parseFloat(formData.costBasis),
        currentPrice: formData.currentPrice ? parseFloat(formData.currentPrice) : parseFloat(formData.costBasis),
        purchaseDate: serverTimestamp(),
        lastUpdated: serverTimestamp()
      });
      setIsAdding(false);
      setFormData({ name: '', type: 'stock', quantity: '', costBasis: '', currentPrice: '' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'investments', auth);
    }
  };

  const handleUpdatePrice = async (id: string, newPrice: string) => {
    if (!newPrice) return;
    try {
      await updateDoc(doc(db, 'investments', id), {
        currentPrice: parseFloat(newPrice),
        lastUpdated: serverTimestamp()
      });
      setEditingId(null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, 'investments', auth);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'investments', id));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, 'investments', auth);
    }
  };

  return (
    <div className="space-y-12 py-10 max-w-6xl mx-auto">
      <header className="flex justify-between items-end">
        <div>
          <h1 className="massive-title text-6xl">The Vault</h1>
          <p className="text-text-s mt-2">Track your wealth and market movements.</p>
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="w-14 h-14 bg-accent text-bg rounded-full flex items-center justify-center hover:scale-110 transition-transform shadow-[0_0_20px_rgba(0,255,136,0.3)]"
        >
          <Plus className="w-8 h-8" />
        </button>
      </header>

      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card flex flex-col justify-center bg-gradient-to-br from-surface to-black">
          <span className="card-label">Total Portfolio</span>
          <div className="stat-value">{formatCurrency(totalValue)}</div>
          <div className={cn("flex items-center gap-1 mt-2 text-sm font-bold", totalGain >= 0 ? "text-accent" : "text-danger")}>
            {totalGain >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
            {formatCurrency(Math.abs(totalGain))} ({totalGainPercent.toFixed(2)}%)
          </div>
        </div>
        
        <div className="card">
          <span className="card-label">Asset Allocation</span>
          <div className="flex gap-2 mt-2">
            {['stock', 'bond', 'crypto', 'real-estate'].map(type => {
              const count = investments.filter(inv => inv.type === type).length;
              if (count === 0) return null;
              return (
                <div key={type} className="px-3 py-1 bg-white/5 rounded-full border border-glass text-[10px] uppercase font-bold text-text-s">
                  {type}: {count}
                </div>
              );
            })}
          </div>
        </div>

        <div className="card bg-accent/5 border-accent/20">
          <span className="card-label">AI Wisdom</span>
          <p className="text-sm italic text-accent/80">
            "Your portfolio is {totalGainPercent > 0 ? 'performing well' : 'facing headwinds'}. Consider {totalGainPercent < 0 ? 'rebalancing' : 'diversifying'} to maintain long-term orbital stability."
          </p>
        </div>
      </div>

      {/* Holdings List */}
      <div className="space-y-4">
        <h3 className="card-label px-2">Current Holdings</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {investments.map((inv) => {
            const currentVal = inv.quantity * (inv.currentPrice || inv.costBasis);
            const costVal = inv.quantity * inv.costBasis;
            const itemGain = currentVal - costVal;
            const itemGainPercent = (itemGain / costVal) * 100;
            
            return (
              <motion.div
                layout
                key={inv.id}
                className="card flex flex-col gap-4 group"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/5 rounded-xl border border-glass">
                      <Briefcase className="w-5 h-5 text-accent" />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg">{inv.name}</h4>
                      <p className="text-xs text-text-s uppercase tracking-widest">{inv.type} • {inv.quantity} units</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setEditingId(editingId === inv.id ? null : inv.id)}
                      className="p-2 text-text-s hover:text-accent transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDelete(inv.id)}
                      className="p-2 text-text-s hover:text-danger transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[10px] uppercase text-text-s tracking-tighter">Current Value</span>
                    <div className="text-xl font-bold">{formatCurrency(currentVal)}</div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] uppercase text-text-s tracking-tighter">Performance</span>
                    <div className={cn("text-xl font-bold", itemGain >= 0 ? "text-accent" : "text-danger")}>
                      {itemGain >= 0 ? '+' : ''}{itemGainPercent.toFixed(2)}%
                    </div>
                  </div>
                </div>

                <AnimatePresence>
                  {editingId === inv.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden pt-4 border-t border-glass"
                    >
                      <div className="flex items-center gap-4">
                        <div className="flex-1">
                          <label className="text-[10px] uppercase text-text-s block mb-1">Update Current Price</label>
                          <input
                            type="number"
                            placeholder="New Price"
                            className="w-full bg-black/50 border border-glass rounded-xl px-4 py-2 focus:outline-none focus:border-accent text-sm"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') handleUpdatePrice(inv.id, (e.target as HTMLInputElement).value);
                            }}
                          />
                        </div>
                        <button 
                          onClick={() => {
                            const input = document.querySelector(`input[placeholder="New Price"]`) as HTMLInputElement;
                            handleUpdatePrice(inv.id, input.value);
                          }}
                          className="mt-5 px-4 py-2 bg-accent text-bg rounded-xl font-bold text-xs"
                        >
                          Save
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
          
          {investments.length === 0 && (
            <div className="lg:col-span-2 card border-dashed border-2 border-glass py-24 text-center">
              <p className="text-text-s">Your vault is empty. Deposit your first asset to track growth.</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="card w-full max-w-md space-y-8"
            >
              <h2 className="text-3xl font-bold">New Holding</h2>
              
              <form onSubmit={handleAdd} className="space-y-6">
                <div className="space-y-2">
                  <label className="card-label">Asset Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., Apple stock, BTC, Corporate Bond"
                    className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="card-label">Asset Type</label>
                    <select
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors appearance-none"
                    >
                      <option value="stock">Stock</option>
                      <option value="bond">Bond</option>
                      <option value="crypto">Crypto</option>
                      <option value="real-estate">Real Estate</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="card-label">Quantity</label>
                    <input
                      type="number"
                      step="any"
                      value={formData.quantity}
                      onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                      placeholder="0.0"
                      className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="card-label">Cost Basis (Per unit)</label>
                    <input
                      type="number"
                      value={formData.costBasis}
                      onChange={(e) => setFormData({ ...formData, costBasis: e.target.value })}
                      placeholder="Entry Price"
                      className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors font-bold"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="card-label">Current Price (Optional)</label>
                    <input
                      type="number"
                      value={formData.currentPrice}
                      onChange={(e) => setFormData({ ...formData, currentPrice: e.target.value })}
                      placeholder="Live Price"
                      className="w-full bg-black/50 border border-glass rounded-2xl py-4 px-4 focus:outline-none focus:border-accent transition-colors font-bold"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 py-4 bg-zinc-800 text-white font-bold rounded-2xl hover:bg-zinc-700 transition-all"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-4 bg-accent text-bg font-black rounded-2xl hover:scale-105 transition-all uppercase tracking-widest"
                  >
                    Deposit
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Investments;
