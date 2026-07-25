"use client"

import { motion } from "framer-motion"
import HeroButtons from "@/components/landing/HeroButtons"
import { Brain, Heart, Activity } from "lucide-react"

export default function Hero() {
  return (
    <section className="container-custom section-padding">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold leading-tight">
            Understand Your Emotions with AI
          </h1>
          <p className="text-muted-foreground max-w-xl">
            Luna Emotion Companion helps users understand, track, and improve
            emotional well-being using AI-powered emotion intelligence.
          </p>

          <HeroButtons />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="flex justify-center"
        >
          <div className="glass w-full max-w-md rounded-2xl p-6 shadow-lg gradient-bg">
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col gap-4">
                <div className="bg-white/40 rounded-lg p-3 inline-flex items-center">
                  <Brain className="size-5 text-primary" />
                </div>

                <div className="bg-white/40 rounded-lg p-3 inline-flex items-center">
                  <Heart className="size-5 text-secondary" />
                </div>
              </div>

              <div className="flex-1">
                <div className="bg-white/30 rounded-xl p-5 h-full flex items-center justify-center">
                  <Activity className="size-8 text-accent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
