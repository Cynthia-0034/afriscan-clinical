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

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # tighten later
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")
MODEL_PATH = "tb_model_resnet18.pth"


# ---------- Model ----------
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


# ---------- Grad-CAM hooks ----------
feature_maps = None
gradients = None


def forward_hook(module, input, output):
    global feature_maps
    feature_maps = output


def backward_hook(module, grad_input, grad_output):
    global gradients
    gradients = grad_output[0]


target_layer = model.layer4[1].conv2
target_layer.register_forward_hook(forward_hook)
target_layer.register_full_backward_hook(backward_hook)


# ---------- Validation ----------
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
    usable_brightness = 40 < avg_brightness < 220
    reasonable_shape = 0.6 < aspect < 1.4

    return grayscale_like and usable_brightness and reasonable_shape


# ---------- Grad-CAM ----------
def generate_gradcam_from_pil(img: Image.Image):
    global feature_maps, gradients

    model.eval()
    original = np.array(img.convert("RGB"))

    input_tensor = transform(img).unsqueeze(0).to(DEVICE)
    output = model(input_tensor)
    score = output[0]

    model.zero_grad()
    score.backward()

    fmap = feature_maps.detach().cpu()[0]
    grad = gradients.detach().cpu()[0]

    weights = grad.mean(dim=(1, 2))

    cam = torch.zeros(fmap.shape[1:], dtype=torch.float32)
    for i, w in enumerate(weights):
        cam += w * fmap[i]

    cam = F.relu(cam)
    cam -= cam.min()
    cam /= (cam.max() + 1e-8)

    cam = cam.numpy()
    cam = cv2.resize(cam, (original.shape[1], original.shape[0]))

    return cam


def cam_to_roi(cam, threshold=0.6):
    mask = cam > threshold

    ys, xs = np.where(mask)
    if len(xs) == 0 or len(ys) == 0:
        return None

    x1, x2 = xs.min(), xs.max()
    y1, y2 = ys.min(), ys.max()

    h, w = cam.shape

    return {
        "x": round((x1 / w) * 100),
        "y": round((y1 / h) * 100),
        "width": round(((x2 - x1) / w) * 100),
        "height": round(((y2 - y1) / h) * 100),
    }


def generate_overlay_base64(img: Image.Image, cam):
    original = np.array(img.convert("RGB"))
    heatmap = np.uint8(255 * cam)
    heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)
    overlay = cv2.addWeighted(original, 0.65, heatmap, 0.35, 0)

    success, buffer = cv2.imencode(".png", cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    if not success:
        return None

    return base64.b64encode(buffer).decode("utf-8")


# ---------- Condition + Medical Report ----------
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
        triage_note = "No strong high-risk abnormality detected on this chest X-ray."
        explanation = (
            "The model found low evidence of tuberculosis-pattern abnormality. "
            "No strong focal suspicious region was identified."
        )
        findings = (
            "Chest X-ray shows no strong abnormality pattern flagged by the AI model. "
            "No high-risk focal lung opacity pattern was identified."
        )
        impression = (
            "Low AI suspicion for active pulmonary tuberculosis. "
            "Imaging appearance is closer to a non-critical or normal pattern."
        )
        recommendation = (
            "Correlate with symptoms and clinical history. "
            "If symptoms persist, consider clinician review and follow-up imaging or laboratory testing."
        )
        suggested_tests = [
            "Routine clinical review",
            "Follow-up imaging if symptoms persist",
        ]
        next_steps = [
            "Correlate with symptoms",
            "Monitor patient clinically",
            "Escalate only if symptoms or exposure history suggest TB",
        ]

    elif prob < 0.70:
        triage_note = "Moderate abnormality detected. Further clinical review is recommended."
        explanation = (
            "The model identified lung image patterns that may represent tuberculosis or another infectious process "
            "such as pneumonia. The pattern is abnormal but not definitively high-risk."
        )
        findings = (
            "AI analysis detected suspicious lung-region abnormality with intermediate confidence. "
            "Pattern may represent infectious or inflammatory change."
        )
        impression = (
            "Moderate AI suspicion for pulmonary infection. "
            "Differential includes tuberculosis and pneumonia depending on symptoms and clinical context."
        )
        recommendation = (
            "Clinical evaluation is recommended together with confirmatory testing. "
            "Consider GeneXpert MTB/RIF and correlate with cough duration, fever, weight loss, and exposure history."
        )
        suggested_tests = [
            "GeneXpert MTB/RIF",
            "AFB Smear",
            "Clinical examination",
            "CBC / inflammatory markers if indicated",
        ]
        next_steps = [
            "Review symptoms and exposure history",
            "Order confirmatory TB testing",
            "Consider pneumonia in differential diagnosis",
        ]

    else:
        triage_note = "High-risk abnormality detected. Urgent clinician review is advised."
        explanation = (
            "The model identified strong lung-region patterns associated with tuberculosis-like abnormality. "
            "This requires urgent clinical correlation and confirmatory testing."
        )
        findings = (
            "AI analysis detected high-confidence abnormal lung pattern in a suspicious lung region. "
            "Findings are concerning for tuberculosis-pattern disease."
        )
        impression = (
            "High AI suspicion for active pulmonary tuberculosis-pattern abnormality."
        )
        recommendation = (
            "Urgent clinical review is recommended. "
            "Proceed with confirmatory testing such as GeneXpert MTB/RIF, AFB smear, and further infection control measures where appropriate."
        )
        suggested_tests = [
            "GeneXpert MTB/RIF (Urgent)",
            "AFB Smear",
            "Sputum Culture",
            "Clinical review / isolation assessment",
        ]
        next_steps = [
            "Urgent clinician review",
            "Order urgent confirmatory TB testing",
            "Consider infection prevention precautions",
        ]

    return {
        **base,
        "triageNote": triage_note,
        "explanation": explanation,
        "findings": findings,
        "impression": impression,
        "recommendation": recommendation,
        "suggestedTests": suggested_tests,
        "nextSteps": next_steps,
    }


# ---------- Routes ----------
@app.get("/health")
def health():
    return {"ok": True, "device": str(DEVICE)}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    contents = await file.read()

    try:
        img = Image.open(io.BytesIO(contents)).convert("RGB")
    except Exception:
        return {
            "supported": False,
            "error": "Could not read uploaded image."
        }

    if not looks_like_chest_xray(img):
        return {
            "supported": False,
            "error": "Unsupported image. This system currently supports frontal chest X-rays only."
        }

    x = transform(img).unsqueeze(0).to(DEVICE)

    with torch.no_grad():
        logits = model(x)
        prob = torch.sigmoid(logits).item()

    result = build_medical_report(prob)
    result["supported"] = True
    result["tb_probability"] = round(prob, 4)

    cam = generate_gradcam_from_pil(img)
    result["roiBox"] = cam_to_roi(cam, threshold=0.6)
    result["heatmapOverlay"] = generate_overlay_base64(img, cam)

    return result