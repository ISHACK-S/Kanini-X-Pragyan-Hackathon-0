"use client"

import { motion } from "framer-motion"
import { Activity, Heart, Thermometer } from "lucide-react"

interface VitalsMiniProps {
  systolic: number
  diastolic: number
  heartRate: number
  temperature: number
}

export function VitalsMini({
  systolic,
  diastolic,
  heartRate,
  temperature,
}: VitalsMiniProps) {
  const bpZone =
    systolic >= 180 || diastolic >= 110
      ? "high"
      : systolic >= 140 || diastolic >= 90
        ? "medium"
        : "normal"
  const hrZone = heartRate > 100 || heartRate < 50 ? "high" : heartRate > 90 ? "medium" : "normal"
  const tempZone = temperature >= 102 ? "high" : temperature >= 100 ? "medium" : "normal"

  const zoneColor = (zone: string) =>
    zone === "high"
      ? "text-risk-high"
      : zone === "medium"
        ? "text-risk-medium"
        : "text-risk-low"

  const zoneBg = (zone: string) =>
    zone === "high"
      ? "bg-risk-high/10 border-risk-high/20"
      : zone === "medium"
        ? "bg-risk-medium/10 border-risk-medium/20"
        : "bg-risk-low/10 border-risk-low/20"

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.35 }}
      className="grid grid-cols-3 gap-3"
    >
      {/* Blood Pressure */}
      <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`glass-strong rounded-2xl p-4 shadow-lg shadow-primary/5 border ${zoneBg(bpZone)}`}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Activity className={`w-3.5 h-3.5 ${zoneColor(bpZone)}`} />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            BP
          </span>
        </div>
        <p className={`text-xl font-display font-bold ${zoneColor(bpZone)}`}>
          {systolic}/{diastolic}
        </p>
        <div className="mt-2 h-1.5 rounded-full bg-secondary overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${
              bpZone === "high"
                ? "bg-risk-high"
                : bpZone === "medium"
                  ? "bg-risk-medium"
                  : "bg-risk-low"
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(100, (systolic / 200) * 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          />
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">mmHg</p>
      </motion.div>

      {/* Heart Rate */}
      <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`glass-strong rounded-2xl p-4 shadow-lg shadow-primary/5 border ${zoneBg(hrZone)}`}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Heart
            className={`w-3.5 h-3.5 ${zoneColor(hrZone)} ${
              hrZone === "high" ? "animate-heartbeat" : ""
            }`}
          />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            HR
          </span>
        </div>
        <p className={`text-xl font-display font-bold ${zoneColor(hrZone)}`}>
          {heartRate}
        </p>
        {/* ECG Line */}
        <div className="mt-2 h-6 overflow-hidden rounded">
          <svg
            className="w-[200%] h-full animate-ecg"
            viewBox="0 0 200 24"
            preserveAspectRatio="none"
          >
            <polyline
              points="0,12 10,12 15,12 18,4 22,20 26,8 30,14 35,12 45,12 55,12 60,12 63,4 67,20 71,8 75,14 80,12 90,12 100,12 105,12 108,4 112,20 116,8 120,14 125,12 135,12 145,12 150,12 153,4 157,20 161,8 165,14 170,12 180,12 190,12 195,12 198,4 200,12"
              fill="none"
              stroke={
                hrZone === "high"
                  ? "#FF4458"
                  : hrZone === "medium"
                    ? "#FF6B35"
                    : "#00D9A5"
              }
              strokeWidth="1.5"
              opacity="0.7"
            />
          </svg>
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">BPM</p>
      </motion.div>

      {/* Temperature */}
      <motion.div
        whileHover={{ y: -3, scale: 1.02 }}
        transition={{ type: "spring", stiffness: 300 }}
        className={`glass-strong rounded-2xl p-4 shadow-lg shadow-primary/5 border ${zoneBg(tempZone)}`}
      >
        <div className="flex items-center gap-1.5 mb-2">
          <Thermometer
            className={`w-3.5 h-3.5 ${zoneColor(tempZone)}`}
          />
          <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
            Temp
          </span>
        </div>
        <p
          className={`text-xl font-display font-bold ${zoneColor(tempZone)}`}
        >
          {temperature}
        </p>
        {/* Thermometer fill */}
        <div className="mt-2 flex items-end gap-0.5 h-6">
          {Array.from({ length: 8 }).map((_, i) => {
            const threshold = 96 + i * 2
            const active = temperature >= threshold
            return (
              <motion.div
                key={i}
                className={`flex-1 rounded-sm ${
                  active
                    ? tempZone === "high"
                      ? "bg-risk-high"
                      : tempZone === "medium"
                        ? "bg-risk-medium"
                        : "bg-risk-low"
                    : "bg-secondary"
                }`}
                initial={{ height: 0 }}
                animate={{ height: `${30 + i * 10}%` }}
                transition={{ duration: 0.4, delay: i * 0.05 }}
              />
            )
          })}
        </div>
        <p className="text-[10px] text-muted-foreground mt-1">{"°F"}</p>
      </motion.div>
    </motion.div>
  )
}
