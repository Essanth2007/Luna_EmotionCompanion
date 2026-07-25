"use client"

import * as React from "react"

export function Card({ className = "", children }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`bg-card text-card-foreground rounded-lg shadow-sm p-4 ${className}`}>
      {children}
    </div>
  )
}

export function CardHeader({ className = "", children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`mb-2 ${className}`}>{children}</div>
}

export function CardTitle({ className = "", children }: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
}

export function CardContent({ className = "", children }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`${className}`}>{children}</div>
}

export default Card
