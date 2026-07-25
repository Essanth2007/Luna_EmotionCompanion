"use client"

import Link from "next/link"
import { Activity, Heart, Brain } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-border mt-12">
      <div className="container-custom py-8">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
          <div>
            <h4 className="text-lg font-semibold">Luna Emotion Companion</h4>
            <p className="text-sm text-muted-foreground max-w-md">AI-powered Emotion Intelligence Platform focused on privacy and growth.</p>
          </div>

          <div className="flex gap-8">
            <div>
              <h5 className="font-medium">Quick Links</h5>
              <ul className="mt-2 space-y-1 text-sm">
                <li><Link href="#">Home</Link></li>
                <li><Link href="#features">Features</Link></li>
                <li><Link href="/dashboard">Dashboard</Link></li>
                <li><Link href="/contact">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h5 className="font-medium">Social</h5>
              <div className="flex items-center gap-3 mt-2">
                <a aria-label="Social 1" href="#"><Activity className="size-5" /></a>
                <a aria-label="Social 2" href="#"><Heart className="size-5" /></a>
                <a aria-label="Email" href="mailto:hello@example.com"><Brain className="size-5" /></a>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-sm text-muted-foreground">
          © 2026 Luna Emotion Companion. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
