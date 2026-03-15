import { useState, useCallback } from "react";
import {
  Upload,
  ImageIcon,
  CheckCircle2,
  Loader2,
  XCircle,
  RotateCcw,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface UploadCardProps {
  onAnalysisComplete: (file: File, imageUrl: string) => void;
}

type UploadState = "idle" | "validating" | "supported" | "unsupported";

const UploadCard = ({ onAnalysisComplete }: UploadCardProps) => {
  const [state, setState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");

  const isLikelyChestXray = async (file: File): Promise<boolean> => {
    const ext = file.name.toLowerCase().split(".").pop();

    if (!["jpg", "jpeg", "png", "webp", "dcm", "dicom"].includes(ext || "")) {
      return false;
    }

    // Allow DICOM for now
    if (ext === "dcm" || ext === "dicom") return true;

    return new Promise((resolve) => {
      const img = new Image();
      const url = URL.createObjectURL(file);

      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;

        const ctx = canvas.getContext("2d");
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(false);
          return;
        }

        ctx.drawImage(img, 0, 0);

        const { data } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        let colorDiffTotal = 0;
        let brightnessTotal = 0;
        const pixelCount = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          colorDiffTotal += Math.abs(r - g) + Math.abs(g - b) + Math.abs(r - b);
          brightnessTotal += (r + g + b) / 3;
        }

        const avgColorDiff = colorDiffTotal / pixelCount;
        const avgBrightness = brightnessTotal / pixelCount;

        URL.revokeObjectURL(url);

        // Chest X-rays are usually grayscale-ish and not too dark/bright
        const grayscaleLike = avgColorDiff < 25;
        const usableBrightness = avgBrightness > 40 && avgBrightness < 220;

        resolve(grayscaleLike && usableBrightness);
      };

      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(false);
      };

      img.src = url;
    });
  };

  const processFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setState("validating");

      setTimeout(async () => {
        const supported = await isLikelyChestXray(file);
        setState(supported ? "supported" : "unsupported");

        if (supported) {
          const imageUrl = URL.createObjectURL(file);
          onAnalysisComplete(file, imageUrl);
        }
      }, 1500);
    },
    [onAnalysisComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) processFile(file);
    },
    [processFile],
  );

  const reset = () => {
    setState("idle");
    setFileName("");
  };

  if (state === "validating") {
    return (
      <div className="card-clinical border-primary/20 p-8 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Validating image…
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
            {fileName}
          </p>
        </div>
      </div>
    );
  }

  if (state === "unsupported") {
    return (
      <div className="card-clinical border-risk-moderate/25 p-8">
        <div className="flex flex-col items-center gap-4 max-w-lg mx-auto">
          <div className="w-14 h-14 rounded-2xl bg-risk-moderate-bg flex items-center justify-center border border-risk-moderate/20">
            <XCircle className="w-6 h-6 text-risk-moderate" />
          </div>
          <div className="text-center">
            <p className="text-base font-bold text-foreground">
              Unsupported Image
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              This prototype supports{" "}
              <span className="font-semibold text-foreground">
                frontal chest X-rays only
              </span>
              .
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              "{fileName}" could not be validated.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={reset}
            className="gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Try Another Image
          </Button>
        </div>
      </div>
    );
  }

  if (state === "supported") {
    return (
      <div className="card-clinical border-risk-low/25 p-8 flex flex-col items-center gap-3">
        <div className="w-14 h-14 rounded-2xl bg-risk-low-bg flex items-center justify-center border border-risk-low/20">
          <CheckCircle2 className="w-6 h-6 text-risk-low" />
        </div>
        <p className="text-sm font-bold text-foreground">
          Image Validated — Proceeding to analysis…
        </p>
        <p className="text-xs text-muted-foreground truncate max-w-[250px]">
          {fileName}
        </p>
      </div>
    );
  }

  return (
    <label
      className={`card-clinical border-dashed border-2 transition-all cursor-pointer block ${
        dragOver
          ? "border-primary bg-accent/40 shadow-md"
          : "border-border hover:border-primary/30 hover:bg-accent/20"
      }`}
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept="image/*,.dcm"
        className="hidden"
        onChange={handleFileSelect}
      />
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
          <Upload className="w-6 h-6 text-primary" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Upload Chest X-ray
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Drag & drop or click to browse
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground bg-secondary px-3 py-1 rounded-full">
          <ImageIcon className="w-3 h-3" />
          PA/AP Chest X-rays Only • JPG, PNG, DICOM
        </div>
      </div>
    </label>
  );
};

export default UploadCard;
