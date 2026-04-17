import React, { useMemo } from 'react';
import { useFirebase } from './FirebaseProvider';
import { motion } from 'motion/react';
import { TrendingUp, TrendingDown, Wallet, Zap, AlertCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { formatCurrency } from '../lib/utils';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip } from 'recharts';
import { format, subDays, isSameDay } from 'date-fns';
import PredictiveInsights from './PredictiveInsights';

const Dashboard = () => {
  const { expenses, goals, user, subscriptions, bills } = useFirebase();

  const notifications = [
    { id: 1, title: 'Bill Reminder', message: 'Electricity bill due in 2 days.', type: 'alert' },
    { id: 2, title: 'Overspending', message: 'You have exceeded your "Dining" limit this week.', type: 'warning' },
    { id: 3, title: 'Goal Update', message: 'You are 85% closer to your "Dream Home" goal!', type: 'success' },
  ];

  const stats = useMemo(() => {
    const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
    const monthlySpent = expenses
      .filter(e => new Date(e.date.seconds * 1000) > subDays(new Date(), 30))
      .reduce((acc, curr) => acc + curr.amount, 0);
    
    const chartData = Array.from({ length: 7 }).map((_, i) => {
      const date = subDays(new Date(), 6 - i);
      const dayAmount = expenses
        .filter(e => isSameDay(new Date(e.date.seconds * 1000), date))
        .reduce((acc, curr) => acc + curr.amount, 0);
      return {
        name: format(date, 'EEE'),
        amount: dayAmount
      };
    });

    return { totalSpent, monthlySpent, chartData };
  }, [expenses]);

  const healthScore = useMemo(() => {
    if (expenses.length === 0) return 84; // Default for demo
    const impulsiveCount = expenses.filter(e => e.isImpulsive).length;
    const score = Math.max(0, 100 - (impulsiveCount * 10) - (stats.monthlySpent / 1000));
    return Math.round(score);
  }, [expenses, stats.monthlySpent]);

  return (
    <div className="space-y-12 py-10">
      {/* Header */}
      <header className="flex justify-between items-end">
        <div className="logo flex items-center gap-2 text-2xl font-extrabold tracking-tighter">
          <div className="w-3 h-3 bg-accent rounded-sm" />
          NEXTSPEND
        </div>
        <div className="offline-tag">Offline Ready • Local Data Encrypted</div>
      </header>

      {/* Hero Section */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-10">
        <div>
          <h1 className="massive-title">
            Your Next<br />Money Move.
          </h1>
          <p className="text-accent text-xl font-medium mt-4">
            AI Suggestion: "You can spend ₹800 today safely."
          </p>
        </div>
        <div className="card flex flex-col justify-center bg-gradient-to-br from-surface to-black">
          <span className="card-label">Predictive Timeline</span>
          <div className="stat-value">Steady</div>
          <p className="stat-sub">Projected {formatCurrency(34200)} balance by end of month.</p>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 md:grid-cols-[320px_1fr_280px] gap-6">
        {/* Notifications System */}
        <div className="card h-full flex flex-col">
          <span className="card-label mb-6">Family Activity</span>
          <div className="space-y-4 flex-1">
            {notifications.map(notif => (
              <div key={notif.id} className="p-4 bg-white/5 border border-white/5 rounded-2xl flex gap-3 items-start">
                <div className={`w-2 h-2 mt-1.5 rounded-full shrink-0 ${notif.type === 'alert' ? 'bg-danger' : notif.type === 'warning' ? 'bg-orange-400' : 'bg-accent'}`} />
                <div>
                  <h5 className="text-[10px] font-black uppercase tracking-widest text-text-s">{notif.title}</h5>
                  <p className="text-xs text-white leading-tight mt-1">{notif.message}</p>
                </div>
              </div>
            ))}
          </div>
          <button className="mt-6 text-[10px] text-accent font-black uppercase tracking-widest hover:gap-2 transition-all flex items-center">
            View All Activity <ChevronRight className="w-3 h-3" />
          </button>
        </div>

        {/* Health Orb */}
        <div className="flex items-center justify-center">
          <div className="health-orb-container">
            <div className="orb-glow" />
            <div className="orb-ring">
              <div className="orb-value">{healthScore}</div>
            </div>
            <div className="absolute bottom-4 card-label">Family Health Score</div>
          </div>
        </div>

        {/* Upcoming Bills Tracker */}
        <div className="card bg-accent/5 border-accent/20">
          <span className="card-label">Upcoming Bills</span>
          <div className="stat-value text-accent">{bills.filter(b => !b.isPaid).length}</div>
          <p className="stat-sub">Bills due within the next 7 days.</p>
          
          <ul className="mt-4 space-y-3">
            {bills.length > 0 ? bills.slice(0, 3).map((bill, i) => (
              <li key={i} className="flex justify-between py-2 border-b border-glass text-xs">
                <span>{bill.name}</span>
                <span>{formatCurrency(bill.amount)}</span>
              </li>
            )) : (
              <>
                <li className="flex justify-between py-2 border-b border-glass text-xs">
                  <span>Electricity</span>
                  <span>₹1,200</span>
                </li>
                <li className="flex justify-between py-2 border-b border-glass text-xs">
                  <span>Rent</span>
                  <span>₹15,000</span>
                </li>
              </>
            )}
          </ul>
        </div>
      </div>

      <PredictiveInsights />

      {/* Chart Section (Preserved Functionality with Theme Styling) */}
      <div className="card">
        <span className="card-label">Spending Orbit</span>
        <div className="h-[300px] w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={stats.chartData}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00FF88" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#00FF88" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" stroke="#8E9299" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="#8E9299" fontSize={11} tickLine={false} axisLine={false} hide />
              <Tooltip 
                contentStyle={{ backgroundColor: '#121216', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '12px' }}
                itemStyle={{ color: '#00FF88' }}
              />
              <Area type="monotone" dataKey="amount" stroke="#00FF88" strokeWidth={3} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

