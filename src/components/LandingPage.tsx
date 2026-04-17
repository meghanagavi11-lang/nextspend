import React, { useRef } from 'react';
import { motion } from 'motion/react';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { ArrowRight, Sparkles, Shield, Zap, Globe, Briefcase, Brain } from 'lucide-react';
import Balatro from './Balatro';

const LandingPage = () => {
  const problemRef = useRef<HTMLDivElement>(null);

  const scrollToProblem = () => {
    problemRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-text-p overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative min-h-[100vh] flex flex-col items-center justify-center px-4 overflow-hidden pt-20">
        {/* Balatro Fluid Background */}
        <div className="absolute inset-0 z-0">
          <Balatro 
            spinRotation={-2} 
            spinSpeed={7.0} 
            contrast={3.5} 
            color1="#DE443B" 
            color2="#006BB4" 
            color3="#162325"
            className="w-full h-full opacity-90"
          />
        </div>
        
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Pulsing blobs removed to let fluid background shine */}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center z-10 max-w-4xl mx-auto"
        >
          <div className="mb-16 group cursor-default">
            <span className="text-xs font-black tracking-[2em] text-accent uppercase animate-pulse block mb-2 opacity-50">APPLICATION</span>
            <div className="flex items-center justify-center gap-1">
              <span className="text-4xl font-black tracking-[-0.1em] text-white">NEXT</span>
              <span className="text-4xl font-light tracking-[-0.05em] text-accent border-l border-white/20 pl-4 ml-2">SPEND</span>
            </div>
            <div className="w-24 h-[1px] bg-gradient-to-r from-transparent via-accent to-transparent mx-auto mt-4" />
          </div>

          <h1 className="mb-12 flex flex-col items-center">
            <span className="text-xl md:text-2xl font-extrabold tracking-[0.4em] opacity-80 uppercase text-white mb-4">DECIDE SMARTER.</span>
            <span className="text-[64px] md:text-[110px] font-black leading-[0.8] tracking-tighter uppercase text-white drop-shadow-[0_0_50px_rgba(255,255,255,0.3)] glow-text animate-pulse">SPEND<br className="md:hidden" /> BETTER.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-text-s max-w-2xl mx-auto mb-20 font-light leading-relaxed">
            AI-powered family finance. Centralize household data and eliminate decision fatigue for the entire family.
          </p>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="text-text-s text-[10px] uppercase tracking-[1em] animate-bounce cursor-pointer hover:text-white transition-colors mt-12"
            onClick={scrollToProblem}
          >
            Scroll to explore
          </motion.div>
        </motion.div>
      </section>

      {/* Storytelling Sections */}
      <section className="relative">
        {/* Chaos to Control - THE PROBLEM */}
        <div ref={problemRef} className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden">
          {/* Section Background Theme */}
          <div className="absolute inset-0 z-0 opacity-40">
            <Balatro 
              spinRotation={-1} 
              spinSpeed={0.5} 
              contrast={2} 
              color1="#DE443B" 
              color2="#006BB4" 
              color3="#050507"
              className="w-full h-full"
            />
          </div>
          
          <div className="relative z-10 grid md:grid-cols-2 gap-12 md:gap-24 items-center max-w-7xl mx-auto py-12 md:py-0">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="space-y-6"
            >
              <div className="offline-tag w-fit border-white/20 uppercase tracking-[0.3em]">The Problem</div>
              <h2 className="text-5xl md:text-7xl font-display font-extrabold leading-[0.85] uppercase">
                FINANCIAL COST IS THE GREATEST OLD WAY.
              </h2>
              <p className="text-text-s text-xl max-w-xl font-light">
                Fragmented family finances are the greatest cost. Don't let your household's wealth leak through unmanaged bills and subscriptions.
              </p>
            </motion.div>
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-2xl group bg-white/5">
               <img 
                 src="https://picsum.photos/seed/finance-clock-cartoon/1200/900" 
                 alt="Financial Chaos - Time and Money Cartoon Illustration" 
                 referrerPolicy="no-referrer"
                 className="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />
            </div>
          </div>
        </div>

        {/* AI Decision Engine - THE SOLUTION */}
        <div className="relative min-h-screen flex items-center justify-center px-4 overflow-hidden -mt-1">
          {/* Section Background Theme */}
          <div className="absolute inset-0 z-0 opacity-40 rotate-180">
            <Balatro 
              spinRotation={2} 
              spinSpeed={0.8} 
              contrast={2.5} 
              color1="#006BB4" 
              color2="#DE443B" 
              color3="#050507"
              className="w-full h-full"
            />
          </div>

          <div className="relative z-10 grid md:grid-cols-2 gap-12 md:gap-24 items-center max-w-7xl mx-auto py-12 md:py-0">
            <div className="order-2 md:order-1 relative aspect-[4/3] rounded-3xl overflow-hidden border border-accent/20 shadow-[0_0_60px_rgba(0,255,136,0.2)] group bg-accent/5">
               <img 
                 src="https://picsum.photos/seed/ai-hand-future/1200/900" 
                 alt="AI Decision Engine - Future Hand Interface" 
                 referrerPolicy="no-referrer"
                 className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            </div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="order-1 md:order-2 space-y-6"
            >
              <div className="offline-tag w-fit border-accent text-accent uppercase tracking-[0.3em]">The Solution</div>
              <h2 className="text-5xl md:text-7xl font-display font-extrabold leading-[0.85] uppercase">
                AI THAT THINKS FOR YOU.
              </h2>
              <p className="text-text-s text-xl max-w-xl font-light">
                Eliminate friction. Our AI Decision Engine centralizes family accounts and provides instant clarity on shared spending moves.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-24 border-t border-glass text-center">
        <p className="text-text-s uppercase tracking-[0.3em] text-[11px] mb-8">Ready to transform your finances?</p>
        <button
          onClick={handleLogin}
          className="px-16 py-8 bg-white text-black rounded-full font-black text-3xl hover:bg-accent hover:text-bg transition-all shadow-2xl"
        >
          JOIN NEXTSPEND
        </button>
      </footer>
    </div>
  );
};

export default LandingPage;

