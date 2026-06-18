import { createClient } from "@/lib/supabase/server";
import type {
  Creator,
  Product,
  Commission,
  PaginatedResult,
  DashboardStats,
  AnalyticsData,
  SearchResult,
  Profile,
  Notification,
  Order,
  Review,
} from "@/types";

const PAGE_SIZE = 12;

export interface LandingStats {
  verifiedCreators: number;
  totalPaidOut: number;
  storeOwners: number;
}

export interface LandingTestimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
}

export async function getFeaturedCreators(limit = 6): Promise<Creator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("*, creator_skills(*)")
    .or("featured.eq.true,trending.eq.true")
    .order("rating", { ascending: false })
    .limit(limit);
  return (data as Creator[]) || [];
}

export async function getFeaturedProducts(limit = 8): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, creator:creators(*), product_categories(*)")
    .eq("published", true)
    .order("featured", { ascending: false })
    .order("sales_count", { ascending: false })
    .limit(limit);
  return (data as Product[]) || [];
}

export async function getLandingStats(): Promise<LandingStats> {
  const supabase = await createClient();

  const [verifiedCreators, storeOwners, orders, commissions] = await Promise.all([
    supabase
      .from("creators")
      .select("id", { count: "exact", head: true })
      .eq("verified", true),
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "client"),
    supabase
      .from("orders")
      .select("amount")
      .eq("status", "completed"),
    supabase
      .from("commissions")
      .select("budget")
      .eq("status", "completed"),
  ]);

  const orderRevenue = orders.data?.reduce((sum, order) => sum + Number(order.amount), 0) || 0;
  const commissionRevenue =
    commissions.data?.reduce((sum, commission) => sum + Number(commission.budget), 0) || 0;

  return {
    verifiedCreators: verifiedCreators.count || 0,
    totalPaidOut: orderRevenue + commissionRevenue,
    storeOwners: storeOwners.count || 0,
  };
}

export async function getLandingTestimonials(limit = 3): Promise<LandingTestimonial[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer:profiles(full_name, role)")
    .not("comment", "is", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data || [])
    .filter((review) => review.comment)
    .map((review) => {
      const reviewer = Array.isArray(review.reviewer) ? review.reviewer[0] : review.reviewer;

      return {
        id: review.id,
        name: reviewer?.full_name || "Zerg customer",
        role: reviewer?.role === "creator" ? "Creator" : "Store owner",
        text: review.comment!,
        rating: review.rating,
      };
    });
}

export async function getCreators(params: {
  page?: number;
  search?: string;
  category?: string;
  skill?: string;
  minRating?: number;
  available?: boolean;
  sort?: string;
}): Promise<PaginatedResult<Creator>> {
  const supabase = await createClient();
  const page = params.page || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("creators")
    .select("*, creator_skills(*)", { count: "exact" });

  if (params.search) {
    query = query.or(`display_name.ilike.%${params.search}%,username.ilike.%${params.search}%,bio.ilike.%${params.search}%`);
  }
  if (params.category) query = query.eq("category", params.category);
  if (params.minRating) query = query.gte("rating", params.minRating);
  if (params.available !== undefined) query = query.eq("available", params.available);

  switch (params.sort) {
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "sales":
      query = query.order("total_sales", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("rating", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  const totalPages = Math.ceil((count || 0) / PAGE_SIZE);

  let results = (data as Creator[]) || [];
  if (params.skill) {
    results = results.filter((c) =>
      c.creator_skills?.some((s) => s.skill.toLowerCase().includes(params.skill!.toLowerCase()))
    );
  }

  return { data: results, count: count || 0, page, pageSize: PAGE_SIZE, totalPages };
}

export async function getCreatorByUsername(username: string): Promise<Creator | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("*, creator_skills(*), creator_portfolios(*), products(*, product_categories(*))")
    .eq("username", username)
    .single();

  if (data) {
    await supabase
      .from("creators")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id);
  }

  return data as Creator | null;
}

export async function getProducts(params: {
  page?: number;
  search?: string;
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sort?: string;
}): Promise<PaginatedResult<Product>> {
  const supabase = await createClient();
  const page = params.page || 1;
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  let query = supabase
    .from("products")
    .select("*, creator:creators(*), product_categories(*)", { count: "exact" })
    .eq("published", true);

  if (params.search) {
    query = query.or(`title.ilike.%${params.search}%,description.ilike.%${params.search}%`);
  }
  if (params.category) {
    const { data: cat } = await supabase
      .from("product_categories")
      .select("id")
      .eq("slug", params.category)
      .single();
    if (cat) query = query.eq("category_id", cat.id);
  }
  if (params.minPrice) query = query.gte("price", params.minPrice);
  if (params.maxPrice) query = query.lte("price", params.maxPrice);
  if (params.minRating) query = query.gte("rating", params.minRating);

  switch (params.sort) {
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "rating":
      query = query.order("rating", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("featured", { ascending: false }).order("sales_count", { ascending: false });
  }

  const { data, count } = await query.range(from, to);
  return {
    data: (data as Product[]) || [],
    count: count || 0,
    page,
    pageSize: PAGE_SIZE,
    totalPages: Math.ceil((count || 0) / PAGE_SIZE),
  };
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, creator:creators(*), product_categories(*), reviews(*, reviewer:profiles(full_name, avatar_url))")
    .eq("slug", slug)
    .single();

  if (data) {
    await supabase
      .from("products")
      .update({ view_count: (data.view_count || 0) + 1 })
      .eq("id", data.id);
  }

  return data as Product | null;
}

export async function getRelatedProducts(productId: string, categoryId: string | null): Promise<Product[]> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, creator:creators(*)")
    .eq("published", true)
    .neq("id", productId)
    .limit(4);

  if (categoryId) query = query.eq("category_id", categoryId);

  const { data } = await query;
  return (data as Product[]) || [];
}

export async function getCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("product_categories").select("*").order("name");
  return data || [];
}

