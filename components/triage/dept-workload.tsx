"use client"

import { motion } from "framer-motion"
import {
  Siren,
  HeartPulse,
  Wind,
  Stethoscope,
} from "lucide-react"

const DEPARTMENTS = [
  { name: "Emergency", patients: 45, max: 60, icon: Siren, color: "#FF4458" },
  { name: "Cardiology", patients: 23, max: 60, icon: HeartPulse, color: "#FF6B35" },
  { name: "Pulmonology", patients: 18, max: 60, icon: Wind, color: "#6B46C1" },
  { name: "General Med.", patients: 34, max: 60, icon: Stethoscope, color: "#00D9A5" },
]

export function DeptWorkload() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="glass-strong rounded-2xl p-5 shadow-lg shadow-primary/5"
    >
      <h3 className="text-sm font-bold text-foreground mb-4">
        Department Workload
      </h3>

      <div className="flex flex-col gap-4">
        {DEPARTMENTS.map((dept, i) => (
          <motion.div
            key={dept.name}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: `${dept.color}15` }}
                >
                  <dept.icon className="w-3.5 h-3.5" style={{ color: dept.color }} />
                </div>
                <span className="text-xs font-medium text-foreground">
                  {dept.name}
                </span>
              </div>
              <span className="text-xs font-bold text-muted-foreground">
                {dept.patients}{" "}
                <span className="font-normal text-muted-foreground/60">patients</span>
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-secondary overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${dept.color}88, ${dept.color})`,
                  boxShadow: `0 0 10px ${dept.color}30`,
                }}
                initial={{ width: 0 }}
                animate={{
                  width: `${(dept.patients / dept.max) * 100}%`,
                }}
                transition={{
                  duration: 1,
                  ease: "easeOut",
                  delay: 0.6 + i * 0.1,
                }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}
