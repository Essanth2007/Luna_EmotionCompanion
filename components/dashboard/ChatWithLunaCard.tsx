'use client';

import { motion } from 'framer-motion';
import { MessageCircle, Send, Sparkles } from 'lucide-react';
import GlassCard from '@/components/dashboard/GlassCard';
import { Button } from '@/components/ui/button';
import { chatPreview } from '@/components/dashboard/mock-data';

const ChatWithLunaCard = () => {
  return (
    <GlassCard delay={0.3} className="flex h-full flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-white/40">
            AI Companion
          </p>
          <h3 className="mt-1 text-lg font-semibold text-white">
            Chat with Luna
          </h3>
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/15">
          <MessageCircle className="h-5 w-5 text-blue-300" />
        </div>
      </div>

      <div className="mb-5 flex-1 space-y-4 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="mb-1 flex items-center gap-2">
              <span className="text-xs font-semibold text-white">Luna</span>
              <span className="text-[10px] text-white/35">
                {chatPreview.timestamp}
              </span>
            </div>
            <p className="text-sm leading-relaxed text-white/70">
              {chatPreview.lastMessage}
            </p>
          </div>
        </div>

        {chatPreview.lunaTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2 pl-12"
          >
            <div className="flex gap-1">
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  animate={{ y: [0, -4, 0] }}
                  transition={{
                    duration: 0.6,
                    repeat: Infinity,
                    delay: i * 0.15,
                  }}
                  className="h-1.5 w-1.5 rounded-full bg-violet-400"
                />
              ))}
            </div>
            <span className="text-xs text-white/40">Luna is typing...</span>
          </motion.div>
        )}
      </div>

      <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
        <Button className="w-full rounded-2xl bg-gradient-to-r from-blue-500 to-violet-600 py-5 text-white hover:opacity-90">
          <Send className="h-4 w-4" />
          Start Conversation
        </Button>
      </motion.div>
    </GlassCard>
  );
};

export default ChatWithLunaCard;
