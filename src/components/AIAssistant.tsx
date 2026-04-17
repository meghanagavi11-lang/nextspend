import React, { useState, useRef, useEffect } from 'react';
import { useFirebase } from './FirebaseProvider';
import { motion, AnimatePresence } from 'motion/react';
import { Send, Mic, Sparkles, User, Bot, Loader2 } from 'lucide-react';
import { getFinancialAdvice } from '../lib/gemini';
import ReactMarkdown from 'react-markdown';
import { cn } from '../lib/utils';

const AIAssistant = () => {
  const { expenses, goals, bills, subscriptions } = useFirebase();
  const [messages, setMessages] = useState<{ role: 'user' | 'assistant', content: string }[]>([
    { role: 'assistant', content: "Hello! I'm your Family Finance AI. I've analyzed your household data. Here are my current recommendations." }
  ]);

  const recommendations = [
    { id: 1, title: 'Pay Electricity Bill', description: 'Due in 2 days (₹1,200). Avoid late fees.', type: 'bill' },
    { id: 2, title: 'Cancel Inactive Service', description: 'Detect low usage on "Yoga Stream AI". Save ₹999/mo.', type: 'subscription' },
    { id: 3, title: 'Savings Opportunity', description: 'Transfer ₹5,000 to "Dream Home" goal based on current cash flow.', type: 'savings' },
  ];

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    const advice = await getFinancialAdvice(expenses, goals, userMessage);
    setMessages(prev => [...prev, { role: 'assistant', content: advice || "I'm sorry, I couldn't process that." }]);
    setIsLoading(false);
  };

  const toggleVoice = () => {
    setIsListening(!isListening);
    if (!isListening) {
      // In a real app, we'd use SpeechRecognition API
      // For now, we simulate listening
      setTimeout(() => {
        setIsListening(false);
        setInput("Can I afford a new iPhone?");
      }, 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-14rem)] flex flex-col pt-4 pb-2">
      {/* Header */}
      <header className="mb-8">
        <h2 className="massive-title text-6xl">Assistant</h2>
        <p className="text-text-s mt-2">AI-powered financial guidance in real-time.</p>
      </header>

      {/* Recommendations / Next Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {recommendations.map(rec => (
          <motion.div
            key={rec.id}
            whileHover={{ y: -5 }}
            className="card p-6 border-accent/20 cursor-pointer overflow-hidden"
          >
            <div className="flex items-center gap-2 text-accent mb-2">
              <Sparkles className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Next Action</span>
            </div>
            <h4 className="font-bold text-sm mb-1">{rec.title}</h4>
            <p className="text-xs text-text-s line-clamp-2 leading-relaxed">{rec.description}</p>
          </motion.div>
        ))}
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-6 pr-4 no-scrollbar mb-6">
        {messages.map((msg, i) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={i}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={cn(
              "max-w-[80%] p-6 rounded-[24px] text-sm leading-relaxed",
              msg.role === 'user' 
                ? "bg-accent text-bg font-bold shadow-[0_0_20px_rgba(0,255,136,0.2)]" 
                : "card"
            )}>
              <div className="prose prose-invert prose-sm max-w-none">
                <ReactMarkdown>{msg.content}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="card p-6 flex items-center gap-3">
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-100" />
              <div className="w-2 h-2 bg-accent rounded-full animate-bounce delay-200" />
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="relative pb-6">
        <div className="absolute inset-0 bg-accent/5 blur-3xl -z-10" />
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSend()}
          placeholder={isListening ? "Listening..." : "Ask your Family AI anything..."}
          className="w-full bg-surface/80 backdrop-blur-xl border border-white/5 rounded-[32px] py-6 pl-8 pr-24 focus:outline-none focus:border-accent transition-all text-lg shadow-[0_20px_50px_rgba(0,0,0,0.3)]"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <button
            onClick={toggleVoice}
            className={cn(
              "p-3 transition-colors",
              isListening ? "text-danger animate-pulse" : "text-text-s hover:text-accent"
            )}
          >
            <Mic className="w-6 h-6" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="p-3 bg-accent text-bg rounded-full disabled:opacity-50 disabled:cursor-not-allowed hover:scale-110 transition-transform"
          >
            <Send className="w-6 h-6" />
          </button>
        </div>
      </div>
      <p className="text-[10px] text-center text-text-s mt-4 uppercase tracking-[0.2em]">
        Powered by Gemini AI Decision Engine
      </p>
    </div>
  );
};

export default AIAssistant;
