"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema, type ProductInput } from "@/lib/validations";
import { slugify } from "@/lib/utils";
import type { ActionResult } from "./auth";

async function getCreatorId() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: creator } = await supabase
    .from("creators")
    .select("id")
    .eq("user_id", user.id)
    .single();

  return creator?.id ?? null;
}

export async function createProductAction(input: ProductInput): Promise<ActionResult<{ id: string }>> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const creatorId = await getCreatorId();
  if (!creatorId) return { success: false, error: "Creator profile required" };

  const supabase = await createClient();
  const slug = slugify(parsed.data.title) + "-" + Date.now().toString(36);

  const { data, error } = await supabase
    .from("products")
    .insert({
      creator_id: creatorId,
      title: parsed.data.title,
      slug,
      description: parsed.data.description,
      price: parsed.data.price,
      category_id: parsed.data.category_id,
      tags: parsed.data.tags,
      published: parsed.data.published,
      images: parsed.data.images,
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  return { success: true, data: { id: data.id } };
}

export async function updateProductAction(id: string, input: ProductInput): Promise<ActionResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const creatorId = await getCreatorId();
  if (!creatorId) return { success: false, error: "Creator profile required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .update({
      title: parsed.data.title,
      description: parsed.data.description,
      price: parsed.data.price,
      category_id: parsed.data.category_id,
      tags: parsed.data.tags,
      published: parsed.data.published,
      images: parsed.data.images,
    })
    .eq("id", id)
    .eq("creator_id", creatorId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  return { success: true };
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  const creatorId = await getCreatorId();
  if (!creatorId) return { success: false, error: "Creator profile required" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("products")
    .delete()
    .eq("id", id)
    .eq("creator_id", creatorId);

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/products");
  revalidatePath("/products");
  return { success: true };
}

export async function purchaseProductAction(productId: string): Promise<ActionResult<{ orderId: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: product } = await supabase
    .from("products")
    .select("*, creator:creators(*)")
    .eq("id", productId)
    .single();

  if (!product) return { success: false, error: "Product not found" };

  const { data: order, error } = await supabase
    .from("orders")
    .insert({
      buyer_id: user.id,
      product_id: productId,
      creator_id: product.creator_id,
      amount: product.price,
      status: "completed",
    })
    .select("id")
    .single();

  if (error) return { success: false, error: error.message };

  await supabase
    .from("products")
    .update({ sales_count: (product.sales_count || 0) + 1 })
    .eq("id", productId);

  const { data: creatorProfile } = await supabase
    .from("creators")
    .select("user_id")
    .eq("id", product.creator_id)
    .single();

  if (creatorProfile) {
    await supabase.from("notifications").insert({
      user_id: creatorProfile.user_id,
      type: "order",
      title: "New Sale!",
      message: `Your product "${product.title}" was purchased.`,
      link: "/dashboard/analytics",
    });
  }

  revalidatePath("/dashboard");
  return { success: true, data: { orderId: order.id } };
}

export async function toggleFavoriteAction(productId: string): Promise<ActionResult<{ favorited: boolean }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .single();

  if (existing) {
    await supabase.from("favorites").delete().eq("id", existing.id);
    revalidatePath("/dashboard/wishlist");
    return { success: true, data: { favorited: false } };
  }

  const { error } = await supabase.from("favorites").insert({
    user_id: user.id,
    product_id: productId,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/dashboard/wishlist");
  return { success: true, data: { favorited: true } };
}

export async function uploadProductImageAction(formData: FormData): Promise<ActionResult<{ url: string }>> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not authenticated" };

  const file = formData.get("file") as File;
  if (!file) return { success: false, error: "No file provided" };

  const ext = file.name.split(".").pop();
  const path = `${user.id}/${Date.now()}.${ext}`;

  const { error } = await supabase.storage.from("products").upload(path, file);
  if (error) return { success: false, error: error.message };

  const { data: { publicUrl } } = supabase.storage.from("products").getPublicUrl(path);
  return { success: true, data: { url: publicUrl } };
}
