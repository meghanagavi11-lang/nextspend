import React, { useState } from 'react';
import { useFirebase } from './FirebaseProvider';
import { collection, addDoc, serverTimestamp, arrayUnion, updateDoc, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { motion } from 'motion/react';
import { Users, Plus, UserPlus, ArrowRight, Share2 } from 'lucide-react';
import { formatCurrency, OperationType, handleFirestoreError, cn } from '../lib/utils';

const FamilyManager = () => {
  const { familyGroups, user } = useFirebase();
  const [isAdding, setIsAdding] = useState(false);
  const [groupName, setGroupName] = useState('');

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!groupName || !user) return;

    try {
      await addDoc(collection(db, 'familyGroups'), {
        name: groupName,
        memberUids: [user.uid],
        members: [{ uid: user.uid, role: 'admin' }],
        createdBy: user.uid,
        createdAt: serverTimestamp()
      });
      setGroupName('');
      setIsAdding(false);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'familyGroups', auth);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <header className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-display font-bold">Family Finance</h2>
          <p className="text-zinc-500">Enable collaboration between family members.</p>
        </div>
        <button
          onClick={() => setIsAdding(!isAdding)}
          className="p-3 bg-purple-500 text-white rounded-full hover:bg-purple-400 transition-colors shadow-lg shadow-purple-500/20"
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
          <form onSubmit={handleCreateGroup} className="glass p-8 rounded-3xl space-y-6 mb-8">
            <div className="space-y-2">
              <label className="text-xs uppercase tracking-widest text-zinc-500">Group Name</label>
              <input
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Family, Roommates, Trip to Goa"
                className="w-full bg-black/50 border border-white/10 rounded-2xl py-4 px-6 focus:outline-none focus:border-purple-500 transition-colors"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full py-4 bg-purple-500 text-white font-bold rounded-2xl hover:bg-purple-400 transition-colors"
            >
              Create Group
            </button>
          </form>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {familyGroups.map((group) => (
          <motion.div
            key={group.id}
            className="card p-8 space-y-6 group"
          >
            <div className="flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className="p-4 bg-purple-500/10 rounded-2xl">
                  <Users className="w-8 h-8 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{group.name}</h3>
                  <p className="text-zinc-500 text-sm">{group.members.length} members</p>
                </div>
              </div>
              <button className="p-2 text-zinc-500 hover:text-purple-400 transition-colors">
                <Share2 className="w-5 h-5" />
              </button>
            </div>

            <div className="flex -space-x-3">
              {group.members.map((member: any, i: number) => (
                <div 
                  key={member.uid} 
                  className={cn(
                    "w-10 h-10 rounded-full bg-zinc-800 border-2 border-black flex items-center justify-center text-[10px] font-bold uppercase",
                    member.role === 'admin' ? "border-purple-500" : "border-black"
                  )}
                  title={`${member.uid} (${member.role})`}
                >
                  {member.role.charAt(0)}
                </div>
              ))}
              <button className="w-10 h-10 rounded-full bg-purple-500/20 border-2 border-dashed border-purple-500/40 flex items-center justify-center text-purple-400 hover:bg-purple-500/30 transition-colors">
                <UserPlus className="w-4 h-4" />
              </button>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center">
              <div>
                <p className="card-label">Shared Wallet Balance</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(0)}</p>
              </div>
              <button className="flex items-center gap-2 text-purple-400 font-bold hover:gap-3 transition-all">
                View Details <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        ))}
        {familyGroups.length === 0 && (
          <div className="md:col-span-2 text-center py-32 card border-dashed border-white/5 opacity-50">
            <p className="text-zinc-500">No family groups yet. Centralize your family data!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyManager;