export async function getCommissions(userId: string, role: string): Promise<Commission[]> {
  const supabase = await createClient();

  if (role === "creator") {
    const { data: creator } = await supabase
      .from("creators")
      .select("id")
      .eq("user_id", userId)
      .single();

    if (!creator) return [];

    const { data } = await supabase
      .from("commissions")
      .select("*, client:profiles(*), creator:creators(*)")
      .or(`creator_id.eq.${creator.id},and(creator_id.is.null,status.eq.pending)`)
      .order("sort_order")
      .order("created_at", { ascending: false });

    return (data as Commission[]) || [];
  }

  const { data } = await supabase
    .from("commissions")
    .select("*, client:profiles(*), creator:creators(*)")
    .eq("client_id", userId)
    .order("sort_order")
    .order("created_at", { ascending: false });

  return (data as Commission[]) || [];
}

export async function getCommissionById(id: string): Promise<Commission | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commissions")
    .select(`
      *,
      client:profiles(*),
      creator:creators(*),
      commission_messages(*, sender:profiles(*)),
      commission_attachments(*)
    `)
    .eq("id", id)
    .single();

  return data as Commission | null;
}

export async function getClientDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const [orders, commissions, saved, notifications] = await Promise.all([
    supabase.from("orders").select("amount").eq("buyer_id", userId),
    supabase.from("commissions").select("id").eq("client_id", userId),
    supabase.from("saved_creators").select("id").eq("user_id", userId),
    supabase.from("notifications").select("id").eq("user_id", userId).eq("read", false),
  ]);

  const totalSpent = orders.data?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;

  return {
    totalOrders: orders.data?.length || 0,
    totalCommissions: commissions.data?.length || 0,
    totalSpent,
    savedCreators: saved.data?.length || 0,
    unreadNotifications: notifications.data?.length || 0,
  };
}

export async function getCreatorDashboardStats(userId: string): Promise<DashboardStats> {
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (!creator) return {};

  const [orders, commissions, notifications, products] = await Promise.all([
    supabase.from("orders").select("amount").eq("creator_id", creator.id),
    supabase.from("commissions").select("budget, status").eq("creator_id", creator.id),
    supabase.from("notifications").select("id").eq("user_id", userId).eq("read", false),
    supabase.from("products").select("view_count, sales_count").eq("creator_id", creator.id),
  ]);

  const totalRevenue = orders.data?.reduce((sum, o) => sum + Number(o.amount), 0) || 0;
  const commissionRevenue = commissions.data
    ?.filter((c) => c.status === "completed")
    .reduce((sum, c) => sum + Number(c.budget), 0) || 0;
  const productViews = products.data?.reduce((sum, p) => sum + (p.view_count || 0), 0) || 0;

  return {
    totalSales: orders.data?.length || 0,
    totalRevenue,
    commissionRevenue,
    totalCommissions: commissions.data?.length || 0,
    averageRating: creator.rating,
    productViews,
    unreadNotifications: notifications.data?.length || 0,
  };
}

