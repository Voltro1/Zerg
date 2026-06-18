import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + "...";
}

export const COMMISSION_STATUSES = [
  { value: "pending", label: "Pending", color: "bg-yellow-500/20 text-yellow-400" },
  { value: "accepted", label: "Accepted", color: "bg-blue-500/20 text-blue-400" },
  { value: "in_progress", label: "In Progress", color: "bg-purple-500/20 text-purple-400" },
  { value: "review", label: "Review", color: "bg-orange-500/20 text-orange-400" },
  { value: "completed", label: "Completed", color: "bg-green-500/20 text-green-400" },
  { value: "cancelled", label: "Cancelled", color: "bg-red-500/20 text-red-400" },
] as const;

export const KANBAN_COLUMNS = [
  "pending",
  "accepted",
  "in_progress",
  "review",
  "completed",
] as const;
