"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { ActionResult } from "./auth";

export async function toggleSavedCreatorAction(creatorId: string): Promise<ActionResult<{ saved: boolean }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("saved_creators")
    .select("id")
    .eq("user_id", user.id)
    .eq("creator_id", creatorId)
    .single();

  if (existing) {
    await supabase.from("saved_creators").delete().eq("id", existing.id);
    revalidatePath("/dashboard");
    return { success: true, data: { saved: false } };
  }

  const { error } = await supabase.from("saved_creators").insert({
    user_id: user.id,
    creator_id: creatorId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard");
  return { success: true, data: { saved: true } };
}

export async function markNotificationReadAction(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false);

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function updateUserRoleAction(userId: string, role: "client" | "creator" | "admin"): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ role })
    .eq("id", userId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  return { success: true };
}

export async function toggleProductPublishedAction(productId: string, published: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("products")
    .update({ published })
    .eq("id", productId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/products");
  return { success: true };
}

export async function toggleCreatorFeaturedAction(creatorId: string, featured: boolean): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") {
    return { success: false, error: "Unauthorized" };
  }

  const { error } = await supabase
    .from("creators")
    .update({ featured })
    .eq("id", creatorId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/admin");
  revalidatePath("/creators");
  return { success: true };
}

export async function addPortfolioItemAction(data: {
  title: string;
  image_url: string;
  description?: string;
}): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!creator) return { success: false, error: "Creator profile required" };

  const { error } = await supabase.from("creator_portfolios").insert({
    creator_id: creator.id,
    title: data.title,
    image_url: data.image_url,
    description: data.description || null,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  return { success: true };
}

export async function deletePortfolioItemAction(id: string): Promise<ActionResult> {
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
    .from("creator_portfolios")
    .delete()
    .eq("id", id)
    .eq("creator_id", creator.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/portfolio");
  return { success: true };
}
