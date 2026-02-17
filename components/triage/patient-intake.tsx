"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Plus,
  Minus,
  ArrowRight,
  Upload,
  PenLine,
  Thermometer,
  HeartCrack,
  Wind,
  Moon,
  Brain,
  Frown,
  RotateCcw,
  CircleDot,
  Syringe,
  Pill,
  Heart,
  Zap,
} from "lucide-react"
import type { PatientData } from "@/lib/triage-store"
import { SYMPTOMS, CONDITIONS, DEMO_PATIENTS, defaultPatient } from "@/lib/triage-store"

const SYMPTOM_ICONS: Record<string, React.ElementType> = {
  Thermometer,
  HeartCrack,
  Wind,
  Moon,
  Brain,
  Frown,
  RotateCcw,
  CircleDot,
}

const CONDITION_ICONS: Record<string, React.ElementType> = {
  Syringe,
  Pill,
  Wind,
  Heart,
}

const RISK_COLORS = {
  HIGH: "border-risk-high/50 bg-risk-high/10 text-risk-high hover:bg-risk-high/20",
  MEDIUM: "border-risk-medium/50 bg-risk-medium/10 text-risk-medium hover:bg-risk-medium/20",
  LOW: "border-risk-low/50 bg-risk-low/10 text-risk-low hover:bg-risk-low/20",
}

interface PatientIntakeProps {
  patient: PatientData
  onPatientChange: (patient: PatientData) => void
  onAnalyze: () => void
  isAnalyzing: boolean
  onUpload?: (file: File) => Promise<void>
}

