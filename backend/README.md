# Backend Setup

## 1) Install dependencies

```powershell
cd backend
python -m pip install -r requirements.txt
```

For OCR on images/scanned PDFs, also install Tesseract OCR for Windows:
- Default path used by backend: `C:\Program Files\Tesseract-OCR\tesseract.exe`
- If installed elsewhere:

```powershell
$env:TESSERACT_CMD="D:\Tools\Tesseract-OCR\tesseract.exe"
```

## 2) Configure model path (optional)

If your model path is not `C:\Users\ISHACK\Downloads\models`, set:

```powershell
$env:MODELS_DIR="C:\Users\ISHACK\Downloads\models"
```

## 3) Optional local LLM for EMR/EHR extraction

If you run Ollama locally:

```powershell
$env:OLLAMA_URL="http://localhost:11434/api/generate"
$env:EMR_LLM_MODEL="llama3.2:3b"
```

## 4) Start API

```powershell
python main.py
```

API endpoints:
- `POST /api/predict`
- `POST /api/parse-emr`
- `GET /api/model-status`
