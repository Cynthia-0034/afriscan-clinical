import { CaseReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2 } from "lucide-react";
import { format } from "date-fns";

interface ReportPanelProps {
  report: CaseReport;
  caseId: string;
}

const ReportPanel = ({ report, caseId }: ReportPanelProps) => (
  <div className="card-clinical">
    <div className="px-5 py-3.5 border-b flex items-center justify-between">
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-foreground">Structured Report</h3>
      </div>
      <div className="flex gap-1.5">
        <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5 gap-1">
          <Download className="w-3 h-3" /> PDF
        </Button>
        <Button variant="outline" size="sm" className="h-7 text-[11px] px-2.5 gap-1">
          <Share2 className="w-3 h-3" /> Share
        </Button>
      </div>
    </div>
    <div className="px-5 py-4 space-y-4">
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Findings</p>
        <p className="text-xs text-foreground leading-relaxed">{report.findings}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Impression</p>
        <p className="text-xs text-foreground leading-relaxed">{report.impression}</p>
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Recommendation</p>
        <p className="text-xs text-foreground leading-relaxed">{report.recommendation}</p>
      </div>
      <div className="pt-3 border-t flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Case {caseId}</span>
        <span>{format(new Date(report.generatedAt), "MMM d, yyyy 'at' h:mm a")}</span>
      </div>
    </div>
  </div>
);

export default ReportPanel;
