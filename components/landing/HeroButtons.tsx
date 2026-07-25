"use client"

import { motion } from "framer-motion"
import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function HeroButtons() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.45 }}
      className="flex flex-col sm:flex-row gap-3"
    >
      <Link
        href="/get-started"
        className={cn(buttonVariants({ size: "lg", variant: "default" }), "px-6")}
      >
        Get Started
      </Link>

      <Link
        href="#learn"
        className={cn(buttonVariants({ size: "lg", variant: "ghost" }), "px-6")}
      >
        Learn More
      </Link>
    </motion.div>
  )
}
