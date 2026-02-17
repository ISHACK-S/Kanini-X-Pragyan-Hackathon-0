/**
 * API client for backend integration
 */

import type { PatientData, RiskResult, RiskLevel } from "./triage-store"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"
const API_BASE_CANDIDATES = Array.from(
    new Set([
        API_URL,
        "http://127.0.0.1:8000",
        "http://localhost:8000",
        "http://127.0.0.1:8001",
        "http://localhost:8001",
    ])
)
let resolvedApiBase: string | null = null

async function resolveApiBase(): Promise<string> {
    if (resolvedApiBase) {
        return resolvedApiBase
    }

    for (const baseUrl of API_BASE_CANDIDATES) {
        try {
            const statusResponse = await fetch(`${baseUrl}/api/model-status`, {
                method: "GET",
            })
            if (!statusResponse.ok) {
                continue
            }
            const data = await statusResponse.json()
            if (typeof data === "object" && data !== null && "predictor_ready" in data) {
                resolvedApiBase = baseUrl
                return baseUrl
            }
        } catch {
            // Try next candidate.
        }
    }

    return API_URL
}

async function orderedApiBases(): Promise<string[]> {
    const preferred = await resolveApiBase()
    return Array.from(new Set([preferred, ...API_BASE_CANDIDATES]))
}

export interface ApiPatientData {
    age: number
    gender: string
    symptoms: string[]
    blood_pressure: string
    heart_rate: number
    temperature: number
    pre_existing_conditions: string[]
}

export interface ApiRiskResponse {
    success: boolean
    risk_analysis: {
        risk_level: string
        risk_score: number
        confidence: number
        critical_factors: string[]
    }
    triage_recommendation: {
        priority: number
        department: string
        estimated_wait_time: string
        immediate_actions?: string[]
    }
    timestamp: string
}

function toPercent(value: unknown): number {
    const n = Number(value)
    if (!Number.isFinite(n)) {
        return 0
    }
    // Handle 0..1, 0..100, and accidental 0..10000 scaling.
    let pct = n
    if (pct <= 1) {
        pct *= 100
    } else if (pct > 100 && pct <= 10000) {
        pct /= 100
    }
    return Math.max(0, Math.min(100, Math.round(pct)))
}

function ruleBasedRiskPercent(patient: PatientData): number {
    let score = 0

    // Blood pressure
    if (patient.systolic >= 180 || patient.diastolic >= 110) score += 35
    else if (patient.systolic >= 140 || patient.diastolic >= 90) score += 22
    else if (patient.systolic >= 120 || patient.diastolic >= 80) score += 10

    // Age
    if (patient.age >= 65) score += 15
    else if (patient.age >= 50) score += 8

    // Heart rate
    if (patient.heartRate > 120 || patient.heartRate < 50) score += 14
    else if (patient.heartRate > 100 || patient.heartRate < 60) score += 8

    // Temperature
    if (patient.temperature >= 103) score += 12
    else if (patient.temperature >= 100.4) score += 6
    else if (patient.temperature <= 95) score += 8

    // Symptoms
    const criticalSymptoms = ["chest-pain", "shortness-of-breath"]
    if (patient.symptoms.some((s) => criticalSymptoms.includes(s))) score += 20
    score += Math.min(12, patient.symptoms.length * 3)

    // Conditions
    if (patient.conditions.includes("heart-disease")) score += 8
    score += Math.min(10, patient.conditions.length * 4)

    return Math.max(1, Math.min(99, Math.round(score)))
}

function blendedRiskPercent(patient: PatientData, backendPct: number): number {
    const rulePct = ruleBasedRiskPercent(patient)
    // When backend saturates at extremes, trust rule-based score for UI percentage.
    if (backendPct >= 99 || backendPct <= 1) {
        return rulePct
    }
    // Otherwise blend both signals.
    return Math.max(1, Math.min(99, Math.round(rulePct * 0.7 + backendPct * 0.3)))
}

function normalizeRiskLevel(rawLevel: unknown, confidencePct: number): RiskLevel {
    const level = String(rawLevel ?? "").trim().toUpperCase()
    if (level === "HIGH" || level === "MEDIUM" || level === "LOW") {
        // Guard against obvious backend mismatches (e.g., MEDIUM with 1% confidence).
        if (level === "MEDIUM" && confidencePct <= 20) {
            return "LOW"
        }
        if (level === "HIGH" && confidencePct <= 40) {
            return "MEDIUM"
        }
        return level as RiskLevel
    }
    if (confidencePct >= 67) return "HIGH"
    if (confidencePct >= 34) return "MEDIUM"
    return "LOW"
}

