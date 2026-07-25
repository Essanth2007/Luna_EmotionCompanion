"use client"

import { motion } from "framer-motion"
import { MessageSquare, BarChart2, Edit3, TrendingUp, Lock, Brain } from "lucide-react"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"

const items = [
  { title: "Emotion Detection", icon: Brain, desc: "AI detects emotions from text and voice." },
  { title: "AI Chat Support", icon: MessageSquare, desc: "Guided conversations for emotional support." },
  { title: "Mood Analytics", icon: BarChart2, desc: "Insights and trends about mood over time." },
  { title: "Daily Journaling", icon: Edit3, desc: "Private journaling to reflect and grow." },
  { title: "Progress Tracking", icon: TrendingUp, desc: "Track improvements and milestones." },
  { title: "Secure & Private", icon: Lock, desc: "Security-first data handling and encryption." },
]

export default function Features() {
  return (
    <section id="features" className="container-custom py-12">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-2xl sm:text-3xl font-semibold mb-6">Why Choose Luna?</h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((it) => {
            const Icon = it.icon
            return (
              <motion.div
                key={it.title}
                whileHover={{ y: -6 }}
                transition={{ type: "spring", stiffness: 220 }}
              >
                <Card className="glass p-5">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="bg-white/30 rounded-lg p-2 inline-flex">
                        <Icon className="size-5 text-primary" />
                      </div>
                      <CardTitle>{it.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="mt-3 text-sm text-muted-foreground">{it.desc}</p>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
