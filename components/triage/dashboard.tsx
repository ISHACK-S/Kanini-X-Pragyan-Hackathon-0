"use client"

import { useState, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { useRouter } from "next/navigation"
import { TopNav, type TopNavTab } from "./top-nav"
import { PatientIntake } from "./patient-intake"
import { RiskBadge } from "./risk-badge"
import { BodyVisual } from "./body-visual"
import { VitalsMini } from "./vitals-mini"
import { ExplanationPanel } from "./explanation-panel"
import { SafetyGuidance } from "./safety-guidance"
import { MetricsCards } from "./metrics-cards"
import { PatientQueue } from "./patient-queue"
import { RiskChart } from "./risk-chart"
import { DeptWorkload } from "./dept-workload"
import {
  type PatientData,
  type RiskResult,
  defaultPatient,
} from "@/lib/triage-store"
import { analyzeRisk as analyzeRiskApi, uploadEmr } from "@/lib/api-client"

export function Dashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<TopNavTab>("Dashboard")
  const [patient, setPatient] = useState<PatientData>({ ...defaultPatient })
  const [result, setResult] = useState<RiskResult | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [cardiacVisualSrc, setCardiacVisualSrc] = useState<string>("/images/cardiac-visual.jpeg")

  const runAnalysis = useCallback(async (patientData: PatientData) => {
    setIsAnalyzing(true)
    setResult(null)

    try {
      // Call backend API
      const risk = await analyzeRiskApi(patientData)
      setResult(risk)
    } catch (error) {
      console.error("Analysis failed:", error)
    } finally {
      setIsAnalyzing(false)
    }
  }, [])

  const handleAnalyze = useCallback(async () => {
    await runAnalysis(patient)
  }, [patient, runAnalysis])

  const handleUpload = useCallback(async (file: File) => {
    const isImage = file.type.startsWith("image/")

    if (isImage) {
      const previewUrl = URL.createObjectURL(file)
      setCardiacVisualSrc((prev) => {
        if (prev.startsWith("blob:")) {
          URL.revokeObjectURL(prev)
        }
        return previewUrl
      })
    }

    try {
      const extractedData = await uploadEmr(file)
      const normalizedExtracted: Partial<PatientData> = {
        ...(typeof extractedData.age === "number" ? { age: extractedData.age } : {}),
        ...(extractedData.gender === "male" || extractedData.gender === "female" || extractedData.gender === "other"
          ? { gender: extractedData.gender }
          : {}),
        ...(Array.isArray(extractedData.symptoms) ? { symptoms: extractedData.symptoms } : {}),
        ...(typeof extractedData.systolic === "number" ? { systolic: extractedData.systolic } : {}),
        ...(typeof extractedData.diastolic === "number" ? { diastolic: extractedData.diastolic } : {}),
        ...(typeof extractedData.heartRate === "number" ? { heartRate: extractedData.heartRate } : {}),
        ...(typeof extractedData.temperature === "number" ? { temperature: extractedData.temperature } : {}),
        ...(Array.isArray(extractedData.conditions) ? { conditions: extractedData.conditions } : {}),
      }
      let mergedPatient: PatientData | null = null
      setPatient((prev) => {
        mergedPatient = { ...prev, ...normalizedExtracted }
        return mergedPatient
      })
      if (mergedPatient) {
        await runAnalysis(mergedPatient)
      }
    } catch (error) {
      console.warn("Upload extraction failed:", error)
    }
  }, [runAnalysis])

  useEffect(() => {
    return () => {
      if (cardiacVisualSrc.startsWith("blob:")) {
        URL.revokeObjectURL(cardiacVisualSrc)
      }
    }
  }, [cardiacVisualSrc])

  useEffect(() => {
    const readTabFromUrl = () => {
      const params = new URLSearchParams(window.location.search)
      const tabParam = params.get("tab")
      const tabMap: Record<string, TopNavTab> = {
        dashboard: "Dashboard",
        "new-patient": "New Patient",
        queue: "Queue",
        analytics: "Analytics",
        settings: "Settings",
      }
      const mapped = tabParam ? tabMap[tabParam] : "Dashboard"
      if (mapped && mapped !== activeTab) {
        setActiveTab(mapped)
      }
    }
    readTabFromUrl()
    window.addEventListener("popstate", readTabFromUrl)
    return () => window.removeEventListener("popstate", readTabFromUrl)
  }, [activeTab])

  const handleTabChange = useCallback(
    (tab: TopNavTab) => {
      setActiveTab(tab)
      const slugMap: Record<TopNavTab, string> = {
        Dashboard: "dashboard",
        "New Patient": "new-patient",
        Queue: "queue",
        Analytics: "analytics",
        Settings: "settings",
      }
      router.push(`/?tab=${slugMap[tab]}`)
    },
    [router]
  )

  return (
    <div className="min-h-screen bg-background">
      <TopNav activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Animated background */}
      <div className="fixed inset-0 -z-10 pointer-events-none overflow-hidden">
        <motion.div
          animate={{
            x: [0, 30, -20, 0],
            y: [0, -20, 15, 0],
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, -25, 20, 0],
            y: [0, 15, -25, 0],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-risk-low/5 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            x: [0, 15, -10, 0],
            y: [0, -30, 10, 0],
          }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/2 left-1/2 w-[400px] h-[400px] bg-risk-high/3 rounded-full blur-3xl"
        />
        {/* Floating particles */}
        {Array.from({ length: 6 }).map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: [0, -80, 0],
              x: [0, i % 2 === 0 ? 20 : -20, 0],
              opacity: [0, 0.5, 0],
            }}
            transition={{
              duration: 6 + i * 2,
              repeat: Infinity,
              delay: i * 1.5,
              ease: "easeInOut",
            }}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${15 + i * 15}%`,
              top: `${50 + (i % 3) * 15}%`,
            }}
          />
        ))}
      </div>

      <main className="px-4 lg:px-6 py-6 max-w-[1600px] mx-auto">
        {activeTab === "New Patient" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-3 flex flex-col gap-5">
              <PatientIntake
                patient={patient}
                onPatientChange={setPatient}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
                onUpload={handleUpload}
              />
            </div>

            <div className="lg:col-span-5 flex flex-col gap-5">
              {isAnalyzing ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="glass-strong rounded-2xl p-8 shadow-lg shadow-primary/5 flex flex-col items-center justify-center"
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
                    className="w-16 h-16 rounded-full border-2 border-primary/20 border-t-primary mb-4"
                  />
                  <p className="text-sm font-medium text-muted-foreground">
                    Analyzing patient data...
                  </p>
                </motion.div>
              ) : (
                <>
                  <RiskBadge
                    level={result?.level ?? null}
                    confidence={result?.confidence ?? 0}
                    source={result?.source ?? ""}
                  />
                  <BodyVisual
                    symptoms={patient.symptoms}
                    heartRate={patient.heartRate}
                    visualSrc={cardiacVisualSrc}
                  />
                  <VitalsMini
                    systolic={patient.systolic}
                    diastolic={patient.diastolic}
                    heartRate={patient.heartRate}
                    temperature={patient.temperature}
                  />
                  <ExplanationPanel result={result} />
                  <SafetyGuidance result={result} />
                </>
              )}
            </div>

            <div className="lg:col-span-4 flex flex-col gap-5">
              <MetricsCards />
              <PatientQueue />
              <RiskChart />
              <DeptWorkload />
            </div>
          </div>
        )}

        {activeTab === "Dashboard" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 flex flex-col gap-5">
              <RiskBadge
                level={result?.level ?? null}
                confidence={result?.confidence ?? 0}
                source={result?.source ?? ""}
              />
              <BodyVisual
                symptoms={patient.symptoms}
                heartRate={patient.heartRate}
                visualSrc={cardiacVisualSrc}
              />
              <ExplanationPanel result={result} />
              <SafetyGuidance result={result} />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-5">
              <MetricsCards />
              <PatientQueue />
              <RiskChart />
              <DeptWorkload />
            </div>
          </div>
        )}

        {activeTab === "Queue" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 flex flex-col gap-5">
              <PatientQueue />
              <DeptWorkload />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-5">
              <MetricsCards />
              <RiskChart />
            </div>
          </div>
        )}

        {activeTab === "Analytics" && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            <div className="lg:col-span-8 flex flex-col gap-5">
              <RiskChart />
              <DeptWorkload />
            </div>
            <div className="lg:col-span-4 flex flex-col gap-5">
              <MetricsCards />
              <PatientQueue />
            </div>
          </div>
        )}

        {activeTab === "Settings" && (
          <div className="glass-strong rounded-2xl p-8 shadow-lg shadow-primary/5">
            <h2 className="font-display text-xl font-bold text-foreground mb-2">Settings</h2>
            <p className="text-sm text-muted-foreground">
              Settings panel placeholder. Theme, model, and workflow settings can be added here.
            </p>
          </div>
        )}
      </main>
    </div>
  )
}
