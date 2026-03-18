import { CaseData } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FileImage, Clock3 } from "lucide-react";
import { format } from "date-fns";

interface CaseHistoryListProps {
  cases: CaseData[];
  limit?: number;
}

const CaseHistoryList = ({ cases, limit }: CaseHistoryListProps) => {
  const navigate = useNavigate();
  const displayed = limit ? cases.slice(0, limit) : cases;

  if (displayed.length === 0) {
    return (
      <div className="card-clinical flex flex-col items-center justify-center py-12 text-center">
        <FileImage className="w-8 h-8 text-muted-foreground/30 mb-2" />
        <p className="text-sm font-medium text-muted-foreground">
          No cases yet
        </p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">
          Upload a chest X-ray to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {displayed.map((c) => (
        <button
          key={c.id}
          className="card-clinical w-full text-left overflow-hidden hover:shadow-md transition-all hover:-translate-y-px"
          onClick={() => navigate(`/case/${c.id}`)}
        >
          <div className="flex flex-col sm:flex-row">
            {/* Thumbnail */}
            <div className="relative w-full sm:w-36 h-28 shrink-0 bg-muted overflow-hidden">
              <img
                src={c.imageUrl}
                alt={`Case ${c.id}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2">
                <span className="text-[9px] font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur px-2 py-1 rounded-full">
                  CXR
                </span>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1 px-4 py-3.5 min-w-0">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-foreground">
                      {c.id}
                    </span>
                    <RiskBadge level={c.riskLevel} />
                  </div>

                  <p className="text-[11px] text-muted-foreground mt-1 flex items-center gap-1.5">
                    <Clock3 className="w-3 h-3" />
                    {format(new Date(c.uploadDate), "MMM d, yyyy")}
                    <span>•</span>
                    <span>{c.classification}</span>
                    <span>•</span>
                    <span>{c.confidence}% confidence</span>
                  </p>
                </div>

                <span
                  className={`inline-flex self-start text-[10px] font-semibold px-2.5 py-1 rounded-md ${
                    c.status === "Completed"
                      ? "bg-risk-low-bg text-risk-low border border-risk-low/20"
                      : c.status === "Pending Review"
                        ? "bg-risk-moderate-bg text-risk-moderate border border-risk-moderate/20"
                        : "bg-accent text-accent-foreground border"
                  }`}
                >
                  {c.status}
                </span>
              </div>

              <div className="mt-3 rounded-lg bg-secondary/60 px-3 py-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-1">
                  AI Summary
                </p>
                <p className="text-xs text-foreground leading-relaxed line-clamp-2">
                  {c.analysis?.explanation ||
                    "No AI summary available for this case."}
                </p>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground">
                  View full case details
                </span>
                <span className="text-[11px] font-medium text-muted-foreground hover:text-primary flex items-center gap-1">
                  Open <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
};

export default CaseHistoryList;
