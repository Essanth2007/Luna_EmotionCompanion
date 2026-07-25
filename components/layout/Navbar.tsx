"use client"

import { useState } from "react"
import Link from "next/link"
import { Menu, X, LogIn } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50">
      <nav className="glass container-custom flex items-center justify-between gap-4 py-3">
        <div className="flex items-center gap-4">
          <Link href="/" className="text-lg font-semibold">
            Luna Emotion Companion
          </Link>
        </div>

        <ul className="hidden md:flex items-center gap-6 text-sm">
          <li>
            <a href="#" className="hover:underline">
              Home
            </a>
          </li>
          <li>
            <a href="#features" className="hover:underline">
              Features
            </a>
          </li>
          <li>
            <a href="#about" className="hover:underline">
              About
            </a>
          </li>
          <li>
            <a href="/dashboard" className="hover:underline">
              Dashboard
            </a>
          </li>
        </ul>

        <div className="hidden md:flex items-center gap-3">
          <Link
            href="/login"
            className={cn(buttonVariants({ variant: "outline", size: "sm" }), "flex items-center gap-2")}
          >
            <LogIn className="size-4" />
            Login
          </Link>
        </div>

        <div className="md:hidden">
          <button
            aria-label="Toggle menu"
            onClick={() => setOpen(!open)}
            className="rounded-md p-2"
          >
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="md:hidden"
          >
            <div className="glass m-4 rounded-lg p-4">
              <ul className="flex flex-col gap-3 text-base">
                <li>
                  <a href="#">Home</a>
                </li>
                <li>
                  <a href="#features">Features</a>
                </li>
                <li>
                  <a href="#about">About</a>
                </li>
                <li>
                  <a href="/dashboard">Dashboard</a>
                </li>
                <li>
                  <a href="/login" className={cn(buttonVariants({ size: "default" }), "w-full mt-2 inline-flex items-center justify-center")}>Login</a>
                </li>
              </ul>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
