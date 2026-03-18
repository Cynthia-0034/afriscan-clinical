import AppHeader from "@/components/AppHeader";
import UploadCard from "@/components/UploadCard";
import DemoCases from "@/components/DemoCases";
import CaseHistoryList from "@/components/CaseHistoryList";
import Disclaimer from "@/components/Disclaimer";
import { demoCases } from "@/lib/mockData";
import { addUploadedCase, getUploadedCases } from "@/lib/storage";
import { CaseData, defaultSymptoms } from "@/lib/types";
import { BarChart3, AlertTriangle, Clock, Scan } from "lucide-react";
import { useNavigate } from "react-router-dom";

const metrics = [
  {
    label: "Total Cases",
    value: "3",
    icon: BarChart3,
    accent: "bg-accent text-primary",
  },
  {
    label: "High Risk",
    value: "1",
    icon: AlertTriangle,
    accent: "bg-risk-high-bg text-risk-high",
  },
  {
    label: "Pending Review",
    value: "1",
    icon: Clock,
    accent: "bg-risk-moderate-bg text-risk-moderate",
  },
  {
    label: "Modality",
    value: "CXR",
    icon: Scan,
    accent: "bg-accent text-primary",
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleAnalysisComplete = async (file: File, imageUrl: string) => {
    const id = `CASE-${Date.now()}`;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const API_BASE =
        import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

      const res = await fetch(`${API_BASE}/predict`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!data.supported) {
        alert(
          data.error ||
            "Unsupported image. Please upload a frontal chest X-ray.",
        );
        return;
      }

      const newCase: CaseData = {
        id,
        patientId: `PT-${Math.floor(Math.random() * 9000) + 1000}`,
        uploadDate: new Date().toISOString(),
        status: "Completed",
        classification: data.classification,
        riskLevel: data.riskLevel,
        confidence: data.confidence,
        imageUrl,
        report: {
          findings:
            data.findings ||
            `TB probability: ${Math.round((data.tb_probability || 0) * 100)}%.`,
          impression:
            data.impression ||
            data.explanation ||
            "Model-generated impression.",
          recommendation:
            data.recommendation ||
            "Clinical correlation and confirmatory testing recommended.",
          generatedAt: new Date().toISOString(),
        },
        analysis: {
          classification: data.classification,
          confidence: data.confidence,
          riskLevel: data.riskLevel,
          triageNote: data.triageNote,
          explanation: `${data.condition}. ${data.explanation}`,
          suggestedTests: data.suggestedTests || [],
          nextSteps: data.nextSteps || [],
          roiBox: data.roiBox,
          heatmapOverlay: data.heatmapOverlay,
        },
        comments: [],
        symptoms: defaultSymptoms,
      };

      addUploadedCase(newCase);
      navigate(`/case/${id}`);
    } catch (error) {
      console.error("Backend prediction failed:", error);
      alert("Could not connect to the TB model backend.");
    }
  };

  const uploadedCases = getUploadedCases();
  const allCases = [...uploadedCases, ...demoCases];

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-5 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {metrics.map((m) => (
            <div
              key={m.label}
              className="card-clinical flex items-center gap-3 px-4 py-3.5"
            >
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${m.accent}`}
              >
                <m.icon className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="text-lg font-bold text-foreground leading-tight">
                  {m.value}
                </p>
              </div>
            </div>
          ))}
        </div>

        <section>
          <p className="section-heading">Upload & Analyze</p>
          <UploadCard onAnalysisComplete={handleAnalysisComplete} />
        </section>

        <section>
          <p className="section-heading">Demo Cases</p>
          <DemoCases />
        </section>

        <section>
          <p className="section-heading">Recent Cases</p>
          <CaseHistoryList cases={allCases} />
        </section>

        <Disclaimer />
      </main>
    </div>
  );
};

export default Dashboard;
