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
  onAnalysisComplete: (file: File, imageUrl: string) => void | Promise<void>;
}

type UploadState = "idle" | "validating" | "supported" | "unsupported";

const UploadCard = ({ onAnalysisComplete }: UploadCardProps) => {
  const [state, setState] = useState<UploadState>("idle");
  const [dragOver, setDragOver] = useState(false);
  const [fileName, setFileName] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const isImageLike = (file: File): boolean => {
    const type = file.type?.toLowerCase() || "";
    const name = file.name.toLowerCase();
    const ext = name.split(".").pop() || "";

    if (type.startsWith("image/")) return true;
    return ["jpg", "jpeg", "png", "webp", "bmp", "dcm", "dicom"].includes(ext);
  };

  const processFile = useCallback(
    async (file: File) => {
      setFileName(file.name);
      setErrorMessage("");

      if (!isImageLike(file)) {
        setState("unsupported");
        setErrorMessage("Please upload an image file or chest X-ray file.");
        return;
      }

      setState("validating");

      try {
        const imageUrl = URL.createObjectURL(file);

        // Don't block based on filename or heuristics anymore.
        // Let the backend perform the real validation.
        setTimeout(async () => {
          setState("supported");
          await onAnalysisComplete(file, imageUrl);
        }, 800);
      } catch (error) {
        console.error("Upload preparation failed:", error);
        setState("unsupported");
        setErrorMessage("Could not prepare the uploaded image.");
      }
    },
    [onAnalysisComplete],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) void processFile(file);
    },
    [processFile],
  );

  const reset = () => {
    setState("idle");
    setFileName("");
    setErrorMessage("");
  };

  if (state === "validating") {
    return (
      <div className="card-clinical border-primary/20 p-8 flex flex-col items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-accent flex items-center justify-center">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-foreground">
            Preparing image…
          </p>
          <p className="text-xs text-muted-foreground mt-1 truncate max-w-[250px]">
            {fileName}
          </p>
        </div>
        <div className="w-48 h-1 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-primary rounded-full animate-pulse"
            style={{ width: "65%" }}
          />
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
              Unsupported File
            </p>
            <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
              {errorMessage || "Please upload a valid image file."}
            </p>
            <p className="text-xs text-muted-foreground mt-1 italic">
              "{fileName}" could not be processed.
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
          Image accepted — sending to AI analysis…
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
        accept="image/*,.dcm,.dicom"
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
          JPG, PNG, DICOM
        </div>
      </div>
    </label>
  );
};

export default UploadCard;
