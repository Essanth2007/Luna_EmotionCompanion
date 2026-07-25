"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function CTA() {
  return (
    <section className="py-16">
      <div className="container-custom">
        <div className="rounded-2xl p-8 text-center gradient-bg glass">
          <motion.h2
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-2xl sm:text-3xl font-semibold"
          >
            Start Your Emotional Wellness Journey Today
          </motion.h2>
          <p className="mt-3 text-muted-foreground max-w-2xl mx-auto">
            Join Luna to start tracking emotions, reflect with guided journaling,
            and get insights tailored to your wellbeing.
          </p>

          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link href="/get-started" className={cn(buttonVariants({ size: "lg" }), "px-6")}>
              Get Started
            </Link>
            <Link href="/contact" className={cn(buttonVariants({ variant: "outline", size: "lg" }), "px-6")}>
              Contact Us
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
