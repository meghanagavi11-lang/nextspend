/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { FirebaseProvider, useFirebase } from './components/FirebaseProvider';
import { ErrorBoundary } from './components/ErrorBoundary';
import LandingPage from './components/LandingPage';
import Dashboard from './components/Dashboard';
import ExpenseTracker from './components/ExpenseTracker';
import AIAssistant from './components/AIAssistant';
import Goals from './components/Goals';
import FamilyManager from './components/FamilyManager';
import BillManager from './components/BillManager';
import SubscriptionManager from './components/SubscriptionManager';
import Investments from './components/Investments';
import Navbar from './components/Navbar';
import AuroraBackground from './components/AuroraBackground';
import { motion, AnimatePresence } from 'motion/react';

function AppContent() {
  const { user, loading } = useFirebase();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-white font-display text-4xl font-bold tracking-tighter"
        >
          NEXTSPEND
        </motion.div>
      </div>
    );
  }

  if (!user) {
    return <LandingPage />;
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'actions': return <AIAssistant />;
      case 'expenses': return <ExpenseTracker />;
      case 'bills': return <BillManager />;
      case 'subscriptions': return <SubscriptionManager />;
      case 'family': return <FamilyManager />;
      case 'goals': return <Goals />;
      case 'investments': return <Investments />;
      default: return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen text-white font-sans selection:bg-emerald-500/30 relative">
      <AuroraBackground />
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="pb-4 pt-32 px-4 max-w-7xl mx-auto relative z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <FirebaseProvider>
        <AppContent />
      </FirebaseProvider>
    </ErrorBoundary>
  );
}

