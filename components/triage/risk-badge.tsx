"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react"
import type { RiskLevel } from "@/lib/triage-store"

interface RiskBadgeProps {
  level: RiskLevel
  confidence: number
  source: string
}

const CONFIG = {
  HIGH: {
    label: "HIGH RISK",
    color: "#FF4458",
    bg: "from-risk-high/20 to-risk-high/5",
    glow: "animate-pulse-glow-red",
    icon: ShieldAlert,
    ring: "ring-risk-high/30",
  },
  MEDIUM: {
    label: "MEDIUM RISK",
    color: "#FF6B35",
    bg: "from-risk-medium/20 to-risk-medium/5",
    glow: "animate-pulse-glow-orange",
    icon: Shield,
    ring: "ring-risk-medium/30",
  },
  LOW: {
    label: "LOW RISK",
    color: "#00D9A5",
    bg: "from-risk-low/20 to-risk-low/5",
    glow: "animate-pulse-glow-green",
    icon: ShieldCheck,
    ring: "ring-risk-low/30",
  },
}

export function RiskBadge({ level, confidence, source }: RiskBadgeProps) {
  if (!level) return <RiskPlaceholder />

  const cfg = CONFIG[level]
  const Icon = cfg.icon
  const displayConfidence = Math.max(0, Math.min(100, Math.round(confidence)))

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
      className="glass-strong rounded-2xl p-6 shadow-lg shadow-primary/5 flex flex-col items-center"
    >
      {/* Circular Badge */}
      <motion.div
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        className={`relative ${cfg.glow} rounded-full`}
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 25, delay: 0.15 }}
          className={`w-40 h-40 rounded-full bg-gradient-to-br ${cfg.bg} border-2 flex flex-col items-center justify-center ring-4 ${cfg.ring}`}
          style={{ borderColor: cfg.color }}
        >
          <Icon className="w-8 h-8 mb-1" style={{ color: cfg.color }} />
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-display font-bold"
            style={{ color: cfg.color }}
          >
            {displayConfidence}%
          </motion.span>
          <span
            className="text-[10px] font-bold uppercase tracking-widest mt-0.5"
            style={{ color: cfg.color }}
          >
            {cfg.label}
          </span>
        </motion.div>

        {/* Rotating Ring */}
        <svg
          className="absolute inset-0 w-full h-full -rotate-90"
          viewBox="0 0 160 160"
        >
          <motion.circle
            cx="80"
            cy="80"
            r="76"
            fill="none"
            stroke={cfg.color}
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={`${(displayConfidence / 100) * 477.5} 477.5`}
            initial={{ strokeDasharray: "0 477.5" }}
            animate={{
              strokeDasharray: `${(displayConfidence / 100) * 477.5} 477.5`,
            }}
            transition={{ duration: 1.2, ease: "easeInOut", delay: 0.2 }}
            opacity={0.6}
          />
        </svg>
      </motion.div>

      {/* Source indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mt-4 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground"
      >
        Source: {source}
      </motion.div>
    </motion.div>
  )
}

function RiskPlaceholder() {
  return (
    <div className="glass-strong rounded-2xl p-6 flex flex-col items-center shadow-lg shadow-primary/5">
      <div className="w-40 h-40 rounded-full border-2 border-dashed border-border flex flex-col items-center justify-center">
        <Shield className="w-8 h-8 text-muted-foreground/40 mb-2" />
        <span className="text-xs text-muted-foreground/60 font-medium text-center px-4">
          Enter patient data and click Analyze
        </span>
      </div>
      <div className="mt-4 px-3 py-1.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground/50">
        Awaiting analysis
      </div>
    </div>
  )
}
