import { CaseData } from "@/lib/types";
import { Shield, Stethoscope, ClipboardList, FileText } from "lucide-react";
import RiskBadge from "./RiskBadge";

interface AnalysisPanelProps {
  caseData: CaseData;
}

const AnalysisPanel = ({ caseData }: AnalysisPanelProps) => {
  const { analysis } = caseData;

  return (
    <div className="space-y-3">
      {/* Classification & Confidence */}
      <div className="card-clinical">
        <div className="px-5 py-3.5 border-b flex items-center gap-2">
          <Shield className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">AI Analysis</h3>
        </div>
        <div className="px-5 py-4 space-y-3.5">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Classification</span>
            <span className="text-sm font-bold text-foreground">{analysis.classification}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Confidence</span>
            <div className="flex items-center gap-2.5">
              <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${analysis.confidence}%`,
                    backgroundColor:
                      analysis.riskLevel === "HIGH" ? "hsl(var(--risk-high))" :
                      analysis.riskLevel === "MODERATE" ? "hsl(var(--risk-moderate))" :
                      "hsl(var(--risk-low))",
                  }}
                />
              </div>
              <span className="text-xs font-bold text-foreground w-8 text-right">{analysis.confidence}%</span>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Risk Level</span>
            <RiskBadge level={analysis.riskLevel} size="md" />
          </div>
        </div>
      </div>

      {/* Triage Note */}
      <div className="card-clinical">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <Stethoscope className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Triage Note</h3>
        </div>
        <div className="px-5 py-3.5">
          <p className="text-xs text-foreground leading-relaxed">{analysis.triageNote}</p>
        </div>
      </div>

      {/* Suggested Tests */}
      <div className="card-clinical">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <ClipboardList className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Suggested Tests</h3>
        </div>
        <div className="px-5 py-3.5">
          <ul className="space-y-1.5">
            {analysis.suggestedTests.map((test, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="w-1 h-1 rounded-full bg-primary mt-1.5 shrink-0" />
                {test}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Next Steps */}
      <div className="card-clinical">
        <div className="px-5 py-3 border-b flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-xs font-bold text-foreground">Next Steps</h3>
        </div>
        <div className="px-5 py-3.5">
          <ol className="space-y-1.5">
            {analysis.nextSteps.map((step, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                <span className="w-4 h-4 rounded bg-accent text-accent-foreground flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
};

export default AnalysisPanel;
