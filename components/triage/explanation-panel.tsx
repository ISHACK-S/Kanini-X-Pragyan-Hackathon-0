"use client"

import { motion } from "framer-motion"
import {
  Search,
  Activity,
  Calendar,
  HeartCrack,
  Heart,
  Zap,
  Thermometer,
} from "lucide-react"
import type { RiskResult } from "@/lib/triage-store"

const FACTOR_ICONS: Record<string, React.ElementType> = {
  "Blood Pressure": Activity,
  Age: Calendar,
  "Chest Pain Symptom": HeartCrack,
  "Heart Disease History": Heart,
  "Heart Rate": Zap,
  "Elevated Heart Rate": Zap,
  Temperature: Thermometer,
}

interface ExplanationPanelProps {
  result: RiskResult | null
}

export function ExplanationPanel({ result }: ExplanationPanelProps) {
  if (!result) {
    return (
      <div className="glass-strong rounded-2xl p-5 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-2 mb-4">
          <Search className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Why This Risk Level?
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Submit patient data to see contributing factors.
        </p>
      </div>
    )
  }

  const colorForLevel = result.level === "HIGH" ? "#FF4458" : result.level === "MEDIUM" ? "#FF6B35" : "#00D9A5"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-strong rounded-2xl p-5 shadow-lg shadow-primary/5"
    >
      <div className="flex items-center gap-2 mb-5">
        <Search className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          Why This Risk Level?
        </h3>
      </div>

      <div className="flex flex-col gap-3.5">
        {result.factors.map((factor, i) => {
          const Icon = FACTOR_ICONS[factor.label] || Zap
          return (
            <motion.div
              key={factor.label}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + i * 0.1 }}
            >
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">
                    {factor.label}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-medium text-muted-foreground">
                    {factor.detail}
                  </span>
                  <span className="text-xs font-bold" style={{ color: colorForLevel }}>
                    {factor.value}%
                  </span>
                </div>
              </div>
              <div className="h-2 rounded-full bg-secondary overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    background: `linear-gradient(90deg, ${colorForLevel}88, ${colorForLevel})`,
                    boxShadow: `0 0 8px ${colorForLevel}40`,
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${factor.value}%` }}
                  transition={{ duration: 0.8, ease: "easeOut", delay: 0.6 + i * 0.1 }}
                />
              </div>
            </motion.div>
          )
        })}
      </div>
    </motion.div>
  )
}
