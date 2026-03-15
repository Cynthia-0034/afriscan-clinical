import { useState } from "react";
import { SymptomData, defaultSymptoms, calculateSymptomRisk } from "@/lib/types";
import { Switch } from "@/components/ui/switch";
import { Heart } from "lucide-react";
import RiskBadge from "./RiskBadge";

interface SymptomCheckerProps {
  initialSymptoms?: SymptomData;
  onSymptomsChange?: (symptoms: SymptomData) => void;
}

const symptomLabels: Record<keyof SymptomData, { label: string; critical?: boolean }> = {
  coughOver2Weeks: { label: "Cough > 2 weeks", critical: true },
  fever: { label: "Fever" },
  nightSweats: { label: "Night sweats" },
  weightLoss: { label: "Unexplained weight loss" },
  chestPain: { label: "Chest pain" },
  fatigue: { label: "Fatigue / malaise" },
  coughingBlood: { label: "Hemoptysis (coughing blood)", critical: true },
  knownTBContact: { label: "Known TB contact", critical: true },
  hivRisk: { label: "HIV risk / immunosuppression" },
  diabetes: { label: "Diabetes" },
};

const SymptomChecker = ({ initialSymptoms, onSymptomsChange }: SymptomCheckerProps) => {
  const [symptoms, setSymptoms] = useState<SymptomData>(initialSymptoms || defaultSymptoms);

  const toggle = (key: keyof SymptomData) => {
    const updated = { ...symptoms, [key]: !symptoms[key] };
    setSymptoms(updated);
    onSymptomsChange?.(updated);
  };

  const { risk, score } = calculateSymptomRisk(symptoms);
  const activeCount = Object.values(symptoms).filter(Boolean).length;

  return (
    <div className="card-clinical">
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center gap-2">
        <Heart className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Symptom Checker</h3>
        <span className="ml-auto text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          {activeCount} active
        </span>
      </div>

      {/* Symptom toggles */}
      <div className="px-5 py-3 divide-y">
        {(Object.keys(symptomLabels) as Array<keyof SymptomData>).map((key) => {
          const meta = symptomLabels[key];
          return (
            <div key={key} className="flex items-center justify-between py-2.5">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-foreground">{meta.label}</span>
                {meta.critical && (
                  <span className="text-[9px] font-bold uppercase tracking-widest text-risk-high bg-risk-high-bg px-1.5 py-px rounded">Key</span>
                )}
              </div>
              <Switch checked={symptoms[key]} onCheckedChange={() => toggle(key)} />
            </div>
          );
        })}
      </div>

      {/* Summary */}
      <div className="px-5 py-4 bg-secondary/50 border-t space-y-2.5">
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">Symptom Score</span>
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${score}%`,
                  backgroundColor:
                    risk === "HIGH" ? "hsl(var(--risk-high))" :
                    risk === "MODERATE" ? "hsl(var(--risk-moderate))" :
                    "hsl(var(--risk-low))",
                }}
              />
            </div>
            <span className="text-xs font-bold text-foreground w-8 text-right">{score}%</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">TB Symptom Risk</span>
          <RiskBadge level={risk} size="md" />
        </div>
      </div>
    </div>
  );
};

export default SymptomChecker;
