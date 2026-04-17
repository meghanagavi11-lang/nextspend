import React from 'react';
import { LayoutDashboard, Receipt, MessageSquare, Target, Users, LogOut, Mic, Briefcase, Zap, Globe } from 'lucide-react';
import { auth } from '../firebase';
import { cn } from '../lib/utils';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Navbar: React.FC<NavbarProps> = ({ activeTab, setActiveTab }) => {
  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Home' },
    { id: 'actions', icon: MessageSquare, label: 'Actions' },
    { id: 'expenses', icon: Receipt, label: 'Expenses' },
    { id: 'bills', icon: Zap, label: 'Bills' },
    { id: 'subscriptions', icon: Globe, label: 'Subscriptions' },
    { id: 'family', icon: Users, label: 'Family' },
    { id: 'goals', icon: Target, label: 'Goals' },
  ];

  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 w-full max-w-5xl px-4">
      <div className="flex items-center justify-between bg-surface/90 backdrop-blur-2xl border border-white/5 p-4 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "pill whitespace-nowrap",
                activeTab === item.id && "pill-active"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('actions')}
            className="w-12 h-12 rounded-full bg-accent text-bg flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_rgba(0,255,136,0.3)]"
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={() => auth.signOut()}
            className="text-text-s hover:text-danger transition-colors p-2"
          >
            <LogOut className="w-6 h-6" />
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

