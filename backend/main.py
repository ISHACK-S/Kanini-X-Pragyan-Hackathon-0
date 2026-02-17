import io
import json
import os
import re
import sys
import zipfile
from html import unescape
from typing import Any, Dict, List, Optional

MODELS_DIR = os.getenv("MODELS_DIR", r"C:\Users\ISHACK\Downloads\models")
OLLAMA_URL = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
OLLAMA_MODEL = os.getenv("EMR_LLM_MODEL", "llama3.2:3b")

try:
    import pdfplumber
except Exception:
    pdfplumber = None

try:
    import fitz  # type: ignore
except Exception:
    fitz = None

try:
    from PIL import Image
except Exception:
    Image = None

try:
    import pytesseract
except Exception:
    pytesseract = None

try:
    import requests
except Exception:
    requests = None
from fastapi import FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

if pytesseract is not None:
    tesseract_cmd = os.getenv("TESSERACT_CMD", r"C:\Program Files\Tesseract-OCR\tesseract.exe")
    if os.path.exists(tesseract_cmd):
        pytesseract.pytesseract.tesseract_cmd = tesseract_cmd

sys.path.append(MODELS_DIR)

predictor = None
predictor_error = None

SYMPTOM_ALIASES = {
    "fever": {"fever", "pyrexia", "high temperature"},
    "chest-pain": {"chest pain", "chest-pain", "chest_pain"},
    "shortness-of-breath": {
        "shortness of breath",
        "shortness-of-breath",
        "shortness_of_breath",
        "sob",
        "dyspnea",
    },
    "fatigue": {"fatigue", "tiredness", "weakness"},
    "headache": {"headache", "migraine"},
    "nausea": {"nausea", "nauseous", "vomiting"},
    "dizziness": {"dizziness", "lightheadedness", "vertigo"},
    "abdominal-pain": {"abdominal pain", "abd pain", "stomach pain", "abdominal-pain"},
}

CONDITION_ALIASES = {
    "diabetes": {"diabetes", "dm", "type 2 diabetes", "type 1 diabetes"},
    "hypertension": {"hypertension", "high blood pressure", "htn"},
    "asthma": {"asthma"},
    "heart-disease": {"heart disease", "cad", "coronary artery disease", "heart-disease"},
}


def _load_predictor() -> None:
    global predictor, predictor_error
    try:
        from predict import RiskPredictor  # type: ignore
        predictor = RiskPredictor(models_dir=MODELS_DIR)
        predictor_error = None
    except Exception as exc:
        predictor = None
        predictor_error = str(exc)
        print(f"Predictor initialization failed: {exc}")


def _to_confidence_pct(raw: Any) -> float:
    try:
        value = float(raw)
    except Exception:
        return 0.0

    if value <= 1:
        value *= 100.0
    return max(0.0, min(value, 100.0))


def _normalize_spaces(value: str) -> str:
    return re.sub(r"\s+", " ", value.strip().lower())


def _normalize_to_dashboard_id(raw: str, aliases: Dict[str, set]) -> Optional[str]:
    token = _normalize_spaces(raw).replace("_", "-")
    for canonical, options in aliases.items():
        option_set = {opt.lower() for opt in options}
        if token == canonical or token in option_set:
            return canonical
    return None


def _to_model_symptom(raw: str) -> str:
    canonical = _normalize_to_dashboard_id(raw, SYMPTOM_ALIASES)
    if canonical:
        return canonical.replace("-", "_")
    return raw.strip().lower().replace(" ", "_").replace("-", "_")


def _to_model_condition(raw: str) -> str:
    canonical = _normalize_to_dashboard_id(raw, CONDITION_ALIASES)
    if canonical:
        return canonical.replace("-", "_")
    return raw.strip().lower().replace(" ", "_").replace("-", "_")


def _extract_text_from_docx(contents: bytes) -> str:
    with zipfile.ZipFile(io.BytesIO(contents)) as zip_file:
        xml_bytes = zip_file.read("word/document.xml")
    xml_text = xml_bytes.decode("utf-8", errors="ignore")
    xml_text = xml_text.replace("</w:p>", "\n")
    plain_text = re.sub(r"<[^>]+>", " ", xml_text)
    return unescape(re.sub(r"\s+", " ", plain_text)).strip()


def _extract_text_from_image_ocr(contents: bytes) -> str:
    if Image is None or pytesseract is None:
        return ""
    try:
        with Image.open(io.BytesIO(contents)) as img:
            return pytesseract.image_to_string(img).strip()
    except Exception:
        return ""


def _extract_text_from_pdf_ocr(contents: bytes, max_pages: int = 3) -> str:
    if fitz is None or Image is None or pytesseract is None:
        return ""
    extracted_pages: List[str] = []
    try:
        with fitz.open(stream=contents, filetype="pdf") as pdf:
            page_limit = min(pdf.page_count, max_pages)
            for i in range(page_limit):
                page = pdf.load_page(i)
                pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
                page_image = Image.open(io.BytesIO(pix.tobytes("png")))
                page_text = pytesseract.image_to_string(page_image).strip()
                if page_text:
                    extracted_pages.append(page_text)
    except Exception:
        return ""
    return "\n".join(extracted_pages).strip()


