import { useEffect, useMemo, useRef, useState } from "react";
import { Comment } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  MessageSquare,
  UserCircle,
  Send,
  Users,
  Wifi,
  WifiOff,
} from "lucide-react";
import { format } from "date-fns";

interface CollaborationPanelProps {
  caseId: string;
  comments: Comment[];
}

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8001";

const getWsBase = (apiBase: string) => {
  if (apiBase.startsWith("https://")) {
    return apiBase.replace("https://", "wss://");
  }
  if (apiBase.startsWith("http://")) {
    return apiBase.replace("http://", "ws://");
  }
  return apiBase;
};

const CollaborationPanel = ({
  caseId,
  comments: initialComments,
}: CollaborationPanelProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments || []);
  const [newComment, setNewComment] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [secondOpinionRequested, setSecondOpinionRequested] = useState(
    (initialComments || []).some((c) => c.isSecondOpinion),
  );
  const [isConnected, setIsConnected] = useState(false);

  const wsRef = useRef<WebSocket | null>(null);

  const wsUrl = useMemo(() => {
    const wsBase = getWsBase(API_BASE);
    return `${wsBase}/ws/cases/${caseId}`;
  }, [caseId]);

  useEffect(() => {
    let isMounted = true;

    const loadComments = async () => {
      try {
        const res = await fetch(`${API_BASE}/cases/${caseId}/comments`);
        if (!res.ok) return;
        const data = await res.json();
        if (isMounted && Array.isArray(data.items)) {
          setComments(data.items);
          setSecondOpinionRequested(
            data.items.some((c: Comment) => c.isSecondOpinion),
          );
        }
      } catch (err) {
        console.error("Failed to load comments:", err);
      }
    };

    loadComments();

    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      if (isMounted) setIsConnected(true);
    };

    ws.onclose = () => {
      if (isMounted) setIsConnected(false);
    };

    ws.onerror = () => {
      if (isMounted) setIsConnected(false);
    };

    ws.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data);

        if (
          payload.type === "initial_comments" &&
          Array.isArray(payload.items)
        ) {
          setComments(payload.items);
          setSecondOpinionRequested(
            payload.items.some((c: Comment) => c.isSecondOpinion),
          );
        }

        if (payload.type === "new_comment" && payload.comment) {
          setComments((prev) => {
            const exists = prev.some((c) => c.id === payload.comment.id);
            if (exists) return prev;
            return [...prev, payload.comment];
          });

          if (payload.comment.isSecondOpinion) {
            setSecondOpinionRequested(true);
          }
        }
      } catch (err) {
        console.error("WS parse error:", err);
      }
    };

    return () => {
      isMounted = false;
      ws.close();
    };
  }, [caseId, wsUrl]);

  const addComment = async (isSecondOpinion = false) => {
    if (!newComment.trim() || !doctorName.trim()) return;

    try {
      const res = await fetch(`${API_BASE}/cases/${caseId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          doctorName: doctorName.trim(),
          text: newComment.trim(),
          isSecondOpinion,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        alert(data.error || "Could not save comment.");
        return;
      }

      if (isSecondOpinion) {
        setSecondOpinionRequested(true);
      }

      setNewComment("");
    } catch (err) {
      console.error("Failed to add comment:", err);
      alert("Could not save comment.");
    }
  };

  return (
    <div className="card-clinical">
      <div className="px-5 py-3.5 border-b flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          <h3 className="text-sm font-bold text-foreground">Collaboration</h3>
        </div>

        <div className="flex items-center gap-2">
          {secondOpinionRequested && (
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-accent border border-primary/15 px-2 py-0.5 rounded-md">
              2nd Opinion Requested
            </span>
          )}

          <span className="inline-flex items-center gap-1 text-[10px] text-muted-foreground">
            {isConnected ? (
              <>
                <Wifi className="w-3 h-3 text-green-600" />
                Live
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-muted-foreground" />
                Offline
              </>
            )}
          </span>
        </div>
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
          <div className="space-y-2.5 max-h-72 overflow-y-auto">
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
            placeholder="Your name (e.g. Dr. Cynthia)"
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

          <div className="flex gap-2 flex-wrap">
            <Button
              size="sm"
              onClick={() => addComment(false)}
              disabled={!newComment.trim() || !doctorName.trim()}
              className="h-7 text-xs px-3"
            >
              <Send className="w-3 h-3 mr-1.5" />
              Comment
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => addComment(true)}
              disabled={!newComment.trim() || !doctorName.trim()}
              className="h-7 text-xs px-3"
            >
              <Users className="w-3 h-3 mr-1.5" />
              Request 2nd Opinion
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationPanel;
