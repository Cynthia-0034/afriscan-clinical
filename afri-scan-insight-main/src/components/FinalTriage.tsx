import { RiskLevel, calculateFinalTriage } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import { Target, ArrowRight } from "lucide-react";

interface FinalTriageProps {
  aiRisk: RiskLevel;
  symptomRisk: RiskLevel;
}

const FinalTriage = ({ aiRisk, symptomRisk }: FinalTriageProps) => {
  const { level, recommendation } = calculateFinalTriage(aiRisk, symptomRisk);

  const borderColor =
    level === "HIGH" ? "border-risk-high/30" :
    level === "MODERATE" ? "border-risk-moderate/30" :
    "border-risk-low/30";

  return (
    <div className={`card-clinical ${borderColor}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Final Clinical Triage</h3>
      </div>

      {/* Risk breakdown */}
      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">AI Risk</p>
            <RiskBadge level={aiRisk} size="md" />
          </div>
          <div className="text-center space-y-1.5 flex flex-col items-center justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
          </div>
          <div className="text-center space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Symptom Risk</p>
            <RiskBadge level={symptomRisk} size="md" />
          </div>
        </div>

        {/* Final result — prominent */}
        <div className={`rounded-lg p-4 text-center ${
          level === "HIGH" ? "bg-risk-high-bg border border-risk-high/20" :
          level === "MODERATE" ? "bg-risk-moderate-bg border border-risk-moderate/20" :
          "bg-risk-low-bg border border-risk-low/20"
        }`}>
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Combined Triage Level</p>
          <RiskBadge level={level} size="lg" />
        </div>

        <div className="bg-secondary/60 rounded-lg p-3">
          <p className="text-xs text-foreground leading-relaxed">{recommendation}</p>
        </div>
      </div>
    </div>
  );
};

export default FinalTriage;