def _extract_document_text(file_name: str, contents: bytes) -> str:
    lower_name = (file_name or "").lower()
    if lower_name.endswith(".pdf"):
        text = ""
        if pdfplumber is not None:
            with pdfplumber.open(io.BytesIO(contents)) as pdf:
                text = "\n".join(
                    page.extract_text() for page in pdf.pages if page.extract_text()
                ).strip()
        if text:
            return text

        ocr_text = _extract_text_from_pdf_ocr(contents)
        if ocr_text:
            return ocr_text

        raise HTTPException(
            status_code=400,
            detail=(
                "Could not extract text from PDF. Install pdfplumber for digital PDFs "
                "or install pytesseract + Pillow + PyMuPDF with Tesseract OCR for scanned PDFs."
            ),
        )
    if lower_name.endswith(".docx"):
        return _extract_text_from_docx(contents)
    if lower_name.endswith((".txt", ".csv", ".json", ".xml")):
        return contents.decode("utf-8", errors="ignore").strip()
    if lower_name.endswith(".doc"):
        return contents.decode("latin-1", errors="ignore").strip()
    if lower_name.endswith((".png", ".jpg", ".jpeg", ".webp", ".bmp", ".tiff", ".tif")):
        ocr_text = _extract_text_from_image_ocr(contents)
        if ocr_text:
            return ocr_text
        raise HTTPException(
            status_code=400,
            detail=(
                "Could not extract text from image. Install pytesseract + Pillow and "
                "ensure Tesseract OCR is installed."
            ),
        )
    raise HTTPException(
        status_code=400,
        detail="Unsupported file format. Use PDF, TXT, DOC, DOCX, CSV, JSON, XML, or image files.",
    )


def _extract_ids_from_text(text: str, aliases: Dict[str, set]) -> List[str]:
    lowered = text.lower()
    matched = []
    for canonical, options in aliases.items():
        for option in options:
            if option in lowered:
                matched.append(canonical)
                break
    return matched


def _extract_structured_emr(text: str) -> Dict[str, Any]:
    lowered = text.lower()
    extracted: Dict[str, Any] = {}

    age_match = re.search(r"\bage\s*[:\-]?\s*(\d{1,3})\b", lowered)
    if age_match:
        age = int(age_match.group(1))
        extracted["age"] = max(0, min(age, 120))

    if re.search(r"\bmale\b", lowered):
        extracted["gender"] = "male"
    elif re.search(r"\bfemale\b", lowered):
        extracted["gender"] = "female"

    bp_match = re.search(
        r"(?:blood\s*pressure|bp)\s*[:\-]?\s*(\d{2,3})\s*/\s*(\d{2,3})", lowered
    )
    if bp_match:
        extracted["systolic"] = int(bp_match.group(1))
        extracted["diastolic"] = int(bp_match.group(2))

    hr_match = re.search(r"(?:heart\s*rate|pulse)\s*[:\-]?\s*(\d{2,3})", lowered)
    if hr_match:
        extracted["heartRate"] = int(hr_match.group(1))

    temp_match = re.search(
        r"(?:temperature|temp)\s*[:\-]?\s*(\d{2,3}(?:\.\d+)?)\s*([fc])?", lowered
    )
    if temp_match:
        raw_temp = float(temp_match.group(1))
        unit = temp_match.group(2) or "f"
        extracted["temperature"] = (
            round((raw_temp * 9 / 5) + 32, 1) if unit == "c" else raw_temp
        )

    symptoms = _extract_ids_from_text(text, SYMPTOM_ALIASES)
    if symptoms:
        extracted["symptoms"] = symptoms

    conditions = _extract_ids_from_text(text, CONDITION_ALIASES)
    if conditions:
        extracted["conditions"] = conditions

    return extracted


def _validate_extracted_partial(data: Dict[str, Any]) -> Dict[str, Any]:
    validated: Dict[str, Any] = {}

    if "age" in data:
        try:
            validated["age"] = max(0, min(int(data.get("age")), 120))
        except Exception:
            pass

    if "gender" in data:
        gender_raw = str(data.get("gender", "")).strip().lower()
        if gender_raw in {"male", "female", "other"}:
            validated["gender"] = gender_raw

    normalized_symptoms: List[str] = []
    for raw in data.get("symptoms", []):
        if not isinstance(raw, str):
            continue
        match = _normalize_to_dashboard_id(raw, SYMPTOM_ALIASES)
        if match and match not in normalized_symptoms:
            normalized_symptoms.append(match)
    if normalized_symptoms:
        validated["symptoms"] = normalized_symptoms

    normalized_conditions: List[str] = []
    for raw in data.get("conditions", []):
        if not isinstance(raw, str):
            continue
        match = _normalize_to_dashboard_id(raw, CONDITION_ALIASES)
        if match and match not in normalized_conditions:
            normalized_conditions.append(match)
    if normalized_conditions:
        validated["conditions"] = normalized_conditions

    if "systolic" in data:
        try:
            validated["systolic"] = max(60, min(int(data.get("systolic")), 300))
        except Exception:
            pass

    if "diastolic" in data:
        try:
            validated["diastolic"] = max(30, min(int(data.get("diastolic")), 200))
        except Exception:
            pass

    if "heartRate" in data:
        try:
            validated["heartRate"] = max(20, min(int(data.get("heartRate")), 250))
        except Exception:
            pass

    if "temperature" in data:
        try:
            validated["temperature"] = max(85, min(float(data.get("temperature")), 110))
        except Exception:
            pass

    return validated


