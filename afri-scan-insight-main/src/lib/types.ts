export type RiskLevel = "LOW" | "MODERATE" | "HIGH" | "UNSUPPORTED";
export type Classification =
  | "Normal"
  | "Suspicious"
  | "Critical"
  | "Uncertain"
  | "Unsupported";

export interface AnalysisResult {
  classification: Classification;
  confidence: number;
  riskLevel: RiskLevel;
  triageNote: string;
  explanation: string;
  suggestedTests: string[];
  nextSteps: string[];
  roiBox?: { x: number; y: number; width: number; height: number };

  //  AI heatmap overlay (base64 image)
  heatmapOverlay?: string;
}

export interface CaseReport {
  findings: string;
  impression: string;
  recommendation: string;
  generatedAt: string;
}

export interface Comment {
  id: string;
  doctorName: string;
  text: string;
  timestamp: string;
  isSecondOpinion?: boolean;
}

export interface SymptomData {
  coughOver2Weeks: boolean;
  fever: boolean;
  nightSweats: boolean;
  weightLoss: boolean;
  chestPain: boolean;
  fatigue: boolean;
  coughingBlood: boolean;
  knownTBContact: boolean;
  hivRisk: boolean;
  diabetes: boolean;
}

export interface CaseData {
  id: string;
  patientId: string;
  uploadDate: string;
  status: "Completed" | "Pending Review" | "In Progress";
  classification: Classification;
  riskLevel: RiskLevel;
  confidence: number;
  imageUrl: string;
  analysis: AnalysisResult;
  report: CaseReport;
  comments: Comment[];
  symptoms?: SymptomData;
}

export const defaultSymptoms: SymptomData = {
  coughOver2Weeks: false,
  fever: false,
  nightSweats: false,
  weightLoss: false,
  chestPain: false,
  fatigue: false,
  coughingBlood: false,
  knownTBContact: false,
  hivRisk: false,
  diabetes: false,
};

export function calculateSymptomRisk(symptoms: SymptomData): {
  risk: RiskLevel;
  score: number;
} {
  const weights: Record<keyof SymptomData, number> = {
    coughOver2Weeks: 3,
    fever: 2,
    nightSweats: 2,
    weightLoss: 2,
    chestPain: 1,
    fatigue: 1,
    coughingBlood: 3,
    knownTBContact: 3,
    hivRisk: 2,
    diabetes: 1,
  };

  let score = 0;

  for (const [key, val] of Object.entries(symptoms)) {
    if (val) score += weights[key as keyof SymptomData];
  }

  const maxScore = Object.values(weights).reduce((a, b) => a + b, 0);
  const pct = Math.round((score / maxScore) * 100);

  let risk: RiskLevel = "LOW";
  if (pct >= 50) risk = "HIGH";
  else if (pct >= 25) risk = "MODERATE";

  return { risk, score: pct };
}

export function calculateFinalTriage(
  aiRisk: RiskLevel,
  symptomRisk: RiskLevel,
): { level: RiskLevel; recommendation: string } {
  if (aiRisk === "HIGH" || symptomRisk === "HIGH") {
    return {
      level: "HIGH",
      recommendation:
        "Urgent clinical review and confirmatory TB testing recommended.",
    };
  }

  if (aiRisk === "MODERATE" || symptomRisk === "MODERATE") {
    return {
      level: "MODERATE",
      recommendation:
        "Schedule clinical review. Consider confirmatory testing based on clinical judgment.",
    };
  }

  return {
    level: "LOW",
    recommendation:
      "Routine follow-up. No immediate action required based on current findings.",
  };
}
