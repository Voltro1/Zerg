"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { profileSchema, creatorProfileSchema, type ProfileInput, type CreatorProfileInput } from "@/lib/validations";
import type { ActionResult } from "./auth";

export async function updateProfileAction(input: ProfileInput): Promise<ActionResult> {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({
      full_name: parsed.data.full_name,
      username: parsed.data.username,
      bio: parsed.data.bio || null,
      avatar_url: parsed.data.avatar_url || null,
    })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateCreatorProfileAction(input: CreatorProfileInput): Promise<ActionResult> {
  const parsed = creatorProfileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!creator) return { success: false, error: "Creator profile not found" };

  const { error } = await supabase
    .from("creators")
    .update({
      display_name: parsed.data.display_name,
      username: parsed.data.username,
      bio: parsed.data.bio || null,
      category: parsed.data.category,
      price_from: parsed.data.price_from,
      delivery_days: parsed.data.delivery_days,
      revisions: parsed.data.revisions,
      response_time: parsed.data.response_time || "< 24h",
      available: parsed.data.available,
      languages: parsed.data.languages,
      tags: parsed.data.tags,
    })
    .eq("id", creator.id);

  if (error) return { success: false, error: error.message };

  await supabase.from("creator_skills").delete().eq("creator_id", creator.id);
  if (parsed.data.skills.length > 0) {
    await supabase.from("creator_skills").insert(
      parsed.data.skills.map((skill) => ({ creator_id: creator.id, skill }))
    );
  }

  revalidatePath("/dashboard/settings");
  revalidatePath(`/creator/${parsed.data.username}`);
  return { success: true };
}

export async function upgradeToPremiumAction(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { error } = await supabase
    .from("profiles")
    .update({ is_premium: true })
    .eq("id", user.id);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/billing");
  return { success: true };
}

export async function uploadAvatarAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const ext = file.name.split(".").pop();
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from("avatars")
    .upload(path, file, { upsert: true });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);

  await supabase.from("profiles").update({ avatar_url: publicUrl }).eq("id", user.id);

  return { success: true, data: { url: publicUrl } };
}
