import { CaseData } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ScanViewerProps {
  caseData: CaseData;
}

const ScanViewer = ({ caseData }: ScanViewerProps) => {
  const { analysis } = caseData;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-semibold">Scan Viewer</CardTitle>
        <p className="text-xs text-muted-foreground">
          {caseData.id} • {caseData.patientId}
        </p>
      </CardHeader>

      <CardContent className="p-4">
        <div className="relative bg-foreground/5 rounded-lg aspect-square max-h-[500px] flex items-center justify-center overflow-hidden">
          {/* Real uploaded/demo image */}
          <img
            src={caseData.imageUrl}
            alt={`Scan for ${caseData.id}`}
            className="w-full h-full object-contain rounded-lg"
          />

          {/* ROI overlay */}
          {analysis.roiBox && (
            <div
              className="absolute border-2 rounded-md animate-pulse"
              style={{
                left: `${analysis.roiBox.x}%`,
                top: `${analysis.roiBox.y}%`,
                width: `${analysis.roiBox.width}%`,
                height: `${analysis.roiBox.height}%`,
                borderColor:
                  analysis.riskLevel === "HIGH"
                    ? "hsl(var(--risk-high))"
                    : "hsl(var(--risk-moderate))",
                backgroundColor:
                  analysis.riskLevel === "HIGH"
                    ? "hsl(var(--risk-high) / 0.1)"
                    : "hsl(var(--risk-moderate) / 0.1)",
              }}
            >
              <span
                className="absolute -top-6 left-0 text-[10px] font-semibold px-2 py-0.5 rounded"
                style={{
                  backgroundColor:
                    analysis.riskLevel === "HIGH"
                      ? "hsl(var(--risk-high))"
                      : "hsl(var(--risk-moderate))",
                  color: "white",
                }}
              >
                ROI Detected
              </span>
            </div>
          )}

          {/* Normal / no ROI state */}
          {!analysis.roiBox && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
              <span
                className="text-xs font-medium px-3 py-1 rounded-full"
                style={{
                  backgroundColor: "hsl(var(--risk-low) / 0.15)",
                  color: "hsl(var(--risk-low))",
                }}
              >
                No abnormalities detected
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ScanViewer;
