import { useEffect, useMemo, useState } from "react";
import { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { MessageSquare, UserCircle, Send, Users } from "lucide-react";
import { format } from "date-fns";

interface CollaborationPanelProps {
  caseId: string;
  comments: Comment[];
}

const CollaborationPanel = ({
  caseId,
  comments: initialComments,
}: CollaborationPanelProps) => {
  const storageKey = useMemo(
    () => `afri_scan_case_comments_${caseId}`,
    [caseId],
  );

  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [secondOpinionRequested, setSecondOpinionRequested] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const savedComments = JSON.parse(raw) as Comment[];
        setComments(savedComments);
        setSecondOpinionRequested(savedComments.some((c) => c.isSecondOpinion));
      } else {
        setComments(initialComments);
        setSecondOpinionRequested(
          initialComments.some((c) => c.isSecondOpinion),
        );
      }
    } catch {
      setComments(initialComments);
      setSecondOpinionRequested(initialComments.some((c) => c.isSecondOpinion));
    }
  }, [initialComments, storageKey]);

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(comments));
    setSecondOpinionRequested(comments.some((c) => c.isSecondOpinion));
  }, [comments, storageKey]);

  const addComment = () => {
    if (!newComment.trim() || !doctorName.trim()) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      doctorName: doctorName.trim(),
      text: newComment.trim(),
      timestamp: new Date().toISOString(),
    };

    setComments((prev) => [...prev, comment]);
    setNewComment("");
  };

  const requestSecondOpinion = () => {
    if (!doctorName.trim()) return;

    const comment: Comment = {
      id: `c-${Date.now()}`,
      doctorName: doctorName.trim(),
      text: "Second opinion requested for this case.",
      timestamp: new Date().toISOString(),
      isSecondOpinion: true,
    };

    setComments((prev) => [...prev, comment]);
  };

  return (
    <div className="card-clinical">
      <div className="px-5 py-3.5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Collaboration</h3>
        </div>
        {secondOpinionRequested && (
          <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-accent border border-primary/15 px-2 py-0.5 rounded-md">
            2nd Opinion Requested
          </span>
        )}
      </div>

      <div className="px-5 py-4 space-y-4">
        {comments.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-7 h-7 text-muted-foreground/25 mx-auto mb-2" />
            <p className="text-xs font-medium text-muted-foreground">
              No comments yet
            </p>
            <p className="text-[11px] text-muted-foreground/70 mt-0.5">
              Be the first to add a clinical note.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5 max-h-60 overflow-y-auto">
            {comments.map((c) => (
              <div
                key={c.id}
                className={`rounded-lg p-3 ${
                  c.isSecondOpinion
                    ? "bg-accent/80 border border-primary/15"
                    : "bg-secondary/80"
                }`}
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <UserCircle className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-[11px] font-bold text-foreground">
                    {c.doctorName}
                  </span>
                  {c.isSecondOpinion && (
                    <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-px rounded">
                      2nd Opinion
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground ml-auto">
                    {format(new Date(c.timestamp), "MMM d, h:mm a")}
                  </span>
                </div>
                <p className="text-xs text-foreground leading-relaxed">
                  {c.text}
                </p>
              </div>
            ))}
          </div>
        )}

        <div className="border-t pt-3.5 space-y-2.5">
          <Input
            placeholder="Your name (e.g., Dr. Smith)"
            value={doctorName}
            onChange={(e) => setDoctorName(e.target.value)}
            className="text-xs h-8"
          />
          <Textarea
            placeholder="Add a clinical comment…"
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="text-xs min-h-[68px] resize-none"
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={addComment}
              disabled={!newComment.trim() || !doctorName.trim()}
              className="h-7 text-xs px-3"
            >
              <Send className="w-3 h-3 mr-1.5" /> Comment
            </Button>

            {!secondOpinionRequested && (
              <Button
                variant="outline"
                size="sm"
                onClick={requestSecondOpinion}
                disabled={!doctorName.trim()}
                className="h-7 text-xs px-3"
              >
                <Users className="w-3 h-3 mr-1.5" /> Request 2nd Opinion
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
