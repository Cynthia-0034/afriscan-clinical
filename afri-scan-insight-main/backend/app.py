from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch.nn.functional as F
import cv2
import io
import base64
import numpy as np
import torch
import torch.nn as nn
from torchvision import transforms, models

app = FastAPI(title="AfriScan TB Backend")

# ✅ FIXED CORS (LOCAL + VERCEL)
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:8080",
        "http://localhost:8081",
        "http://localhost:8082",
        "https://afriscan-clinical-k0qphs1fk.vercel.app",
    ],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "tb_model_resnet18.pth"


# ---------- MODEL ----------
def build_model():
    model = models.resnet18(weights=None)
    num_features = model.fc.in_features

    model.fc = nn.Sequential(
        nn.Dropout(0.3),
        nn.Linear(num_features, 1)
    )

    model.load_state_dict(torch.load(MODEL_PATH, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    return model


model = build_model()

transform = transforms.Compose([
    transforms.Grayscale(num_output_channels=3),
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.5, 0.5, 0.5], [0.5, 0.5, 0.5]),
])


# ---------- VALIDATION ----------
def looks_like_chest_xray(img: Image.Image) -> bool:
    arr = np.array(img.convert("RGB")).astype(np.float32)

    color_diff = np.mean(
        np.abs(arr[:, :, 0] - arr[:, :, 1]) +
        np.abs(arr[:, :, 1] - arr[:, :, 2]) +
        np.abs(arr[:, :, 0] - arr[:, :, 2])
    )

    gray = arr.mean(axis=2)
    avg_brightness = gray.mean()

    h, w = gray.shape
    aspect = w / h if h > 0 else 1

    grayscale_like = color_diff < 25
    usable_brightness = 20 < avg_brightness < 235
    reasonable_shape = 0.5 < aspect < 1.6

    return grayscale_like and usable_brightness and reasonable_shape


# ---------- CONDITION LOGIC ----------
def derive_condition(prob: float):
    if prob < 0.35:
        return {
            "condition": "No significant abnormal lung pattern detected",
            "classification": "Normal",
            "riskLevel": "LOW",
            "confidence": round((1 - prob) * 100, 1),
        }
    elif prob < 0.70:
        return {
            "condition": "Possible infectious lung abnormality (TB vs pneumonia)",
            "classification": "Suspicious",
            "riskLevel": "MODERATE",
            "confidence": round(prob * 100, 1),
        }
    else:
        return {
            "condition": "Likely tuberculosis-pattern abnormality",
            "classification": "Critical",
            "riskLevel": "HIGH",
            "confidence": round(prob * 100, 1),
        }


def build_medical_report(prob: float):
    base = derive_condition(prob)

    if prob < 0.35:
        return {
            **base,
            "triageNote": "Low-risk scan. No strong abnormality detected.",
            "explanation": "Model found minimal abnormal lung pattern.",
            "findings": "No strong abnormalities detected.",
            "impression": "Low suspicion for TB.",
            "recommendation": "Clinical correlation if symptoms persist.",
            "suggestedTests": ["Routine check"],
            "nextSteps": ["Monitor patient"],
        }

    elif prob < 0.70:
        return {
            **base,
            "triageNote": "Moderate abnormality detected.",
            "explanation": "Pattern could indicate TB or pneumonia.",
            "findings": "Suspicious lung region detected.",
            "impression": "Moderate infection risk.",
            "recommendation": "Perform confirmatory testing.",
            "suggestedTests": ["GeneXpert", "AFB Smear"],
            "nextSteps": ["Review symptoms", "Order tests"],
        }

    else:
        return {
            **base,
            "triageNote": "High-risk abnormality detected.",
            "explanation": "Strong TB-like pattern detected.",
            "findings": "High-confidence abnormal lung region.",
            "impression": "High suspicion for TB.",
            "recommendation": "Urgent clinical review.",
            "suggestedTests": ["GeneXpert", "AFB", "Culture"],
            "nextSteps": ["Immediate testing", "Isolation precautions"],
        }


# ---------- ROUTES ----------
@app.get("/health")
def health():
    return {"ok": True, "device": str(DEVICE)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    print("1. Request received")

    contents = await file.read()
    print("2. File read")

    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
        print("3. Image opened")
    except Exception:
        return {
            "supported": False,
            "error": "Could not read uploaded image."
        }

    warning = None
    if not looks_like_chest_xray(img):
        warning = "Image may not be a standard chest X-ray"
    print("4. Validation done")

    x = transform(img).unsqueeze(0).to(DEVICE)
    print("5. Transform done")

    with torch.no_grad():
        logits = model(x)
        prob = torch.sigmoid(logits).item()

    print("6. Prediction done", prob)

    result = build_medical_report(prob)
    result["supported"] = True
    result["tb_probability"] = round(prob, 4)

    if warning:
        result["warning"] = warning

    # 🔥 Grad-CAM disabled for speed (re-enable later)
    result["roiBox"] = None
    result["heatmapOverlay"] = None

    print("7. Returning response")

    return result