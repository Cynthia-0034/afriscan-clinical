import { useEffect, useMemo, useState } from "react";
import { RiskLevel, calculateFinalTriage } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import { Target, ArrowRight, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface FinalTriageProps {
  caseId: string;
  aiRisk: RiskLevel;
  symptomRisk: RiskLevel;
}

type ReviewDecision =
  | "Needs Review"
  | "Monitor"
  | "Urgent Escalation"
  | "TB Workup Recommended";

interface SavedReviewState {
  decision: ReviewDecision;
  note: string;
}

const FinalTriage = ({ caseId, aiRisk, symptomRisk }: FinalTriageProps) => {
  const { level, recommendation } = calculateFinalTriage(aiRisk, symptomRisk);

  const storageKey = useMemo(() => `afri_scan_case_review_${caseId}`, [caseId]);

  const [decision, setDecision] = useState<ReviewDecision>("Needs Review");
  const [note, setNote] = useState("");

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw) as SavedReviewState;
        setDecision(saved.decision);
        setNote(saved.note);
      } else {
        if (level === "HIGH") setDecision("Urgent Escalation");
        else if (level === "MODERATE") setDecision("TB Workup Recommended");
        else setDecision("Monitor");
      }
    } catch {
      if (level === "HIGH") setDecision("Urgent Escalation");
      else if (level === "MODERATE") setDecision("TB Workup Recommended");
      else setDecision("Monitor");
    }
  }, [level, storageKey]);

  const saveReview = () => {
    const payload: SavedReviewState = {
      decision,
      note,
    };
    localStorage.setItem(storageKey, JSON.stringify(payload));
  };

  const borderColor =
    level === "HIGH"
      ? "border-risk-high/30"
      : level === "MODERATE"
        ? "border-risk-moderate/30"
        : "border-risk-low/30";

  const decisionBadgeClass =
    decision === "Urgent Escalation"
      ? "bg-risk-high-bg border border-risk-high/20 text-risk-high"
      : decision === "TB Workup Recommended"
        ? "bg-risk-moderate-bg border border-risk-moderate/20 text-risk-moderate"
        : decision === "Monitor"
          ? "bg-risk-low-bg border border-risk-low/20 text-risk-low"
          : "bg-accent border text-foreground";

  return (
    <div className={`card-clinical ${borderColor}`}>
      {/* Header */}
      <div className="px-5 py-3.5 border-b flex items-center gap-2">
        <Target className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">
          Final Clinical Triage
        </h3>
      </div>

      {/* Risk breakdown */}
      <div className="px-5 py-4 space-y-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              AI Risk
            </p>
            <RiskBadge level={aiRisk} size="md" />
          </div>

          <div className="text-center space-y-1.5 flex flex-col items-center justify-center">
            <ArrowRight className="w-4 h-4 text-muted-foreground/40" />
          </div>

          <div className="text-center space-y-1.5">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
              Symptom Risk
            </p>
            <RiskBadge level={symptomRisk} size="md" />
          </div>
        </div>

        {/* Combined triage */}
        <div
          className={`rounded-lg p-4 text-center ${
            level === "HIGH"
              ? "bg-risk-high-bg border border-risk-high/20"
              : level === "MODERATE"
                ? "bg-risk-moderate-bg border border-risk-moderate/20"
                : "bg-risk-low-bg border border-risk-low/20"
          }`}
        >
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Combined Triage Level
          </p>
          <RiskBadge level={level} size="lg" />
        </div>

        <div className="bg-secondary/60 rounded-lg p-3">
          <p className="text-xs text-foreground leading-relaxed">
            {recommendation}
          </p>
        </div>

        {/* Doctor decision */}
        <div className="border-t pt-4 space-y-3">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-4 h-4 text-primary" />
            <h4 className="text-xs font-bold text-foreground">
              Clinician Decision
            </h4>
          </div>

          <div className="grid grid-cols-2 gap-2">
            {(
              [
                "Needs Review",
                "Monitor",
                "Urgent Escalation",
                "TB Workup Recommended",
              ] as ReviewDecision[]
            ).map((option) => (
              <button
                key={option}
                onClick={() => setDecision(option)}
                className={`text-xs px-3 py-2 rounded-lg border transition-all text-left ${
                  decision === option
                    ? "border-primary bg-accent text-foreground shadow-sm"
                    : "border-border bg-background hover:bg-accent/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>

          <div
            className={`rounded-lg px-3 py-2 text-xs font-medium ${decisionBadgeClass}`}
          >
            Final Review Status: {decision}
          </div>

          <Textarea
            placeholder="Add clinician review note..."
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="text-xs min-h-[84px] resize-none"
          />

          <Button size="sm" onClick={saveReview} className="h-8 text-xs px-3">
            Save Review Decision
          </Button>
        </div>
      </div>
    </div>
  );
};

export default FinalTriage;
