"use client"

import { useState, useEffect } from "react"
import { useTheme } from "next-themes"
import {
  Cross,
  LayoutDashboard,
  UserPlus,
  ListOrdered,
  BarChart3,
  Settings,
  Bell,
  Moon,
  Sun,
} from "lucide-react"
import { motion } from "framer-motion"

const NAV_ITEMS = [
  { label: "Dashboard", icon: LayoutDashboard },
  { label: "New Patient", icon: UserPlus },
  { label: "Queue", icon: ListOrdered },
  { label: "Analytics", icon: BarChart3 },
  { label: "Settings", icon: Settings },
] as const

export type TopNavTab = (typeof NAV_ITEMS)[number]["label"]

interface TopNavProps {
  activeTab: TopNavTab
  onTabChange: (tab: TopNavTab) => void
}

export function TopNav({ activeTab, onTabChange }: TopNavProps) {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full"
    >
      <div className="bg-brand-purple/95 backdrop-blur-xl border-b border-white/10 relative overflow-hidden">
        {/* Animated shimmer line at the bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-[1px] animate-shimmer" />

        <div className="flex items-center justify-between px-6 py-3">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.02 }}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/15 backdrop-blur-sm"
            >
              <Cross className="w-5 h-5 text-white" />
            </motion.div>
            <span className="font-display text-xl font-bold text-white tracking-tight">
              CYIRON
              <motion.span
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="text-risk-low"
              >
                +
              </motion.span>
            </span>
          </motion.div>

          {/* Nav Items */}
          <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar max-w-[48vw] md:max-w-none">
            {NAV_ITEMS.map((item) => (
              <motion.button
                key={item.label}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onTabChange(item.label)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeTab === item.label
                    ? "bg-white/20 text-white shadow-lg shadow-black/10"
                    : "text-white/70 hover:text-white hover:bg-white/10"
                }`}
                aria-current={activeTab === item.label ? "page" : undefined}
                aria-label={`Go to ${item.label}`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </motion.button>
            ))}
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1, rotate: 15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => mounted && setTheme(resolvedTheme === "dark" ? "light" : "dark")}
              className="flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Toggle theme"
            >
              {mounted ? (
                resolvedTheme === "dark" ? (
                  <Sun className="w-4.5 h-4.5" />
                ) : (
                  <Moon className="w-4.5 h-4.5" />
                )
              ) : (
                <span className="w-4.5 h-4.5" />
              )}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="relative flex items-center justify-center w-9 h-9 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
              aria-label="Notifications"
            >
              <Bell className="w-4.5 h-4.5" />
              <motion.span
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute top-1.5 right-1.5 w-2 h-2 bg-risk-high rounded-full"
              />
            </motion.button>
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-purple-light to-risk-low flex items-center justify-center text-white text-sm font-bold ring-2 ring-white/20"
            >
              DR
            </motion.div>
          </div>
        </div>
      </div>
    </motion.header>
  )
}
