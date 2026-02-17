export type RiskLevel = "HIGH" | "MEDIUM" | "LOW" | null

export interface PatientData {
  age: number
  gender: "male" | "female" | "other"
  symptoms: string[]
  systolic: number
  diastolic: number
  heartRate: number
  temperature: number
  conditions: string[]
}

export interface RiskResult {
  level: RiskLevel
  confidence: number
  source: "ML Model" | "Safety Rule Override"
  factors: { label: string; value: number; detail: string }[]
  guidance: string[]
  department: string
  waitTime: string
}

export interface QueuePatient {
  id: string
  time: string
  risk: "HIGH" | "MEDIUM" | "LOW"
  department: string
  age: number
}

export const defaultPatient: PatientData = {
  age: 45,
  gender: "male",
  symptoms: [],
  systolic: 120,
  diastolic: 80,
  heartRate: 72,
  temperature: 98.6,
  conditions: [],
}

export const SYMPTOMS = [
  { id: "fever", label: "Fever", icon: "Thermometer" },
  { id: "chest-pain", label: "Chest Pain", icon: "HeartCrack" },
  { id: "shortness-of-breath", label: "Shortness of Breath", icon: "Wind" },
  { id: "fatigue", label: "Fatigue", icon: "Moon" },
  { id: "headache", label: "Headache", icon: "Brain" },
  { id: "nausea", label: "Nausea", icon: "Frown" },
  { id: "dizziness", label: "Dizziness", icon: "RotateCcw" },
  { id: "abdominal-pain", label: "Abdominal Pain", icon: "CircleDot" },
] as const

export const CONDITIONS = [
  { id: "diabetes", label: "Diabetes", icon: "Syringe" },
  { id: "hypertension", label: "Hypertension", icon: "Pill" },
  { id: "asthma", label: "Asthma", icon: "Wind" },
  { id: "heart-disease", label: "Heart Disease", icon: "Heart" },
] as const

export const DEMO_PATIENTS: {
  label: string
  risk: "HIGH" | "MEDIUM" | "LOW"
  data: PatientData
}[] = [
  {
    label: "Emergency Case",
    risk: "HIGH",
    data: {
      age: 68,
      gender: "male",
      symptoms: ["chest-pain", "shortness-of-breath", "dizziness"],
      systolic: 185,
      diastolic: 115,
      heartRate: 118,
      temperature: 99.8,
      conditions: ["hypertension", "heart-disease"],
    },
  },
  {
    label: "Medium Risk",
    risk: "MEDIUM",
    data: {
      age: 52,
      gender: "female",
      symptoms: ["fever", "headache", "fatigue"],
      systolic: 145,
      diastolic: 92,
      heartRate: 88,
      temperature: 101.2,
      conditions: ["diabetes"],
    },
  },
  {
    label: "Low Risk",
    risk: "LOW",
    data: {
      age: 34,
      gender: "male",
      symptoms: ["headache"],
      systolic: 118,
      diastolic: 76,
      heartRate: 68,
      temperature: 98.4,
      conditions: [],
    },
  },
]

export const QUEUE_DATA: QueuePatient[] = [
  { id: "P234", time: "10:45", risk: "HIGH", department: "Emergency", age: 67 },
  { id: "P235", time: "10:47", risk: "MEDIUM", department: "Cardiology", age: 52 },
  { id: "P236", time: "10:49", risk: "LOW", department: "General", age: 34 },
  { id: "P237", time: "10:52", risk: "HIGH", department: "Emergency", age: 71 },
  { id: "P238", time: "10:55", risk: "MEDIUM", department: "Pulmonology", age: 45 },
  { id: "P239", time: "10:58", risk: "LOW", department: "General", age: 28 },
  { id: "P240", time: "11:01", risk: "MEDIUM", department: "Cardiology", age: 59 },
  { id: "P241", time: "11:04", risk: "HIGH", department: "Emergency", age: 73 },
  { id: "P242", time: "11:06", risk: "LOW", department: "General", age: 22 },
  { id: "P243", time: "11:09", risk: "MEDIUM", department: "Pulmonology", age: 48 },
]