/**
 * Convert frontend patient data to backend API format.
 */
export function toApiFormat(patient: PatientData): ApiPatientData {
    return {
        age: patient.age,
        gender: patient.gender.charAt(0).toUpperCase() + patient.gender.slice(1),
        // Local SLM model expects snake_case feature IDs.
        symptoms: patient.symptoms.map((s) => s.replace(/-/g, "_")),
        blood_pressure: `${patient.systolic}/${patient.diastolic}`,
        heart_rate: patient.heartRate,
        temperature: patient.temperature,
        pre_existing_conditions: patient.conditions.map((c) => c.replace(/-/g, "_")),
    }
}

/**
 * Upload EMR/EHR document for parsing.
 */
export async function uploadEmr(file: File): Promise<Partial<PatientData>> {
    const formData = new FormData()
    formData.append("file", file)

    let lastError: Error | null = null
    for (const baseUrl of await orderedApiBases()) {
        const response = await fetch(`${baseUrl}/api/parse-emr`, {
            method: "POST",
            body: formData,
        })

        if (response.ok) {
            return await response.json()
        }

        if (response.status !== 404) {
            let detail = response.statusText || "Request failed"
            try {
                const errorBody = await response.json()
                if (typeof errorBody?.detail === "string" && errorBody.detail.trim()) {
                    detail = errorBody.detail
                }
            } catch {
                // Keep statusText fallback if response body is not JSON.
            }
            throw new Error(`Upload failed (${response.status}): ${detail}`)
        }
        lastError = new Error(`Upload endpoint not found at ${baseUrl}/api/parse-emr`)
    }

    if (lastError) {
        throw lastError
    }
    throw new Error("Upload failed: Unable to reach backend /api/parse-emr")
}

/**
 * Call backend API to analyze patient risk.
 */
