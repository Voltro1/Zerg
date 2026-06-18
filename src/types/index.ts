export type UserRole = "client" | "creator" | "admin";

export type CommissionStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "review"
  | "completed"
  | "cancelled";

export type OrderStatus = "pending" | "completed" | "refunded" | "cancelled";

export type NotificationType =
  | "commission"
  | "order"
  | "review"
  | "system"
  | "message";

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  username: string | null;
  avatar_url: string | null;
  bio: string | null;
  role: UserRole;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export interface Creator {
  id: string;
  user_id: string;
  display_name: string;
  username: string;
  banner_url: string | null;
  avatar_url: string | null;
  bio: string | null;
  category: string | null;
  rating: number;
  review_count: number;
  total_sales: number;
  completed_commissions: number;
  response_time: string | null;
  completion_rate: number;
  price_from: number;
  delivery_days: number;
  revisions: number;
  verified: boolean;
  available: boolean;
  featured: boolean;
  trending: boolean;
  view_count: number;
  languages: string[];
  tags: string[];
  created_at: string;
  updated_at: string;
  creator_skills?: CreatorSkill[];
  creator_portfolios?: CreatorPortfolio[];
  products?: Product[];
}

export interface CreatorSkill {
  id: string;
  creator_id: string;
  skill: string;
  created_at: string;
}

export interface CreatorPortfolio {
  id: string;
  creator_id: string;
  title: string;
  image_url: string;
  description: string | null;
  view_count: number;
  sort_order: number;
  created_at: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  creator_id: string;
  category_id: string | null;
  title: string;
  slug: string;
  description: string;
  price: number;
  images: string[];
  rating: number;
  review_count: number;
  sales_count: number;
  view_count: number;
  featured: boolean;
  published: boolean;
  tags: string[];
  created_at: string;
  updated_at: string;
  creator?: Creator;
  product_categories?: ProductCategory;
  reviews?: Review[];
}

export interface Commission {
  id: string;
  client_id: string;
  creator_id: string | null;
  title: string;
  description: string;
  budget: number;
  deadline: string | null;
  requirements: string | null;
  status: CommissionStatus;
  sort_order: number;
  created_at: string;
  updated_at: string;
  client?: Profile;
  creator?: Creator;
  commission_messages?: CommissionMessage[];
  commission_attachments?: CommissionAttachment[];
}

export interface CommissionMessage {
  id: string;
  commission_id: string;
  sender_id: string;
  content: string;
  is_revision_request: boolean;
  created_at: string;
  sender?: Profile;
}

export interface CommissionAttachment {
  id: string;
  commission_id: string;
  message_id: string | null;
  uploaded_by: string;
  file_name: string;
  file_url: string;
  file_size: number | null;
  created_at: string;
}

export interface Review {
  id: string;
  reviewer_id: string;
  creator_id: string | null;
  product_id: string | null;
  commission_id: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
  reviewer?: Profile;
}

export interface Favorite {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface SavedCreator {
  id: string;
  user_id: string;
  creator_id: string;
  created_at: string;
  creator?: Creator;
}

export interface Order {
  id: string;
  buyer_id: string;
  product_id: string;
  creator_id: string;
  amount: number;
  status: OrderStatus;
  created_at: string;
  product?: Product;
  creator?: Creator;
}

export interface Notification {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
}

export interface PaginatedResult<T> {
  data: T[];
  count: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface SearchResult {
  creators: Creator[];
  products: Product[];
  categories: ProductCategory[];
}

export interface DashboardStats {
  totalOrders?: number;
  totalCommissions?: number;
  totalSpent?: number;
  savedCreators?: number;
  unreadNotifications?: number;
  totalSales?: number;
  totalRevenue?: number;
  commissionRevenue?: number;
  averageRating?: number;
  productViews?: number;
}

export interface AnalyticsData {
  views: { date: string; count: number }[];
  sales: { date: string; amount: number }[];
  commissionRevenue: { date: string; amount: number }[];
  popularProducts: { name: string; sales: number }[];
}