export function analyzeRisk(patient: PatientData): RiskResult {
  let score = 0
  const factors: { label: string; value: number; detail: string }[] = []

  // Blood pressure
  if (patient.systolic >= 180 || patient.diastolic >= 110) {
    score += 85
    factors.push({
      label: "Blood Pressure",
      value: 85,
      detail: "Critically High",
    })
  } else if (patient.systolic >= 140 || patient.diastolic >= 90) {
    score += 50
    factors.push({ label: "Blood Pressure", value: 50, detail: "Elevated" })
  } else {
    factors.push({ label: "Blood Pressure", value: 10, detail: "Normal" })
  }

  // Age
  if (patient.age >= 65) {
    score += 45
    factors.push({
      label: "Age",
      value: 45,
      detail: `${patient.age} years`,
    })
  } else if (patient.age >= 50) {
    score += 25
    factors.push({
      label: "Age",
      value: 25,
      detail: `${patient.age} years`,
    })
  } else {
    factors.push({
      label: "Age",
      value: 10,
      detail: `${patient.age} years`,
    })
  }

  // Chest pain
  if (patient.symptoms.includes("chest-pain")) {
    score += 30
    factors.push({
      label: "Chest Pain Symptom",
      value: 30,
      detail: "Present",
    })
  }

  // Heart disease
  if (patient.conditions.includes("heart-disease")) {
    score += 25
    factors.push({
      label: "Heart Disease History",
      value: 25,
      detail: "Pre-existing",
    })
  }

  // Heart rate
  if (patient.heartRate > 100 || patient.heartRate < 50) {
    score += 20
    factors.push({
      label: "Heart Rate",
      value: 20,
      detail: patient.heartRate > 100 ? "Elevated" : "Low",
    })
  }

  // Temperature
  if (patient.temperature >= 102) {
    score += 15
    factors.push({
      label: "Temperature",
      value: 15,
      detail: "High Fever",
    })
  } else if (patient.temperature >= 100) {
    score += 8
    factors.push({ label: "Temperature", value: 8, detail: "Mild Fever" })
  }

  // Other symptoms count
  const otherSymptoms = patient.symptoms.filter(
    (s) => s !== "chest-pain"
  ).length
  if (otherSymptoms >= 3) {
    score += 15
  } else if (otherSymptoms >= 1) {
    score += 5
  }

  // Conditions count
  if (patient.conditions.length >= 2) {
    score += 10
  }

  const sortedFactors = factors.sort((a, b) => b.value - a.value).slice(0, 5)

  let level: RiskLevel
  let confidence: number
  let source: "ML Model" | "Safety Rule Override" = "ML Model"

  if (
    score >= 120 ||
    (patient.systolic >= 180 && patient.symptoms.includes("chest-pain"))
  ) {
    level = "HIGH"
    confidence = Math.min(96, 82 + Math.floor(score / 20))
    if (patient.systolic >= 180 && patient.symptoms.includes("chest-pain")) {
      source = "Safety Rule Override"
    }
  } else if (score >= 60) {
    level = "MEDIUM"
    confidence = Math.min(92, 70 + Math.floor(score / 15))
  } else {
    level = "LOW"
    confidence = Math.min(95, 75 + Math.floor((100 - score) / 10))
  }

  const guidance =
    level === "HIGH"
      ? [
          "Sit or lie down immediately",
          "Avoid physical exertion",
          "Alert staff if pain worsens",
          "Do not eat or drink",
        ]
      : level === "MEDIUM"
        ? [
            "Rest in a comfortable position",
            "Stay hydrated with water",
            "Report any new symptoms",
            "Avoid strenuous activity",
          ]
        : [
            "Continue normal activities",
            "Stay hydrated",
            "Take over-the-counter medication if needed",
            "Return if symptoms worsen",
          ]

  const department =
    level === "HIGH"
      ? "EMERGENCY"
      : patient.symptoms.includes("chest-pain") ||
          patient.conditions.includes("heart-disease")
        ? "CARDIOLOGY"
        : patient.symptoms.includes("shortness-of-breath") ||
            patient.conditions.includes("asthma")
          ? "PULMONOLOGY"
          : "GENERAL MEDICINE"

  const waitTime =
    level === "HIGH"
      ? "<15 minutes"
      : level === "MEDIUM"
        ? "30-45 minutes"
        : "1-2 hours"

  return {
    level,
    confidence,
    source,
    factors: sortedFactors,
    guidance,
    department,
    waitTime,
  }
}
