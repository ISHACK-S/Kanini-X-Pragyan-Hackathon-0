"use client"

import { motion } from "framer-motion"
import {
  AlertTriangle,
  ArmchairIcon,
  Ban,
  Megaphone,
  UtensilsCrossed,
  BedDouble,
  Droplets,
  ClipboardList,
  Dumbbell,
  Smile,
  GlassWater,
  Pill,
  RotateCw,
  Building2,
  Clock,
} from "lucide-react"
import type { RiskResult, RiskLevel } from "@/lib/triage-store"

const GUIDANCE_ICONS: Record<string, React.ElementType> = {
  "Sit or lie down immediately": ArmchairIcon,
  "Avoid physical exertion": Ban,
  "Alert staff if pain worsens": Megaphone,
  "Do not eat or drink": UtensilsCrossed,
  "Rest in a comfortable position": BedDouble,
  "Stay hydrated with water": Droplets,
  "Report any new symptoms": ClipboardList,
  "Avoid strenuous activity": Dumbbell,
  "Continue normal activities": Smile,
  "Stay hydrated": GlassWater,
  "Take over-the-counter medication if needed": Pill,
  "Return if symptoms worsen": RotateCw,
}

const LEVEL_CONFIG: Record<
  Exclude<RiskLevel, null>,
  { bg: string; border: string; iconColor: string; text: string }
> = {
  HIGH: {
    bg: "bg-risk-high/5",
    border: "border-risk-high/20",
    iconColor: "text-risk-high",
    text: "text-risk-high",
  },
  MEDIUM: {
    bg: "bg-risk-medium/5",
    border: "border-risk-medium/20",
    iconColor: "text-risk-medium",
    text: "text-risk-medium",
  },
  LOW: {
    bg: "bg-risk-low/5",
    border: "border-risk-low/20",
    iconColor: "text-risk-low",
    text: "text-risk-low",
  },
}

interface SafetyGuidanceProps {
  result: RiskResult | null
}

export function SafetyGuidance({ result }: SafetyGuidanceProps) {
  if (!result || !result.level) {
    return (
      <div className="glass-strong rounded-2xl p-5 shadow-lg shadow-primary/5">
        <div className="flex items-center gap-2 mb-3">
          <AlertTriangle className="w-4 h-4 text-muted-foreground" />
          <h3 className="text-sm font-bold text-foreground">
            Safety Guidance
          </h3>
        </div>
        <p className="text-sm text-muted-foreground">
          Guidance will appear after risk analysis.
        </p>
      </div>
    )
  }

  const cfg = LEVEL_CONFIG[result.level]
  const guidanceItems = Array.isArray(result.guidance) ? result.guidance : []

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className={`rounded-2xl p-5 shadow-lg shadow-primary/5 border ${cfg.bg} ${cfg.border}`}
    >
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className={`w-4 h-4 ${cfg.iconColor}`} />
        <h3 className="text-sm font-bold text-foreground">
          {result.level === "HIGH"
            ? "Immediate Safety Guidance"
            : result.level === "MEDIUM"
              ? "Safety Recommendations"
              : "General Advice"}
        </h3>
      </div>

      <ul className="flex flex-col gap-2.5 mb-5">
        {guidanceItems.map((item, i) => {
          const Icon = GUIDANCE_ICONS[item] || AlertTriangle
          return (
            <motion.li
              key={item}
              initial={{ opacity: 0, x: -15 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.6 + i * 0.08 }}
              className="flex items-center gap-2.5"
            >
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${
                  result.level === "HIGH"
                    ? "bg-risk-high/10"
                    : result.level === "MEDIUM"
                      ? "bg-risk-medium/10"
                      : "bg-risk-low/10"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${cfg.iconColor}`} />
              </div>
              <span className="text-sm text-foreground">{item}</span>
            </motion.li>
          )
        })}
        {guidanceItems.length === 0 && (
          <li className="text-sm text-muted-foreground">
            No immediate guidance was returned for this analysis.
          </li>
        )}
      </ul>

      {/* Department Recommendation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.9 }}
        className={`rounded-xl p-4 border ${cfg.border} ${cfg.bg}`}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Building2 className={`w-5 h-5 ${cfg.iconColor}`} />
            <div>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium">
                Recommended Department
              </p>
              <p className={`text-sm font-bold ${cfg.text}`}>
                {result.department}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-muted-foreground" />
            <span className={`text-xs font-bold ${cfg.text}`}>
              {result.waitTime}
            </span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
