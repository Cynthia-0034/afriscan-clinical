import { CaseReport } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { FileText, Download, Share2 } from "lucide-react";
import { format } from "date-fns";

interface ReportPanelProps {
  report: CaseReport;
  caseId: string;
}

const ReportPanel = ({ report, caseId }: ReportPanelProps) => {
  const generatedAt = format(
    new Date(report.generatedAt),
    "MMM d, yyyy 'at' h:mm a",
  );

  const handleExportPdf = () => {
    const printWindow = window.open("", "_blank", "width=900,height=700");
    if (!printWindow) {
      alert("Popup blocked. Please allow popups to export the PDF.");
      return;
    }

    const html = `
      <html>
        <head>
          <title>AfriScan Report - ${caseId}</title>
          <style>
            body {
              font-family: Arial, Helvetica, sans-serif;
              padding: 32px;
              color: #111827;
              line-height: 1.5;
            }
            .header {
              border-bottom: 2px solid #e5e7eb;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            .title {
              font-size: 22px;
              font-weight: 700;
              margin: 0 0 6px 0;
            }
            .sub {
              font-size: 12px;
              color: #6b7280;
              margin: 0;
            }
            .section {
              margin-bottom: 22px;
            }
            .label {
              font-size: 11px;
              font-weight: 700;
              text-transform: uppercase;
              letter-spacing: 0.08em;
              color: #6b7280;
              margin-bottom: 6px;
            }
            .text {
              font-size: 14px;
              margin: 0;
              white-space: pre-wrap;
            }
            .footer {
              border-top: 1px solid #e5e7eb;
              padding-top: 14px;
              margin-top: 28px;
              font-size: 12px;
              color: #6b7280;
              display: flex;
              justify-content: space-between;
              gap: 16px;
            }
            @media print {
              body {
                padding: 24px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <p class="title">AfriScan Clinical Report</p>
            <p class="sub">Case ID: ${caseId}</p>
            <p class="sub">Generated: ${generatedAt}</p>
          </div>

          <div class="section">
            <div class="label">Findings</div>
            <p class="text">${report.findings}</p>
          </div>

          <div class="section">
            <div class="label">Impression</div>
            <p class="text">${report.impression}</p>
          </div>

          <div class="section">
            <div class="label">Recommendation</div>
            <p class="text">${report.recommendation}</p>
          </div>

          <div class="footer">
            <span>AfriScan Nova</span>
            <span>Clinical decision support prototype</span>
          </div>
        </body>
      </html>
    `;

    printWindow.document.open();
    printWindow.document.write(html);
    printWindow.document.close();

    printWindow.onload = () => {
      printWindow.focus();
      printWindow.print();
    };
  };

  const handleShare = async () => {
    const shareText = `AfriScan Clinical Report

Case ID: ${caseId}
Generated: ${generatedAt}

Findings:
${report.findings}

Impression:
${report.impression}

Recommendation:
${report.recommendation}
`;

    try {
      if (navigator.share) {
        await navigator.share({
          title: `AfriScan Report - ${caseId}`,
          text: shareText,
        });
      } else {
        await navigator.clipboard.writeText(shareText);
        alert("Report copied to clipboard.");
      }
    } catch {
      try {
        await navigator.clipboard.writeText(shareText);
        alert("Report copied to clipboard.");
      } catch {
        alert("Could not share the report.");
      }
    }
  };

  return (
    <div className="card-clinical">
      <div className="px-5 py-3.5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            Structured Report
          </h3>
        </div>

        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5 gap-1"
            onClick={handleExportPdf}
          >
            <Download className="w-3 h-3" /> PDF
          </Button>

          <Button
            variant="outline"
            size="sm"
            className="h-7 text-[11px] px-2.5 gap-1"
            onClick={handleShare}
          >
            <Share2 className="w-3 h-3" /> Share
          </Button>
        </div>
      </div>

      <div className="px-5 py-4 space-y-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Findings
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {report.findings}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Impression
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {report.impression}
          </p>
        </div>

        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">
            Recommendation
          </p>
          <p className="text-xs text-foreground leading-relaxed">
            {report.recommendation}
          </p>
        </div>

        <div className="pt-3 border-t flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Case {caseId}</span>
          <span>{generatedAt}</span>
        </div>
      </div>
    </div>
  );
};

export default ReportPanel;
