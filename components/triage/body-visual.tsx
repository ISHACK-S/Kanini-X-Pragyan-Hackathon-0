"use client"

import { motion } from "framer-motion"
import Image from "next/image"

interface BodyVisualProps {
  symptoms: string[]
  heartRate?: number
  visualSrc?: string
}

export function BodyVisual({ symptoms, heartRate = 124, visualSrc = "/images/cardiac-visual.jpeg" }: BodyVisualProps) {
  const chestActive =
    symptoms.includes("chest-pain") || symptoms.includes("shortness-of-breath")
  const isActive = symptoms.length > 0
  const beatDuration = chestActive ? 0.7 : 1.1

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
      className="glass-strong rounded-2xl shadow-lg shadow-primary/5 overflow-hidden flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 pt-5 pb-2">
        <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
          Cardiac Monitor
        </h3>
        <motion.div
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="flex items-center gap-1.5"
        >
          <span className="w-2 h-2 rounded-full bg-red-500" />
          <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider leading-none">
            Live
          </span>
        </motion.div>
      </div>

      {/* Heart image area */}
      <div className="relative flex items-center justify-center px-5 py-6">
        {/* Pulsing ring 1 - outermost */}
        <motion.div
          animate={{
            scale: [1, 1.6, 1],
            opacity: [0.15, 0, 0.15],
          }}
          transition={{ duration: beatDuration * 1.2, repeat: Infinity, ease: "easeOut" }}
          className="absolute w-52 h-52 rounded-full border-2 border-red-500/30"
        />
        {/* Pulsing ring 2 */}
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            opacity: [0.2, 0, 0.2],
          }}
          transition={{ duration: beatDuration * 1.2, repeat: Infinity, ease: "easeOut", delay: 0.1 }}
          className="absolute w-44 h-44 rounded-full border-2 border-red-400/40"
        />
        {/* Pulsing ring 3 - innermost */}
        <motion.div
          animate={{
            scale: [1, 1.25, 1],
            opacity: [0.25, 0.05, 0.25],
          }}
          transition={{ duration: beatDuration * 1.2, repeat: Infinity, ease: "easeOut", delay: 0.2 }}
          className="absolute w-36 h-36 rounded-full border-2 border-red-400/50"
        />

        {/* Deep glow behind heart */}
        <motion.div
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-48 h-48 rounded-full bg-red-500/20 blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.05, 1.25, 1.05],
            opacity: [0.1, 0.25, 0.1],
          }}
          transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut", delay: 0.08 }}
          className="absolute w-56 h-56 rounded-full bg-red-400/10 blur-[50px]"
        />

        {/* Heartbeat pump animation on image */}
        <motion.div
          animate={
            isActive
              ? { scale: [1, 1.08, 1, 1.05, 1] }
              : { scale: [1, 1.04, 1, 1.02, 1] }
          }
          transition={{
            duration: beatDuration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="relative z-10"
        >
          {/* Red halo directly behind the heart */}
          <motion.div
            animate={{ opacity: [0.4, 0.8, 0.4] }}
            transition={{ duration: beatDuration, repeat: Infinity, ease: "easeInOut" }}
            className="absolute inset-0 m-auto w-40 h-40 rounded-full bg-red-500/25 blur-2xl"
          />
          <div className="relative h-64 w-44 overflow-hidden rounded-2xl border border-red-500/20 bg-black/20">
            <Image
              src={visualSrc}
              alt="Cardiac monitor visual"
              fill
              className="object-cover object-center drop-shadow-[0_8px_30px_rgba(239,68,68,0.45)]"
              priority
              unoptimized={visualSrc.startsWith("blob:")}
            />
          </div>
        </motion.div>

        {/* Floating particles around heart */}
        {Array.from({ length: 5 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -30 - i * 8, 0],
              x: [0, (i % 2 === 0 ? 1 : -1) * (10 + i * 4), 0],
              opacity: [0, 0.6, 0],
              scale: [0.5, 1, 0.5],
            }}
            transition={{
              duration: 3 + i * 0.8,
              repeat: Infinity,
              delay: i * 0.6,
              ease: "easeInOut",
            }}
            className="absolute w-1.5 h-1.5 rounded-full bg-red-400/60"
            style={{
              left: `${30 + i * 10}%`,
              top: `${40 + (i % 3) * 12}%`,
            }}
          />
        ))}
      </div>

      {/* Heart Rate bar - red ECG */}
      <div className="relative mx-4 mb-4 rounded-xl bg-secondary/60 backdrop-blur-md border border-red-500/20 px-4 py-3 overflow-hidden">
        {/* Red shimmer sweep */}
        <motion.div
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", repeatDelay: 2 }}
          className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-red-500/8 to-transparent pointer-events-none"
        />
        <div className="flex items-center justify-between relative z-10">
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-display font-bold text-foreground leading-none">
              Heart Rate
            </span>
            <div className="flex items-baseline gap-1">
              <motion.span
                key={heartRate}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-lg font-display font-bold text-red-500 leading-none"
              >
                {heartRate}
              </motion.span>
              <span className="text-xs text-muted-foreground leading-none">bpm</span>
            </div>
          </div>

          {/* Red ECG waveform */}
          <div className="w-28 h-10 overflow-hidden relative">
            {/* Red glow behind the ECG peak areas */}
            <motion.div
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: beatDuration, repeat: Infinity }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-red-500/10 to-transparent rounded blur-sm"
            />
            <svg
              className="w-[200%] h-full animate-ecg relative z-10"
              viewBox="0 0 200 40"
              preserveAspectRatio="none"
            >
              {/* Glow filter */}
              <defs>
                <filter id="ecg-glow" x="-20%" y="-20%" width="140%" height="140%">
                  <feGaussianBlur stdDeviation="2" result="blur" />
                  <feMerge>
                    <feMergeNode in="blur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>
              {/* Shadow/glow line */}
              <polyline
                points="0,20 8,20 12,20 15,6 19,34 23,10 27,22 32,20 42,20 50,20 54,20 57,6 61,34 65,10 69,22 74,20 84,20 92,20 96,20 99,6 103,34 107,10 111,22 116,20 126,20 134,20 138,20 141,6 145,34 149,10 153,22 158,20 168,20 176,20 180,20 183,6 187,34 191,10 195,22 200,20"
                fill="none"
                stroke="#ef4444"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
                opacity="0.3"
                filter="url(#ecg-glow)"
              />
              {/* Main red line */}
              <polyline
                points="0,20 8,20 12,20 15,6 19,34 23,10 27,22 32,20 42,20 50,20 54,20 57,6 61,34 65,10 69,22 74,20 84,20 92,20 96,20 99,6 103,34 107,10 111,22 116,20 126,20 134,20 138,20 141,6 145,34 149,10 153,22 158,20 168,20 176,20 180,20 183,6 187,34 191,10 195,22 200,20"
                fill="none"
                stroke="#ef4444"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Alert badges */}
      {isActive && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="flex items-center gap-2 px-4 pb-4 flex-wrap"
        >
          {chestActive && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.8, repeat: Infinity }}
                className="w-1.5 h-1.5 rounded-full bg-red-500"
              />
              <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider leading-none">
                Chest Alert
              </span>
            </motion.div>
          )}
          {symptoms.includes("fever") && (
            <motion.div
              animate={{ opacity: [0.7, 1, 0.7], scale: [1, 1.03, 1] }}
              transition={{ duration: 1.5, repeat: Infinity, delay: 0.3 }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-risk-medium/10 border border-risk-medium/20"
            >
              <motion.span
                animate={{ scale: [1, 1.4, 1], opacity: [0.8, 1, 0.8] }}
                transition={{ duration: 0.8, repeat: Infinity, delay: 0.3 }}
                className="w-1.5 h-1.5 rounded-full bg-risk-medium"
              />
              <span className="text-[10px] font-bold text-risk-medium uppercase tracking-wider leading-none">
                Fever
              </span>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}

