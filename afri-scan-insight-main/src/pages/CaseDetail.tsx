import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { demoCases } from "@/lib/mockData";
import { getCaseById } from "@/lib/storage";
import {
  calculateSymptomRisk,
  defaultSymptoms,
  SymptomData,
} from "@/lib/types";
import AppHeader from "@/components/AppHeader";
import ScanViewer from "@/components/ScanViewer";
import AnalysisPanel from "@/components/AnalysisPanel";
import ReportPanel from "@/components/ReportPanel";
import SymptomChecker from "@/components/SymptomChecker";
import FinalTriage from "@/components/FinalTriage";
import CollaborationPanel from "@/components/CollaborationPanel";
import Disclaimer from "@/components/Disclaimer";
import RiskBadge from "@/components/RiskBadge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { format } from "date-fns";

const CaseDetail = () => {
  const { caseId } = useParams();
  const navigate = useNavigate();
  const caseData = demoCases.find((c) => c.id === caseId) || getCaseById(caseId || "");

  const [symptoms, setSymptoms] = useState<SymptomData>(
    caseData?.symptoms || defaultSymptoms,
  );

  if (!caseData) {
    return (
      <div className="min-h-screen bg-background">
        <AppHeader />
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <p className="text-base font-bold text-foreground mb-1">
            Case Not Found
          </p>
          <p className="text-sm text-muted-foreground mb-4">
            "{caseId}" does not exist.
          </p>
          <Button size="sm" onClick={() => navigate("/")}>
            Back to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  const { risk: symptomRisk } = calculateSymptomRisk(symptoms);

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-5">
        {/* Breadcrumb + case meta */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate("/")}
              className="h-7 px-2 text-xs text-muted-foreground hover:text-foreground gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Dashboard
            </Button>
            <span className="text-border">|</span>
            <h2 className="text-sm font-bold text-foreground">{caseData.id}</h2>
            <RiskBadge level={caseData.riskLevel} />
          </div>
          <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" /> {caseData.patientId}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />{" "}
              {format(new Date(caseData.uploadDate), "MMM d, yyyy")}
            </span>
          </div>
        </div>

        {/* ─── Main workspace: Scan + Analysis ─── */}
        <div className="grid lg:grid-cols-5 gap-4">
          <div className="lg:col-span-3">
            <ScanViewer caseData={caseData} />
          </div>
          <div className="lg:col-span-2">
            <AnalysisPanel caseData={caseData} />
          </div>
        </div>

        {/* ─── Report ─── */}
        <ReportPanel report={caseData.report} caseId={caseData.id} />

        {/* ─── Symptom Checker + Final Triage (side by side, prominent) ─── */}
        <div className="grid lg:grid-cols-2 gap-4">
          <div>
            <p className="section-heading">Symptom Assessment</p>
            <SymptomChecker
              initialSymptoms={symptoms}
              onSymptomsChange={setSymptoms}
            />
          </div>
          <div className="space-y-4">
            <div>
              <p className="section-heading">Clinical Triage Decision</p>
              <FinalTriage
                aiRisk={caseData.analysis.riskLevel}
                symptomRisk={symptomRisk}
              />
            </div>
            <div>
              <p className="section-heading">Team Collaboration</p>
              <CollaborationPanel comments={caseData.comments} />
            </div>
          </div>
        </div>

        <Disclaimer />
      </main>
    </div>
  );
};

export default CaseDetail;
