"use client"

import { motion } from "framer-motion"
import { Card } from "@/components/ui/card"

export default function About() {
  return (
    <section id="about" className="container-custom py-12">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-4"
        >
          <h3 className="text-2xl font-semibold">About Luna Emotion Companion</h3>
          <p className="text-muted-foreground">
            Luna is an AI-powered emotional intelligence platform that helps users
            identify emotions, reflect through journaling, and take actionable
            steps to improve wellbeing. It combines mood analytics, conversational
            guidance, and secure tracking to create a safe space for growth.
          </p>
          <p className="text-muted-foreground">
            Designed with privacy-first principles, Luna stores data securely and
            gives users full control over their journey.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.75 }}
          className="flex justify-center"
        >
          <Card className="glass rounded-2xl p-6 max-w-sm w-full">
            <div className="h-40 bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground">Illustration Placeholder</span>
            </div>
          </Card>
        </motion.div>
      </div>
    </section>
  )
}
