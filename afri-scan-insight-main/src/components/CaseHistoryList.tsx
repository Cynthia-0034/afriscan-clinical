import { CaseData } from "@/lib/types";
import RiskBadge from "./RiskBadge";
import { useNavigate } from "react-router-dom";
import { ChevronRight, FileImage } from "lucide-react";
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
        <p className="text-sm font-medium text-muted-foreground">No cases yet</p>
        <p className="text-xs text-muted-foreground/70 mt-0.5">Upload a chest X-ray to get started.</p>
      </div>
    );
  }

  return (
    <div className="card-clinical divide-y overflow-hidden">
      {displayed.map((c) => (
        <button
          key={c.id}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-accent/40 transition-colors text-left"
          onClick={() => navigate(`/case/${c.id}`)}
        >
          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <span className="text-[9px] font-bold text-muted-foreground uppercase">CXR</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-foreground">{c.id}</span>
              <RiskBadge level={c.riskLevel} />
            </div>
            <p className="text-[11px] text-muted-foreground mt-0.5 truncate">
              {c.classification} • {c.confidence}% • {format(new Date(c.uploadDate), "MMM d, yyyy")}
            </p>
          </div>
          <span className={`hidden sm:inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-md ${
            c.status === "Completed" ? "bg-risk-low-bg text-risk-low border border-risk-low/20" :
            c.status === "Pending Review" ? "bg-risk-moderate-bg text-risk-moderate border border-risk-moderate/20" :
            "bg-accent text-accent-foreground border"
          }`}>
            {c.status}
          </span>
          <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/50" />
        </button>
      ))}
    </div>
  );
};

export default CaseHistoryList;
