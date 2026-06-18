"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { commissionSchema, messageSchema, type CommissionInput, type MessageInput } from "@/lib/validations";
import type { ActionResult } from "./auth";
import type { CommissionStatus } from "@/types";

export async function createCommissionAction(input: CommissionInput): Promise<ActionResult<{ id: string }>> {
  const parsed = commissionSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data, error } = await supabase
    .from("commissions")
    .insert({
      client_id: user.id,
      creator_id: parsed.data.creator_id || null,
      title: parsed.data.title,
      description: parsed.data.description,
      budget: parsed.data.budget,
      deadline: parsed.data.deadline || null,
      requirements: parsed.data.requirements || null,
      status: parsed.data.creator_id ? "pending" : "pending",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  if (parsed.data.creator_id) {
    const { data: creator } = await supabase
      .from("creators")
      .select("user_id")
      .eq("id", parsed.data.creator_id)
      .single();

    if (creator) {
      await supabase.from("notifications").insert({
        user_id: creator.user_id,
        type: "commission",
        title: "New Commission Request",
        message: `You received a new commission: "${parsed.data.title}"`,
        link: `/dashboard/commissions/${data.id}`,
      });
    }
  }

  revalidatePath("/dashboard/commissions");
  return { success: true, data: { id: data.id } };
}

export async function updateCommissionStatusAction(
  id: string,
  status: CommissionStatus
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: commission } = await supabase
    .from("commissions")
    .select("*, creator:creators(user_id)")
    .eq("id", id)
    .single();

  if (!commission) return { success: false, error: "Commission not found" };

  const { error } = await supabase
    .from("commissions")
    .update({ status })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  const notifyUserId = commission.client_id === user.id
    ? commission.creator?.user_id
    : commission.client_id;

  if (notifyUserId) {
    await supabase.from("notifications").insert({
      user_id: notifyUserId,
      type: "commission",
      title: "Commission Updated",
      message: `Commission "${commission.title}" status changed to ${status.replace("_", " ")}`,
      link: `/dashboard/commissions/${id}`,
    });
  }

  if (status === "completed" && commission.creator_id) {
    const { data: creator } = await supabase
      .from("creators")
      .select("completed_commissions")
      .eq("id", commission.creator_id)
      .single();

    if (creator) {
      await supabase
        .from("creators")
        .update({ completed_commissions: (creator.completed_commissions || 0) + 1 })
        .eq("id", commission.creator_id);
    }
  }

  revalidatePath("/dashboard/commissions");
  revalidatePath(`/dashboard/commissions/${id}`);
  return { success: true };
}

export async function acceptCommissionAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!creator) return { success: false, error: "Creator profile required" };

  const { error } = await supabase
    .from("commissions")
    .update({ status: "accepted", creator_id: creator.id })
    .eq("id", id);

  if (error) return { success: false, error: error.message };

  return updateCommissionStatusAction(id, "accepted");
}

export async function sendMessageAction(
  commissionId: string,
  input: MessageInput
): Promise<ActionResult> {
  const parsed = messageSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("commission_messages").insert({
    commission_id: commissionId,
    sender_id: user.id,
    content: parsed.data.content,
    is_revision_request: parsed.data.is_revision_request,
  });

  if (error) return { success: false, error: error.message };

  if (parsed.data.is_revision_request) {
    await updateCommissionStatusAction(commissionId, "review");
  }

  revalidatePath(`/dashboard/commissions/${commissionId}`);
  return { success: true };
}

export async function updateCommissionOrderAction(
  updates: { id: string; status: CommissionStatus; sort_order: number }[]
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  for (const update of updates) {
    await supabase
      .from("commissions")
      .update({ status: update.status, sort_order: update.sort_order })
      .eq("id", update.id);
  }

  revalidatePath("/dashboard/commissions");
  return { success: true };
}

export async function uploadAttachmentAction(
  commissionId: string,
  formData: FormData
): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const path = `${commissionId}/${Date.now()}-${file.name}`;
  const { error: uploadError } = await supabase.storage
    .from("attachments")
    .upload(path, file);

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("attachments").getPublicUrl(path);

  const { error } = await supabase.from("commission_attachments").insert({
    commission_id: commissionId,
    uploaded_by: user.id,
    file_name: file.name,
    file_url: publicUrl,
    file_size: file.size,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath(`/dashboard/commissions/${commissionId}`);
  return { success: true, data: { url: publicUrl } };
}

export async function createReviewAction(
  data: { creator_id?: string; product_id?: string; commission_id?: string; rating: number; comment?: string }
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    creator_id: data.creator_id || null,
    product_id: data.product_id || null,
    commission_id: data.commission_id || null,
    rating: data.rating,
    comment: data.comment || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true };
}
