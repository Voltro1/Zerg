import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const registerSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["client", "creator"]),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .regex(/^[a-z0-9_]+$/, "Username can only contain lowercase letters, numbers, and underscores"),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export const profileSchema = z.object({
  full_name: z.string().min(2, "Name must be at least 2 characters"),
  username: z.string().min(3).regex(/^[a-z0-9_]+$/),
  bio: z.string().max(500).optional(),
  avatar_url: z.string().url().optional().or(z.literal("")),
});

export const creatorProfileSchema = z.object({
  display_name: z.string().min(2),
  username: z.string().min(3).regex(/^[a-z0-9_]+$/),
  bio: z.string().max(1000).optional(),
  category: z.string().min(1, "Category is required"),
  price_from: z.coerce.number().min(0),
  delivery_days: z.coerce.number().min(1),
  revisions: z.coerce.number().min(0),
  response_time: z.string().optional(),
  available: z.boolean().default(true),
  languages: z.array(z.string()).default([]),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
});

export const productSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  price: z.coerce.number().min(0, "Price must be positive"),
  category_id: z.string().uuid("Category is required"),
  tags: z.array(z.string()).default([]),
  published: z.boolean().default(true),
  images: z.array(z.string()).default([]),
});

export const commissionSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  budget: z.coerce.number().min(1, "Budget must be at least $1"),
  deadline: z.string().optional(),
  requirements: z.string().optional(),
  creator_id: z.string().uuid().optional(),
});

export const messageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  is_revision_request: z.boolean().default(false),
});

export const reviewSchema = z.object({
  rating: z.coerce.number().min(1).max(5),
  comment: z.string().max(1000).optional(),
});

export const portfolioSchema = z.object({
  title: z.string().min(2),
  image_url: z.string().url(),
  description: z.string().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
export type CreatorProfileInput = z.infer<typeof creatorProfileSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type CommissionInput = z.infer<typeof commissionSchema>;
export type MessageInput = z.infer<typeof messageSchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
export type PortfolioInput = z.infer<typeof portfolioSchema>;
