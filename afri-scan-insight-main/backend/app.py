from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import torch.nn.functional as F
import cv2
import io
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

    fmap = feature_maps.detach().cpu()[0]   # [C, H, W]
    grad = gradients.detach().cpu()[0]      # [C, H, W]

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


# ---------- Risk Mapping ----------
def map_prediction(prob: float):
    if prob < 0.35:
        return {
            "classification": "Normal",
            "riskLevel": "LOW",
            "confidence": round((1 - prob) * 100, 1),
            "triageNote": "No strong TB-like abnormality detected by the model.",
            "explanation": "Model prediction suggests low TB probability.",
            "suggestedTests": ["Routine clinical review"],
            "nextSteps": [
                "Correlate with symptoms",
                "Routine follow-up if needed"
            ],
        }
    elif prob < 0.70:
        return {
            "classification": "Suspicious",
            "riskLevel": "MODERATE",
            "confidence": round(prob * 100, 1),
            "triageNote": "Moderate TB suspicion detected. Clinical review recommended.",
            "explanation": "Model found image patterns that may be associated with TB.",
            "suggestedTests": ["GeneXpert MTB/RIF", "AFB Smear"],
            "nextSteps": [
                "Review symptoms and exposure history",
                "Order confirmatory testing"
            ],
        }
    else:
        return {
            "classification": "Critical",
            "riskLevel": "HIGH",
            "confidence": round(prob * 100, 1),
            "triageNote": "High TB suspicion detected. Urgent review recommended.",
            "explanation": "Model found strong TB-like image patterns.",
            "suggestedTests": ["GeneXpert MTB/RIF (Urgent)", "AFB Smear", "Sputum Culture"],
            "nextSteps": [
                "Urgent clinician review",
                "Order urgent confirmatory testing",
                "Consider infection control precautions"
            ],
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

    result = map_prediction(prob)
    result["supported"] = True
    result["tb_probability"] = round(prob, 4)

    cam = generate_gradcam_from_pil(img)
    result["roiBox"] = cam_to_roi(cam, threshold=0.6)

    return result