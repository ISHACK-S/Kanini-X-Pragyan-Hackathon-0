"use client"

import { motion } from "framer-motion"
import { RefreshCw } from "lucide-react"
import { QUEUE_DATA } from "@/lib/triage-store"

const RISK_BADGE_STYLES = {
  HIGH: "bg-risk-high/15 text-risk-high border-risk-high/20",
  MEDIUM: "bg-risk-medium/15 text-risk-medium border-risk-medium/20",
  LOW: "bg-risk-low/15 text-risk-low border-risk-low/20",
}

const RISK_DOT_COLORS = {
  HIGH: "bg-risk-high",
  MEDIUM: "bg-risk-medium",
  LOW: "bg-risk-low",
}

export function PatientQueue() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="glass-strong rounded-2xl shadow-lg shadow-primary/5 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 pb-3">
        <h3 className="text-sm font-bold text-foreground">Live Patient Queue</h3>
        <button
          className="w-7 h-7 rounded-lg bg-secondary flex items-center justify-center hover:bg-primary/10 transition-colors"
          aria-label="Refresh queue"
        >
          <RefreshCw className="w-3.5 h-3.5 text-muted-foreground" />
        </button>
      </div>

      {/* Table Header */}
      <div className="grid grid-cols-[1fr_1fr_1.2fr_1.2fr_0.6fr] gap-2 px-4 pb-2 text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
        <span>ID</span>
        <span>Time</span>
        <span>Risk</span>
        <span>Dept</span>
        <span>Age</span>
      </div>

      {/* Scrollable Rows */}
      <div className="max-h-[260px] overflow-y-auto">
        {QUEUE_DATA.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 + i * 0.05 }}
            whileHover={{ backgroundColor: "hsl(var(--secondary) / 0.5)" }}
            className={`grid grid-cols-[1fr_1fr_1.2fr_1.2fr_0.6fr] gap-2 px-4 py-2.5 text-xs items-center cursor-default transition-colors ${
              i % 2 === 0 ? "bg-secondary/20" : ""
            }`}
          >
            <span className="font-mono font-bold text-foreground">{p.id}</span>
            <span className="text-muted-foreground">{p.time}</span>
            <span>
              <span
                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${RISK_BADGE_STYLES[p.risk]}`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${RISK_DOT_COLORS[p.risk]} ${
                    p.risk === "HIGH" ? "animate-pulse" : ""
                  }`}
                />
                {p.risk}
              </span>
            </span>
            <span className="text-muted-foreground">{p.department}</span>
            <span className="text-muted-foreground">{p.age}</span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
