"use client"

import { motion } from "framer-motion"
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts"

const DATA = [
  { name: "High Risk", value: 32, count: 50, color: "#FF4458" },
  { name: "Medium Risk", value: 38, count: 59, color: "#FF6B35" },
  { name: "Low Risk", value: 30, count: 47, color: "#00D9A5" },
]

export function RiskChart() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-2xl p-5 shadow-lg shadow-primary/5"
    >
      <h3 className="text-sm font-bold text-foreground mb-4">
        Risk Distribution
      </h3>

      <div className="flex items-center gap-4">
        <div className="w-32 h-32 relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={DATA}
                cx="50%"
                cy="50%"
                innerRadius={35}
                outerRadius={55}
                paddingAngle={3}
                dataKey="value"
                strokeWidth={0}
                animationBegin={400}
                animationDuration={1000}
              >
                {DATA.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-lg font-display font-bold text-foreground">
              156
            </span>
            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
              Total
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-1">
          {DATA.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-muted-foreground">{item.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-foreground">
                  {item.value}%
                </span>
                <span className="text-[10px] text-muted-foreground">
                  ({item.count})
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
