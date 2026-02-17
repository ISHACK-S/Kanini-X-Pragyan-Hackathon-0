"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Users, ShieldAlert, Clock, TrendingUp, TrendingDown } from "lucide-react"

const METRICS = [
  {
    label: "Total Patients",
    value: 156,
    trend: "+12%",
    up: true,
    icon: Users,
    color: "text-primary",
    bg: "bg-primary/10",
  },
  {
    label: "High Risk",
    value: 22,
    trend: "+3",
    up: true,
    icon: ShieldAlert,
    color: "text-risk-high",
    bg: "bg-risk-high/10",
  },
  {
    label: "Avg Wait",
    value: 28,
    suffix: " min",
    trend: "-5 min",
    up: false,
    icon: Clock,
    color: "text-risk-low",
    bg: "bg-risk-low/10",
  },
]

function AnimatedNumber({ target, suffix = "" }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 1200
    const increment = target / (duration / 16)
    const timer = setInterval(() => {
      start += increment
      if (start >= target) {
        setCount(target)
        clearInterval(timer)
      } else {
        setCount(Math.floor(start))
      }
    }, 16)
    return () => clearInterval(timer)
  }, [target])

  return (
    <span>
      {count}
      {suffix}
    </span>
  )
}

export function MetricsCards() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.1 }}
      className="grid grid-cols-3 gap-3"
    >
      {METRICS.map((m, i) => (
        <motion.div
          key={m.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 + i * 0.1 }}
          whileHover={{ y: -4, boxShadow: "0 10px 40px -10px rgba(107,70,193,0.15)", scale: 1.02 }}
          className="glass-strong rounded-2xl p-4 shadow-lg shadow-primary/5 transition-shadow"
        >
          <div className="flex items-center justify-between mb-3">
            <div className={`w-8 h-8 rounded-lg ${m.bg} flex items-center justify-center`}>
              <m.icon className={`w-4 h-4 ${m.color}`} />
            </div>
            <div
              className={`flex items-center gap-0.5 text-[10px] font-bold ${
                m.up ? "text-risk-high" : "text-risk-low"
              }`}
            >
              {m.up ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {m.trend}
            </div>
          </div>
          <p className={`text-2xl font-display font-bold ${m.color}`}>
            <AnimatedNumber target={m.value} suffix={m.suffix} />
          </p>
          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1 font-medium">
            {m.label}
          </p>
        </motion.div>
      ))}
    </motion.div>
  )
}