export async function getAnalytics(userId: string): Promise<AnalyticsData> {
  const supabase = await createClient();

  const { data: creator } = await supabase
    .from("creators")
    .select("id, view_count")
    .eq("user_id", userId)
    .single();

  if (!creator) {
    return { views: [], sales: [], commissionRevenue: [], popularProducts: [] };
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const [orders, commissions, products] = await Promise.all([
    supabase
      .from("orders")
      .select("amount, created_at")
      .eq("creator_id", creator.id)
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("commissions")
      .select("budget, created_at, status")
      .eq("creator_id", creator.id)
      .eq("status", "completed")
      .gte("created_at", thirtyDaysAgo.toISOString()),
    supabase
      .from("products")
      .select("title, sales_count, view_count")
      .eq("creator_id", creator.id)
      .order("sales_count", { ascending: false })
      .limit(5),
  ]);

  const groupByDate = (items: { created_at: string; amount?: number; budget?: number }[], field: "amount" | "budget") => {
    const map = new Map<string, number>();
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      map.set(d.toISOString().split("T")[0], 0);
    }
    items?.forEach((item) => {
      const date = item.created_at.split("T")[0];
      if (map.has(date)) {
        map.set(date, (map.get(date) || 0) + Number(item[field] || 0));
      }
    });
    return Array.from(map.entries()).map(([date, value]) => ({
      date,
      count: value,
      amount: value,
    }));
  };

  return {
    views: [{ date: "Total", count: creator.view_count || 0 }],
    sales: groupByDate(orders.data || [], "amount"),
    commissionRevenue: groupByDate(commissions.data || [], "budget"),
    popularProducts: (products.data || []).map((p) => ({ name: p.title, sales: p.sales_count || 0 })),
  };
}

export async function globalSearch(query: string): Promise<SearchResult> {
  const supabase = await createClient();
  if (!query.trim()) return { creators: [], products: [], categories: [] };

  const [creators, products, categories] = await Promise.all([
    supabase
      .from("creators")
      .select("*")
      .or(`display_name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(5),
    supabase
      .from("products")
      .select("*, creator:creators(*)")
      .eq("published", true)
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5),
    supabase
      .from("product_categories")
      .select("*")
      .or(`name.ilike.%${query}%,description.ilike.%${query}%`)
      .limit(5),
  ]);

  return {
    creators: (creators.data as Creator[]) || [],
    products: (products.data as Product[]) || [],
    categories: categories.data || [],
  };
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(50);
  return (data as Notification[]) || [];
}

export async function getRecentOrders(userId: string, limit = 5): Promise<Order[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("orders")
    .select("*, product:products(*), creator:creators(*)")
    .eq("buyer_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data as Order[]) || [];
}

export async function getWishlist(userId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("product:products(*, creator:creators(*))")
    .eq("user_id", userId);
  return (data?.map((f) => f.product).filter(Boolean) as unknown as Product[]) || [];
}

export async function getSavedCreators(userId: string): Promise<Creator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_creators")
    .select("creator:creators(*, creator_skills(*))")
    .eq("user_id", userId);
  return (data?.map((s) => s.creator).filter(Boolean) as unknown as Creator[]) || [];
}

export async function getCreatorReviews(creatorId: string): Promise<Review[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("reviews")
    .select("*, reviewer:profiles(full_name, avatar_url)")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  return (data as Review[]) || [];
}

export async function getAdminStats() {
  const supabase = await createClient();
  const [users, creators, products, commissions] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("creators").select("id", { count: "exact", head: true }),
    supabase.from("products").select("id", { count: "exact", head: true }),
    supabase.from("commissions").select("id", { count: "exact", head: true }),
  ]);

  return {
    totalUsers: users.count || 0,
    totalCreators: creators.count || 0,
    totalProducts: products.count || 0,
    totalCommissions: commissions.count || 0,
  };
}

export async function getAllUsers(): Promise<Profile[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false });
  return (data as Profile[]) || [];
}

export async function getAllCreatorsAdmin(): Promise<Creator[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("creators")
    .select("*, creator_skills(*)")
    .order("created_at", { ascending: false });
  return (data as Creator[]) || [];
}

export async function getAllProductsAdmin(): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*, creator:creators(*), product_categories(*)")
    .order("created_at", { ascending: false });
  return (data as Product[]) || [];
}

export async function getAllCommissionsAdmin(): Promise<Commission[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("commissions")
    .select("*, client:profiles(*), creator:creators(*)")
    .order("created_at", { ascending: false });
  return (data as Commission[]) || [];
}

export async function isFavorited(userId: string, productId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("favorites")
    .select("id")
    .eq("user_id", userId)
    .eq("product_id", productId)
    .single();
  return !!data;
}

export async function isCreatorSaved(userId: string, creatorId: string): Promise<boolean> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("saved_creators")
    .select("id")
    .eq("user_id", userId)
    .eq("creator_id", creatorId)
    .single();
  return !!data;
}

export async function getCreatorProducts(creatorId: string): Promise<Product[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("*")
    .eq("creator_id", creatorId)
    .order("created_at", { ascending: false });
  return (data as Product[]) || [];
}

export async function getCreatorCategories(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("creators").select("category");
  const categories = [...new Set(data?.map((c) => c.category).filter(Boolean) as string[])];
  return categories.sort();
}

export async function getCreatorSkills(): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase.from("creator_skills").select("skill");
  const skills = [...new Set(data?.map((s) => s.skill) || [])];
  return skills.sort();
}