export function PatientIntake({
  patient,
  onPatientChange,
  onAnalyze,
  isAnalyzing,
  onUpload,
}: PatientIntakeProps) {
  const [inputMode, setInputMode] = useState<"new-patient" | "upload">("new-patient")
  const [isUploading, setIsUploading] = useState(false)

  const update = (partial: Partial<PatientData>) => {
    onPatientChange({ ...patient, ...partial })
  }

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !onUpload) return

    setIsUploading(true)
    try {
      await onUpload(file)
      setInputMode("new-patient")
    } catch (error) {
      console.error("Upload failed:", error)
    } finally {
      setIsUploading(false)
    }
  }

  const toggleSymptom = (id: string) => {
    const symptoms = patient.symptoms.includes(id)
      ? patient.symptoms.filter((s) => s !== id)
      : [...patient.symptoms, id]
    update({ symptoms })
  }

  const toggleCondition = (id: string) => {
    const conditions = patient.conditions.includes(id)
      ? patient.conditions.filter((c) => c !== id)
      : [...patient.conditions, id]
    update({ conditions })
  }

  const loadDemo = (data: PatientData) => {
    onPatientChange({ ...data })
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Patient Information Card */}
      <motion.div
        initial={{ opacity: 0, x: -30 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="glass-strong rounded-2xl overflow-hidden shadow-lg shadow-primary/5"
      >
        {/* Gradient top border */}
        <div className="h-1 bg-gradient-to-r from-brand-purple via-brand-purple-light to-risk-low" />

        <div className="p-5">
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="w-4 h-4 text-primary" />
              </div>
              <h2 className="font-display text-lg font-bold text-foreground">
                New Patient Intake
              </h2>
            </div>
          </div>

          {/* Toggle Buttons */}
          <div className="flex rounded-xl bg-secondary p-1 mb-5">
            <button
              onClick={() => setInputMode("new-patient")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${inputMode === "new-patient"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <PenLine className="w-3.5 h-3.5" />
              New Patient
            </button>
            <button
              onClick={() => setInputMode("upload")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${inputMode === "upload"
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
                }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Upload Document
            </button>
          </div>

          <AnimatePresence mode="wait">
            {inputMode === "new-patient" ? (
              <motion.div
                key="new-patient"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col gap-5"
              >
                {/* Age & Gender Row */}
                <div className="grid grid-cols-2 gap-4 items-end">
                  {/* Age */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                      Age
                    </label>
                    <div className="flex items-center gap-1 rounded-xl border border-border bg-secondary/50 px-1.5 h-[44px]">
                      <button
                        onClick={() =>
                          update({ age: Math.max(0, patient.age - 1) })
                        }
                        className="w-8 h-8 shrink-0 rounded-lg bg-card flex items-center justify-center hover:bg-primary/10 transition-colors"
                        aria-label="Decrease age"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <input
                        type="number"
                        value={patient.age}
                        onChange={(e) =>
                          update({
                            age: Math.max(
                              0,
                              Math.min(120, parseInt(e.target.value) || 0)
                            ),
                          })
                        }
                        className="flex-1 min-w-0 bg-transparent text-center text-lg font-bold text-foreground outline-none leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Patient age"
                      />
                      <button
                        onClick={() =>
                          update({ age: Math.min(120, patient.age + 1) })
                        }
                        className="w-8 h-8 shrink-0 rounded-lg bg-card flex items-center justify-center hover:bg-primary/10 transition-colors"
                        aria-label="Increase age"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Gender */}
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                      Gender
                    </label>
                    <div className="flex items-center rounded-xl border border-border bg-secondary/50 p-1.5 gap-1 h-[44px]">
                      {(
                        [
                          { value: "male" as const, symbol: "\u2642", label: "Male" },
                          { value: "female" as const, symbol: "\u2640", label: "Female" },
                          { value: "other" as const, symbol: "\u26A7", label: "Other" },
                        ]
                      ).map((g) => (
                        <button
                          key={g.value}
                          onClick={() => update({ gender: g.value })}
                          aria-label={g.label}
                          title={g.label}
                          className={`flex-1 h-full flex items-center justify-center gap-1.5 rounded-lg text-sm font-medium transition-all duration-200 ${patient.gender === g.value
                            ? "bg-primary text-primary-foreground shadow-sm"
                            : "text-muted-foreground hover:text-foreground hover:bg-card"
                            }`}
                        >
                          <span className="text-base leading-none">{g.symbol}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                    Symptoms
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {SYMPTOMS.map((symptom) => {
                      const Icon = SYMPTOM_ICONS[symptom.icon]
                      const active = patient.symptoms.includes(symptom.id)
                      return (
                        <motion.button
                          key={symptom.id}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => toggleSymptom(symptom.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 ${active
                            ? "border-primary bg-primary/15 text-primary"
                            : "border-border bg-secondary/50 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                        >
                          {Icon && <Icon className="w-3 h-3" />}
                          {symptom.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Vital Signs */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                    Vital Signs
                  </label>

                  {/* Blood Pressure */}
                  <div className="rounded-xl border border-border bg-secondary/30 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-muted-foreground font-medium leading-none">
                        Blood Pressure
                      </span>
                      <BPIndicator
                        systolic={patient.systolic}
                        diastolic={patient.diastolic}
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        value={patient.systolic}
                        onChange={(e) =>
                          update({
                            systolic: Math.max(
                              0,
                              Math.min(300, parseInt(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-20 bg-card rounded-lg px-3 py-2 text-center text-sm font-bold text-foreground outline-none border border-border focus:border-primary transition-colors leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Systolic blood pressure"
                      />
                      <span className="text-lg font-bold text-muted-foreground leading-none">/</span>
                      <input
                        type="number"
                        value={patient.diastolic}
                        onChange={(e) =>
                          update({
                            diastolic: Math.max(
                              0,
                              Math.min(200, parseInt(e.target.value) || 0)
                            ),
                          })
                        }
                        className="w-20 bg-card rounded-lg px-3 py-2 text-center text-sm font-bold text-foreground outline-none border border-border focus:border-primary transition-colors leading-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label="Diastolic blood pressure"
                      />
                      <span className="text-xs text-muted-foreground leading-none ml-1">mmHg</span>
                    </div>
                  </div>

                  {/* Heart Rate & Temperature */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-xl border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Heart className="w-3.5 h-3.5 text-risk-high animate-heartbeat" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Heart Rate
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          value={patient.heartRate}
                          onChange={(e) =>
                            update({
                              heartRate: Math.max(
                                0,
                                Math.min(250, parseInt(e.target.value) || 0)
                              ),
                            })
                          }
                          className="w-full bg-card rounded-lg px-3 py-2 text-center text-sm font-bold text-foreground outline-none border border-border focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label="Heart rate BPM"
                        />
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          BPM
                        </span>
                      </div>
                    </div>

                    <div className="rounded-xl border border-border bg-secondary/30 p-3">
                      <div className="flex items-center gap-1.5 mb-2">
                        <Thermometer className="w-3.5 h-3.5 text-risk-medium" />
                        <span className="text-xs text-muted-foreground font-medium">
                          Temperature
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.1"
                          value={patient.temperature}
                          onChange={(e) =>
                            update({
                              temperature: Math.max(
                                90,
                                Math.min(
                                  110,
                                  parseFloat(e.target.value) || 98.6
                                )
                              ),
                            })
                          }
                          className="w-full bg-card rounded-lg px-3 py-2 text-center text-sm font-bold text-foreground outline-none border border-border focus:border-primary transition-colors [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                          aria-label="Temperature in Fahrenheit"
                        />
                        <span className="text-xs text-muted-foreground">
                          {"°F"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pre-existing Conditions */}
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider leading-none">
                    Pre-existing Conditions
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {CONDITIONS.map((cond) => {
                      const Icon = CONDITION_ICONS[cond.icon]
                      const active = patient.conditions.includes(cond.id)
                      return (
                        <motion.button
                          key={cond.id}
                          whileTap={{ scale: 0.97 }}
                          onClick={() => toggleCondition(cond.id)}
                          className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-medium transition-all duration-200 ${active
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border bg-secondary/30 text-muted-foreground hover:border-primary/30 hover:text-foreground"
                            }`}
                        >
                          {Icon && <Icon className="w-4 h-4" />}
                          {cond.label}
                        </motion.button>
                      )
                    })}
                  </div>
                </div>

                {/* Analyze Button */}
                <motion.button
                  whileHover={{ scale: 1.02, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={onAnalyze}
                  disabled={isAnalyzing}
                  className="relative w-full py-3.5 rounded-xl bg-gradient-to-r from-brand-purple to-brand-purple-light text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all disabled:opacity-70 overflow-hidden"
                >
                  {/* Shimmer effect */}
                  <motion.div
                    animate={{ x: ["-100%", "200%"] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
                    className="absolute inset-0 w-1/3 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
                  />
                  {isAnalyzing ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        repeat: Infinity,
                        duration: 1,
                        ease: "linear",
                      }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                  ) : (
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    >
                      <Zap className="w-4 h-4" />
                    </motion.div>
                  )}
                  {isAnalyzing ? "Analyzing..." : "Analyze Risk"}
                  {!isAnalyzing && (
                    <motion.div
                      animate={{ x: [0, 4, 0] }}
                      transition={{ duration: 1.5, repeat: Infinity }}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </motion.div>
                  )}
                </motion.button>

                {/* Quick Demo Patients */}
                <div className="glass-strong rounded-2xl p-5 shadow-lg shadow-primary/5">
                  <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                    Quick Demo Patients
                  </h3>
                  <div className="flex flex-col gap-2">
                    {DEMO_PATIENTS.map((demo) => (
                      <motion.button
                        key={demo.label}
                        whileHover={{ scale: 1.01, x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => loadDemo(demo.data)}
                        className={`flex items-center justify-between p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${RISK_COLORS[demo.risk]}`}
                      >
                        <span>{demo.label}</span>
                        <ArrowRight className="w-4 h-4" />
                      </motion.button>
                    ))}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative"
              >
                <label className="flex flex-col items-center justify-center py-12 rounded-xl border-2 border-dashed border-border hover:border-primary/30 transition-colors cursor-pointer group">
                  <input
                    type="file"
                    className="hidden"
                    onChange={handleFileUpload}
                    accept=".pdf,.txt,.doc,.docx,.png,.jpg,.jpeg,.webp"
                    disabled={isUploading}
                  />
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                        className="w-10 h-10 border-2 border-primary/20 border-t-primary rounded-full mb-3"
                      />
                      <p className="text-sm font-medium text-foreground">Extracting Data...</p>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-muted-foreground group-hover:text-primary transition-colors mb-3" />
                      <p className="text-sm font-medium text-foreground mb-1">
                        Select EMR document or image
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PDF/TXT/DOC/DOCX or PNG/JPG/WEBP
                      </p>
                    </>
                  )}
                </label>
                {isUploading && (
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 5 }}
                    className="absolute bottom-0 left-0 h-1 bg-primary rounded-b-xl"
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  )
}

function BPIndicator({
  systolic,
  diastolic,
}: {
  systolic: number
  diastolic: number
}) {
  let color = "text-risk-low"
  let label = "Normal"
  if (systolic >= 180 || diastolic >= 110) {
    color = "text-risk-high"
    label = "Critical"
  } else if (systolic >= 140 || diastolic >= 90) {
    color = "text-risk-medium"
    label = "High"
  } else if (systolic >= 120 || diastolic >= 80) {
    color = "text-yellow-500"
    label = "Elevated"
  }
  return (
    <span className={`text-xs font-bold ${color}`}>{label}</span>
  )
}
