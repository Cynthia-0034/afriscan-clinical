import { useNavigate } from "react-router-dom";
import { demoCases } from "@/lib/mockData";
import RiskBadge from "./RiskBadge";
import { Zap, ArrowRight } from "lucide-react";

const demoCaseLabels: Record<string, { label: string; desc: string }> = {
  "CASE-2026-001": { label: "TB Demo Case", desc: "Active pulmonary tuberculosis with cavitary disease" },
  "CASE-2026-002": { label: "Pneumonia Demo Case", desc: "Right lower lobe consolidation, bacterial pneumonia suspected" },
  "CASE-2026-003": { label: "Normal Demo Case", desc: "Clear lung fields, no significant abnormalities" },
};

const DemoCases = () => {
  const navigate = useNavigate();

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      {demoCases.map((c) => {
        const meta = demoCaseLabels[c.id];
        return (
          <button
            key={c.id}
            className="card-clinical text-left p-4 hover:shadow-md transition-all hover:-translate-y-px group"
            onClick={() => navigate(`/case/${c.id}`)}
          >
            <div className="flex items-center gap-1.5 mb-2.5">
              <Zap className="w-3.5 h-3.5 text-primary" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-primary">Demo</span>
            </div>
            <h3 className="text-sm font-bold text-foreground mb-0.5">{meta?.label || c.id}</h3>
            <p className="text-[11px] text-muted-foreground leading-snug mb-3 line-clamp-2">{meta?.desc}</p>
            <div className="flex items-center justify-between">
              <RiskBadge level={c.riskLevel} />
              <span className="text-[11px] text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                Review <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default DemoCases;