def _llm_extract_emr(text: str) -> Optional[Dict[str, Any]]:
    prompt = f"""
Extract structured patient data from this EMR/EHR.
Return JSON only with keys:
age, gender, symptoms, systolic, diastolic, heartRate, temperature, conditions

Rules:
- gender must be one of: male, female, other
- symptoms IDs: fever, chest-pain, shortness-of-breath, fatigue, headache, nausea, dizziness, abdominal-pain
- conditions IDs: diabetes, hypertension, asthma, heart-disease
- if missing, keep field absent

EMR TEXT:
{text}
"""
    try:
        if requests is None:
            return None
        response = requests.post(
            OLLAMA_URL,
            json={
                "model": OLLAMA_MODEL,
                "prompt": prompt,
                "stream": False,
                "format": "json",
            },
            timeout=20,
        )
        if response.status_code != 200:
            return None
        payload = response.json()
        raw = payload.get("response")
        if not raw:
            return None
        parsed = json.loads(raw)
        return _validate_extracted_partial(parsed)
    except Exception:
        return None


_load_predictor()

app = FastAPI(title="Hospital Triage API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/model-status")
async def model_status() -> Dict[str, Any]:
    return {
        "predictor_ready": predictor is not None,
        "models_dir": MODELS_DIR,
        "predictor_error": predictor_error,
        "llm_endpoint": OLLAMA_URL,
        "llm_model": OLLAMA_MODEL,
    }


@app.post("/api/predict")
async def predict(data: Dict[str, Any]) -> Dict[str, Any]:
    if predictor is None:
        raise HTTPException(
            status_code=500,
            detail=f"Predictor not initialized. Check models path: {MODELS_DIR}",
        )

    patient_data = data.get("patient_data")
    if not isinstance(patient_data, dict):
        raise HTTPException(status_code=400, detail="Missing patient_data")

    normalized = {
        "age": patient_data.get("age", 30),
        "gender": patient_data.get("gender", "Other"),
        "symptoms": [_to_model_symptom(s) for s in patient_data.get("symptoms", [])],
        "blood_pressure": patient_data.get("blood_pressure", "120/80"),
        "heart_rate": patient_data.get("heart_rate", 75),
        "temperature": patient_data.get("temperature", 98.6),
        "pre_existing_conditions": [
            _to_model_condition(c) for c in patient_data.get("pre_existing_conditions", [])
        ],
    }

    result = predictor.predict_risk(normalized)
    risk_level = str(result.get("risk_level", "Unknown"))
    risk_level_lower = risk_level.lower()
    raw_confidence = result.get("confidence", 0)
    raw_score = (
        result.get("risk_score")
        or result.get("score")
        or result.get("probability")
        or raw_confidence
    )
    confidence_pct = _to_confidence_pct(raw_confidence)
    risk_score_pct = _to_confidence_pct(raw_score)
    if risk_score_pct <= 0:
        risk_score_pct = confidence_pct
    if confidence_pct <= 0:
        confidence_pct = risk_score_pct

    response = {
        "success": "error" not in result,
        "risk_analysis": {
            "risk_level": risk_level_lower,
            "risk_score": risk_score_pct,
            "confidence": confidence_pct / 100.0,
            "critical_factors": [item["factor"] for item in result.get("top_factors", [])],
        },
        "triage_recommendation": {
            "priority": 1 if risk_level == "High" else 2 if risk_level == "Medium" else 3,
            "department": result.get("department", "General Medicine"),
            "estimated_wait_time": (
                "Immediate"
                if risk_level == "High"
                else "15-30 mins" if risk_level == "Medium" else "30-60 mins"
            ),
            "immediate_actions": result.get("safety_guidance", []),
        },
        "timestamp": result.get("timestamp"),
        "normalized_input": normalized,
    }
    return response


@app.post("/api/parse-emr")
async def parse_emr(file: UploadFile = File(...)) -> Dict[str, Any]:
    contents = await file.read()
    if not contents:
        raise HTTPException(status_code=400, detail="Uploaded file is empty")

    text = _extract_document_text(file.filename or "", contents)
    if not text:
        raise HTTPException(status_code=400, detail="Could not extract text from file")

    deterministic = _extract_structured_emr(text)
    llm_result = _llm_extract_emr(text)

    merged = deterministic.copy()
    if llm_result:
        for key, value in llm_result.items():
            if value not in (None, "", [], {}):
                merged[key] = value

    merged = _validate_extracted_partial(merged)
    if not merged:
        raise HTTPException(
            status_code=422,
            detail="No supported patient fields were found in the uploaded document.",
        )
    return merged


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
