"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft, Send, Paperclip, Check, X, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { COMMISSION_STATUSES, formatCurrency, formatDate, getInitials } from "@/lib/utils";
import {
  updateCommissionStatusAction,
  acceptCommissionAction,
  sendMessageAction,
  uploadAttachmentAction,
} from "@/actions/commissions";
import { useCommissionMessages } from "@/hooks/use-notifications";
import type { Commission, CommissionMessage, Profile } from "@/types";

interface CommissionDetailClientProps {
  commission: Commission;
  currentUserId: string;
  isCreator: boolean;
}

export function CommissionDetailClient({
  commission: initial,
  currentUserId,
  isCreator,
}: CommissionDetailClientProps) {
  const [commission, setCommission] = useState(initial);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const { messages } = useCommissionMessages(commission.id);

  const displayMessages: CommissionMessage[] =
    messages.length > 0
      ? (messages as CommissionMessage[])
      : commission.commission_messages || [];
  const statusConfig = COMMISSION_STATUSES.find((s) => s.value === commission.status);

  const handleStatus = async (status: typeof commission.status) => {
    const result = await updateCommissionStatusAction(commission.id, status);
    if (result.success) {
      setCommission({ ...commission, status });
      toast.success(`Status updated to ${status.replace("_", " ")}`);
    } else {
      toast.error(result.error);
    }
  };

  const handleAccept = async () => {
    const result = await acceptCommissionAction(commission.id);
    if (result.success) {
      setCommission({ ...commission, status: "accepted" });
      toast.success("Commission accepted!");
    } else {
      toast.error(result.error);
    }
  };

  const handleSendMessage = async (isRevision = false) => {
    if (!message.trim()) return;
    setSending(true);
    const result = await sendMessageAction(commission.id, {
      content: message,
      is_revision_request: isRevision,
    });
    setSending(false);
    if (result.success) {
      setMessage("");
      toast.success("Message sent");
    } else {
      toast.error(result.error);
    }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadAttachmentAction(commission.id, formData);
    if (result.success) {
      toast.success("Attachment uploaded");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/dashboard/commissions" className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary">
        <ArrowLeft className="size-4" /> Back to commissions
      </Link>

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="font-display text-2xl font-bold">{commission.title}</h1>
          <div className="mt-2 flex items-center gap-3">
            <Badge className={statusConfig?.color}>{statusConfig?.label}</Badge>
            <span className="text-lg font-bold text-primary">{formatCurrency(commission.budget)}</span>
            {commission.deadline && (
              <span className="text-sm text-muted-foreground">Due {formatDate(commission.deadline)}</span>
            )}
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {isCreator && commission.status === "pending" && (
            <>
              <Button size="sm" onClick={handleAccept}><Check className="size-4" /> Accept</Button>
              <Button size="sm" variant="outline" onClick={() => handleStatus("cancelled")}>
                <X className="size-4" /> Reject
              </Button>
            </>
          )}
          {isCreator && commission.status === "accepted" && (
            <Button size="sm" onClick={() => handleStatus("in_progress")}>Start Work</Button>
          )}
          {isCreator && commission.status === "in_progress" && (
            <Button size="sm" onClick={() => handleStatus("review")}>Submit for Review</Button>
          )}
          {!isCreator && commission.status === "review" && (
            <>
              <Button size="sm" onClick={() => handleStatus("completed")}><Check className="size-4" /> Approve</Button>
              <Button size="sm" variant="outline" onClick={() => handleSendMessage(true)}>
                <RotateCcw className="size-4" /> Request Revision
              </Button>
            </>
          )}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Description</CardTitle></CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed">{commission.description}</p>
              {commission.requirements && (
                <>
                  <Separator className="my-4" />
                  <h4 className="text-sm font-semibold mb-2">Requirements</h4>
                  <p className="text-sm text-muted-foreground">{commission.requirements}</p>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Messages</CardTitle></CardHeader>
            <CardContent>
              <div className="max-h-80 space-y-3 overflow-y-auto mb-4">
                {displayMessages.length > 0 ? (
                  displayMessages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender_id === currentUserId ? "flex-row-reverse" : ""}`}
                    >
                      <Avatar className="size-8 shrink-0">
                        <AvatarImage src={msg.sender?.avatar_url || undefined} />
                        <AvatarFallback>{getInitials(msg.sender?.full_name || "U")}</AvatarFallback>
                      </Avatar>
                      <div className={`max-w-[75%] rounded-lg p-3 text-sm ${
                        msg.sender_id === currentUserId ? "bg-primary/10" : "bg-secondary"
                      }`}>
                        {msg.is_revision_request && (
                          <Badge variant="warning" className="mb-1">Revision Request</Badge>
                        )}
                        <p>{msg.content}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{formatDate(msg.created_at)}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-sm text-muted-foreground py-4">No messages yet.</p>
                )}
              </div>
              <div className="flex gap-2">
                <Textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Type a message..."
                  rows={2}
                  className="flex-1"
                />
                <div className="flex flex-col gap-2">
                  <Button size="icon" onClick={() => handleSendMessage()} disabled={sending}>
                    <Send className="size-4" />
                  </Button>
                  <label className="cursor-pointer">
                    <input type="file" className="hidden" onChange={handleUpload} />
                    <Button size="icon" variant="outline" type="button" asChild>
                      <span><Paperclip className="size-4" /></span>
                    </Button>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-4">
          {commission.client && (
            <Card>
              <CardHeader><CardTitle className="text-base">Client</CardTitle></CardHeader>
              <CardContent>
                <p className="font-medium">{commission.client.full_name}</p>
                <p className="text-xs text-muted-foreground">@{commission.client.username}</p>
              </CardContent>
            </Card>
          )}
          {commission.creator && (
            <Card>
              <CardHeader><CardTitle className="text-base">Creator</CardTitle></CardHeader>
              <CardContent>
                <Link href={`/creator/${commission.creator.username}`} className="hover:text-primary">
                  <p className="font-medium">{commission.creator.display_name}</p>
                  <p className="text-xs text-muted-foreground">@{commission.creator.username}</p>
                </Link>
              </CardContent>
            </Card>
          )}
          {commission.commission_attachments && commission.commission_attachments.length > 0 && (
            <Card>
              <CardHeader><CardTitle className="text-base">Attachments</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {commission.commission_attachments.map((a) => (
                  <a
                    key={a.id}
                    href={a.file_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-sm text-primary hover:underline"
                  >
                    <Paperclip className="size-3" />
                    {a.file_name}
                  </a>
                ))}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
