'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Smile, History, PlusCircle, Sparkles } from 'lucide-react';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { LunaAvatar } from '@/components/common/LunaAvatar';
import { GlassCard } from '@/components/common/GlassCard';
import { Button } from '@/components/ui/button';
import { chatService, type ChatMessage } from '@/services/chat';

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hello! I'm Luna, your AI emotional companion. How are you feeling today? 🌙",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  useEffect(() => {
    chatService.getSuggestedPrompts().then((r) => {
      if (r.data) setSuggestedPrompts(r.data.slice(0, 4).map((p) => p.text));
    });
  }, []);

  const handleSendMessage = async (message: string) => {
    if (!message.trim()) return;
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputMessage('');
    setIsTyping(true);
    const response = await chatService.sendMessage({ message });
    setIsTyping(false);
    if (response.data) setMessages((prev) => [...prev, response.data as ChatMessage]);
  };

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-7rem)] gap-4">

        {/* ── Messages panel ── */}
        <div className="flex flex-1 flex-col gap-3 overflow-hidden">
          {/* Header */}
          <GlassCard className="flex items-center gap-3 px-5 py-3.5" hover={false}>
            <LunaAvatar state="listening" size="md" showRing />
            <div>
              <h2 className="text-sm font-bold text-white">Luna</h2>
              <div className="flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[11px] text-white/40">Online · AI Companion</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-1">
              <motion.button whileTap={{ scale: 0.9 }} className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition-colors">
                <History className="h-4 w-4" />
              </motion.button>
              <motion.button whileTap={{ scale: 0.9 }} className="flex h-8 w-8 items-center justify-center rounded-xl text-white/40 hover:bg-white/[0.08] hover:text-white/70 transition-colors">
                <PlusCircle className="h-4 w-4" />
              </motion.button>
            </div>
          </GlassCard>

          {/* Messages */}
          <GlassCard className="flex flex-1 flex-col overflow-hidden p-0" hover={false}>
            <div className="flex-1 overflow-y-auto px-5 py-5 space-y-4 custom-scroll">
              <AnimatePresence initial={false}>
                {messages.map((msg) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 12, scale: 0.97 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    {msg.role === 'assistant' && (
                      <LunaAvatar state="listening" size="sm" showRing={false} animate={false} />
                    )}
                    <div className={`max-w-[72%] rounded-2xl px-4 py-3 shadow-lg ${
                      msg.role === 'user'
                        ? 'bg-gradient-to-br from-violet-600 to-blue-600 text-white rounded-br-sm shadow-violet-500/20'
                        : 'border border-white/[0.08] bg-white/[0.05] text-white/85 rounded-bl-sm backdrop-blur-md'
                    }`}>
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <p className="mt-1.5 text-[10px] opacity-45">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    {msg.role === 'user' && (
                      <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500/40 to-blue-500/40 text-xs font-bold text-violet-200 ring-1 ring-violet-500/30">
                        D
                      </div>
                    )}
                  </motion.div>
                ))}

                {/* Typing indicator */}
                {isTyping && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="flex items-end gap-3"
                  >
                    <LunaAvatar state="thinking" size="sm" showRing={false} animate={false} />
                    <div className="flex items-center gap-1.5 rounded-2xl rounded-bl-sm border border-white/[0.08] bg-white/[0.05] px-4 py-3 backdrop-blur-md">
                      {[0, 0.2, 0.4].map((delay) => (
                        <motion.div
                          key={delay}
                          animate={{ scale: [1, 1.4, 1], opacity: [0.4, 1, 0.4] }}
                          transition={{ repeat: Infinity, duration: 0.9, delay }}
                          className="h-2 w-2 rounded-full bg-violet-400"
                        />
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t border-white/[0.07] px-4 py-3">
              <div className="flex items-center gap-2 rounded-2xl border border-white/[0.1] bg-white/[0.04] px-3 py-2 focus-within:border-violet-500/40 focus-within:ring-2 focus-within:ring-violet-500/10 transition-all">
                <input
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(inputMessage);
                    }
                  }}
                  placeholder="Message Luna…"
                  className="flex-1 bg-transparent text-sm text-white placeholder:text-white/30 outline-none"
                />
                <div className="flex items-center gap-1">
                  <button className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-colors">
                    <Smile className="h-4 w-4" />
                  </button>
                  <button className="flex h-8 w-8 items-center justify-center rounded-xl text-white/30 hover:bg-white/[0.08] hover:text-white/60 transition-colors">
                    <Mic className="h-4 w-4" />
                  </button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.92 }}
                    onClick={() => handleSendMessage(inputMessage)}
                    disabled={!inputMessage.trim() || isTyping}
                    className="btn-glow flex h-8 w-8 items-center justify-center rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Send className="h-3.5 w-3.5 text-white" />
                  </motion.button>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>

        {/* ── Sidebar ── */}
        <div className="hidden w-72 flex-col gap-3 lg:flex">
          {/* Luna status */}
          <GlassCard className="p-5 text-center" hover={false}>
            <LunaAvatar state="happy" size="lg" float showRing className="mx-auto mb-3" />
            <h3 className="text-sm font-bold text-white">Luna AI</h3>
            <p className="mt-1 text-[11px] text-white/45 leading-relaxed">
              I'm here to listen and support you on your emotional wellness journey.
            </p>
          </GlassCard>

          {/* Suggested prompts */}
          <GlassCard className="flex-1 p-5" hover={false}>
            <div className="mb-3 flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-violet-400" />
              <h3 className="text-xs font-semibold text-white/70 uppercase tracking-widest">Suggestions</h3>
            </div>
            <div className="space-y-2">
              {suggestedPrompts.map((prompt, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ x: 3 }}
                  onClick={() => handleSendMessage(prompt)}
                  className="w-full rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-left text-xs text-white/60 hover:border-violet-500/30 hover:bg-violet-500/10 hover:text-white/80 transition-all"
                >
                  {prompt}
                </motion.button>
              ))}
            </div>

            <div className="mt-4 border-t border-white/[0.07] pt-4 space-y-2">
              <h3 className="mb-2 text-xs font-semibold text-white/40 uppercase tracking-widest">Quick Actions</h3>
              {[
                { label: 'View History', icon: History },
                { label: 'New Conversation', icon: PlusCircle },
              ].map(({ label, icon: Icon }) => (
                <button key={label} className="flex w-full items-center gap-2 rounded-xl border border-white/[0.07] bg-white/[0.03] px-3 py-2.5 text-xs text-white/50 hover:bg-white/[0.07] hover:text-white/80 transition-colors">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>
          </GlassCard>
        </div>

      </div>
    </DashboardLayout>
  );
}