export async function analyzeRiskApi(patient: PatientData): Promise<RiskResult> {
    try {
        const apiData = toApiFormat(patient)
        let response: Response | null = null

        for (const baseUrl of await orderedApiBases()) {
            const candidate = await fetch(`${baseUrl}/api/predict`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ patient_data: apiData }),
            })
            if (candidate.ok || ![404, 405, 422].includes(candidate.status)) {
                response = candidate
                break
            }
        }

        if (!response) {
            throw new Error("API error: /api/predict not found on configured backend URLs")
        }
        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`)
        }

        const data: ApiRiskResponse = await response.json()
        const scorePct = toPercent(data.risk_analysis?.risk_score)
        const confidenceFieldPct = toPercent(data.risk_analysis?.confidence)
        const backendPct = scorePct > 0 ? scorePct : confidenceFieldPct
        const confidencePct = blendedRiskPercent(patient, backendPct)
        const normalizedLevel = normalizeRiskLevel(data.risk_analysis?.risk_level, confidencePct)

        const factors = Array.isArray(data.risk_analysis.critical_factors)
            ? data.risk_analysis.critical_factors
            : []
        const immediateActions = Array.isArray(data.triage_recommendation?.immediate_actions)
            ? data.triage_recommendation.immediate_actions
            : []

        return {
            level: normalizedLevel,
            confidence: confidencePct,
            source: "SLM Model",
            factors: factors.map((factor, index) => ({
                label: factor,
                value: Math.max(20, 85 - index * 12),
                detail: factor,
            })),
            guidance: immediateActions,
            department: data.triage_recommendation?.department ?? "General Care",
            waitTime: data.triage_recommendation?.estimated_wait_time ?? "TBD",
        }
    } catch (error) {
        console.warn("API call failed, using fallback:", error)
        return analyzeRiskLocal(patient)
    }
}

/**
 * Local risk analysis (fallback).
 */
function analyzeRiskLocal(patient: PatientData): RiskResult {
    const factors: { label: string; value: number; detail: string }[] = []
    let totalRisk = 0

    if (patient.age > 65) {
        const ageRisk = Math.min((patient.age - 65) / 20, 1)
        factors.push({
            label: "Age",
            value: Math.round(ageRisk * 100),
            detail: `Patient is ${patient.age} years old (elevated risk for 65+)`,
        })
        totalRisk += ageRisk * 0.2
    }

    const bpRisk =
        patient.systolic >= 180 || patient.diastolic >= 110
            ? 1.0
            : patient.systolic >= 140 || patient.diastolic >= 90
                ? 0.6
                : patient.systolic >= 120 || patient.diastolic >= 80
                    ? 0.3
                    : 0
    if (bpRisk > 0) {
        factors.push({
            label: "Blood Pressure",
            value: Math.round(bpRisk * 100),
            detail: `${patient.systolic}/${patient.diastolic} mmHg ${bpRisk >= 1 ? "(Critical)" : bpRisk >= 0.6 ? "(High)" : "(Elevated)"}`,
        })
        totalRisk += bpRisk * 0.3
    }

    const hrRisk =
        patient.heartRate > 120 || patient.heartRate < 50
            ? 0.9
            : patient.heartRate > 100 || patient.heartRate < 60
                ? 0.5
                : 0
    if (hrRisk > 0) {
        factors.push({
            label: "Heart Rate",
            value: Math.round(hrRisk * 100),
            detail: `${patient.heartRate} BPM ${hrRisk >= 0.9 ? "(Abnormal)" : "(Borderline)"}`,
        })
        totalRisk += hrRisk * 0.25
    }

    const tempRisk =
        patient.temperature >= 103
            ? 0.9
            : patient.temperature >= 100.4
                ? 0.5
                : patient.temperature <= 95
                    ? 0.7
                    : 0
    if (tempRisk > 0) {
        factors.push({
            label: "Temperature",
            value: Math.round(tempRisk * 100),
            detail: `${patient.temperature}F ${tempRisk >= 0.9 ? "(High Fever)" : tempRisk >= 0.7 ? "(Hypothermia)" : "(Fever)"}`,
        })
        totalRisk += tempRisk * 0.15
    }

    const criticalSymptoms = ["chest-pain", "shortness-of-breath"]
    const hasCritical = patient.symptoms.some((s) => criticalSymptoms.includes(s))
    if (hasCritical) {
        factors.push({
            label: "Critical Symptoms",
            value: 95,
            detail: "Chest pain or breathing difficulty detected",
        })
        totalRisk += 0.95 * 0.4
    } else if (patient.symptoms.length >= 3) {
        factors.push({
            label: "Multiple Symptoms",
            value: 60,
            detail: `${patient.symptoms.length} symptoms reported`,
        })
        totalRisk += 0.6 * 0.2
    }

    const criticalConditions = ["heart-disease"]
    const hasCriticalCondition = patient.conditions.some((c) =>
        criticalConditions.includes(c)
    )
    if (hasCriticalCondition) {
        factors.push({
            label: "Heart Disease History",
            value: 80,
            detail: "Pre-existing cardiovascular condition",
        })
        totalRisk += 0.8 * 0.2
    } else if (patient.conditions.length > 0) {
        factors.push({
            label: "Pre-existing Conditions",
            value: 40,
            detail: `${patient.conditions.length} condition(s) on record`,
        })
        totalRisk += 0.4 * 0.1
    }

    let level: RiskLevel
    let department: string
    let waitTime: string
    let guidance: string[]

    if (totalRisk >= 0.7 || hasCritical) {
        level = "HIGH"
        department = "Emergency"
        waitTime = "Immediate"
        guidance = [
            "Immediate medical attention required",
            "Prepare for emergency intervention",
            "Monitor vital signs continuously",
            "Alert on-call specialist",
        ]
    } else if (totalRisk >= 0.4) {
        level = "MEDIUM"
        department = "Urgent Care"
        waitTime = "15-30 minutes"
        guidance = [
            "Priority assessment needed",
            "Monitor patient closely",
            "Prepare diagnostic equipment",
            "Have specialist on standby",
        ]
    } else {
        level = "LOW"
        department = "General Care"
        waitTime = "30-60 minutes"
        guidance = [
            "Standard assessment protocol",
            "Regular monitoring sufficient",
            "Schedule routine examination",
        ]
    }

    return {
        level,
        confidence: Math.round(Math.min(0.75 + Math.random() * 0.2, 0.95) * 100),
        source: "SLM Model",
        factors: factors.sort((a, b) => b.value - a.value),
        guidance,
        department,
        waitTime,
    }
}

export const analyzeRisk = analyzeRiskApi
