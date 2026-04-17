import React, { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { Zap, Plus, Calendar, AlertCircle, CheckCircle2 } from 'lucide-react';
import { formatCurrency, OperationType, handleFirestoreError } from '../lib/utils';
import { format } from 'date-fns';

const BillManager = () => {
  const { bills, user } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [newBill, setNewBill] = useState({ name: '', amount: '', dueDate: '', category: 'Utility' });

  const handleAddBill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBill.name || !newBill.amount || !newBill.dueDate || !user) return;

    try {
      await addDoc(collection(db, 'bills'), {
        ...newBill,
        uid: user.uid,
        amount: parseFloat(newBill.amount),
        dueDate: new Date(newBill.dueDate),
        isPaid: false,
        createdAt: serverTimestamp()
      });
      setNewBill({ name: '', amount: '', dueDate: '', category: 'Utility' });
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'bills', auth);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-white">Bill Manager</h2>
          <p className="text-zinc-500">Track and manage your recurring utility and service bills.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 bg-accent text-bg rounded-full hover:scale-105 transition-transform shadow-lg shadow-accent/20"
        >
          <Plus className={isAdding ? "rotate-45 transition-transform" : "transition-transform"} />
        </button>
      </header>

      {isAdding && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="overflow-hidden"
        >
          <form onSubmit={handleAddBill} className="card p-8 space-y-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="card-label">Bill Name</label>
                <input
                  type="text"
                  value={newBill.name}
                  onChange={(e) => setNewBill({ ...newBill, name: e.target.value })}
                  placeholder="e.g. Electricity Bill"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-accent transition-colors text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="card-label">Amount</label>
                <input
                  type="number"
                  value={newBill.amount}
                  onChange={(e) => setNewBill({ ...newBill, amount: e.target.value })}
                  placeholder="0.00"
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-accent transition-colors text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="card-label">Due Date</label>
                <input
                  type="date"
                  value={newBill.dueDate}
                  onChange={(e) => setNewBill({ ...newBill, dueDate: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-accent transition-colors text-white"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="card-label">Category</label>
                <select
                  value={newBill.category}
                  onChange={(e) => setNewBill({ ...newBill, category: e.target.value })}
                  className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-accent transition-colors text-white"
                >
                  <option value="Utility">Utility</option>
                  <option value="Rent">Rent</option>
                  <option value="Internet">Internet</option>
                  <option value="Insurance">Insurance</option>
                  <option value="Credit Card">Credit Card</option>
                </select>
              </div>
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-accent text-bg font-bold rounded-2xl hover:brightness-110 transition-all"
            >
              Add Bill
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bills.map((bill) => (
          <motion.div
            key={bill.id}
            className="card p-8 space-y-6 group hover:border-accent/30 transition-all"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-accent/10 rounded-2xl">
                  <Zap className="w-8 h-8 text-accent" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">{bill.name}</h3>
                  <p className="text-zinc-500 text-sm">{bill.category}</p>
                </div>
              </div>
              <div className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${bill.isPaid ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-orange-500/10 text-orange-400 border border-orange-500/20'}`}>
                {bill.isPaid ? 'Paid' : 'Pending'}
              </div>
            </div>

            <div className="flex justify-between items-end">
              <div>
                <p className="card-label">Due Date</p>
                <div className="flex items-center gap-2 text-text-s mt-1">
                  <Calendar className="w-4 h-4" />
                  <span>{format(new Date(bill.dueDate.seconds * 1000), 'MMM dd, yyyy')}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="card-label">Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(bill.amount)}</p>
              </div>
            </div>

            {!bill.isPaid && (
              <button className="w-full py-3 bg-white/5 border border-white/10 rounded-xl font-bold text-sm hover:bg-white/10 transition-colors">
                Mark as Paid
              </button>
            )}
          </motion.div>
        ))}
        {bills.length === 0 && (
          <div className="md:col-span-2 text-center py-24 card border-dashed border-white/5 opacity-50">
            <p className="text-zinc-500">No active bills tracked.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default BillManager;
