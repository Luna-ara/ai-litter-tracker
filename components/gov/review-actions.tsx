"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { formatCents } from "@/lib/format";

type Props = {
  submissionId: string;
  citizenName: string;
  bountyCents: number;
};

export function ReviewActions({ submissionId, citizenName, bountyCents }: Props) {
  const router = useRouter();
  const [note, setNote] = useState("");
  const [approving, setApproving] = useState(false);
  const [flagging, setFlagging] = useState(false);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [flagNote, setFlagNote] = useState("");

  async function doAction(action: "approve" | "flag", actionNote?: string) {
    const setter = action === "approve" ? setApproving : setFlagging;
    setter(true);
    try {
      const res = await fetch(`/api/submissions/${submissionId}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, note: (actionNote ?? note) || undefined }),
      });
      const text = await res.text();
      let data: Record<string, unknown> = {};
      try { data = JSON.parse(text); } catch { /* empty body or HTML error page */ }
      if (!res.ok) {
        toast.error((data.error as string) ?? `Server error ${res.status}`);
        return;
      }
      if (action === "approve") {
        toast.success(`Approved: ${formatCents(bountyCents)} sent to ${citizenName}`);
      } else {
        toast.success("Cleanup flagged");
        setFlagDialogOpen(false);
      }
      router.push("/gov/review");
      router.refresh();
    } catch {
      toast.error("Network error");
    } finally {
      setter(false);
    }
  }

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label htmlFor="gov-note">Note (optional for approval)</Label>
        <Textarea
          id="gov-note"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note for the citizen..."
          rows={3}
        />
      </div>
      <div className="flex gap-3">
        <Button
          className="flex-1"
          onClick={() => doAction("approve")}
          disabled={approving || flagging}
        >
          {approving && <Loader2 className="size-4 mr-2 animate-spin" />}
          Approve &amp; pay {formatCents(bountyCents)}
        </Button>
        <Button
          variant="outline"
          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
          onClick={() => setFlagDialogOpen(true)}
          disabled={approving || flagging}
        >
          Flag
        </Button>
      </div>

      <Dialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Flag this cleanup</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="flag-note">Reason (required)</Label>
            <Textarea
              id="flag-note"
              value={flagNote}
              onChange={(e) => setFlagNote(e.target.value)}
              placeholder="Explain why this submission is being flagged..."
              rows={4}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFlagDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              disabled={!flagNote.trim() || flagging}
              onClick={() => doAction("flag", flagNote)}
            >
              {flagging && <Loader2 className="size-4 mr-2 animate-spin" />}
              Flag cleanup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
