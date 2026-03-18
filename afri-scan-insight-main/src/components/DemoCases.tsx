import { useNavigate } from "react-router-dom";
import { demoCases } from "@/lib/mockData";
import RiskBadge from "./RiskBadge";
import { Zap, ArrowRight } from "lucide-react";

const demoCaseLabels: Record<string, { label: string; desc: string }> = {
  "CASE-DEMO-TB": {
    label: "TB Demo Case",
    desc: "High-risk tuberculosis-pattern abnormality with urgent review recommendation.",
  },
  "CASE-DEMO-PNEUMONIA": {
    label: "Pneumonia Demo Case",
    desc: "Moderate infectious lung abnormality with pneumonia vs TB differential.",
  },
  "CASE-DEMO-NORMAL": {
    label: "Normal Demo Case",
    desc: "Low-risk chest scan with no significant abnormality detected.",
  },
};

const DemoCases = () => {
  const navigate = useNavigate();

  return (
    <div className="grid sm:grid-cols-3 gap-4">
      {demoCases.map((c) => {
        const meta = demoCaseLabels[c.id];

        return (
          <button
            key={c.id}
            className="card-clinical text-left overflow-hidden p-0 hover:shadow-lg transition-all hover:-translate-y-1 group"
            onClick={() => navigate(`/case/${c.id}`)}
          >
            {/* Image preview */}
            <div className="relative h-40 w-full overflow-hidden bg-muted">
              <img
                src={c.imageUrl}
                alt={meta?.label || c.id}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-transparent" />

              <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 rounded-full bg-background/90 backdrop-blur px-2.5 py-1">
                <Zap className="w-3.5 h-3.5 text-primary" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Demo
                </span>
              </div>

              <div className="absolute bottom-3 left-3 right-3">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="text-sm font-bold text-white">
                    {meta?.label || c.id}
                  </h3>
                  <RiskBadge level={c.riskLevel} />
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-3">
              <p className="text-[11px] text-muted-foreground leading-snug line-clamp-2 min-h-[32px]">
                {meta?.desc}
              </p>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg bg-secondary/70 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Classification
                  </p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {c.classification}
                  </p>
                </div>

                <div className="rounded-lg bg-secondary/70 px-3 py-2">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Confidence
                  </p>
                  <p className="text-xs font-bold text-foreground mt-0.5">
                    {c.confidence}%
                  </p>
                </div>
              </div>

              <div className="rounded-lg border bg-background px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  AI Summary
                </p>
                <p className="text-xs text-foreground leading-relaxed line-clamp-3">
                  {c.analysis.explanation}
                </p>
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-muted-foreground">
                  Open full analysis
                </span>
                <span className="text-[11px] font-medium text-muted-foreground group-hover:text-primary transition-colors flex items-center gap-1">
                  Review <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default DemoCases;
