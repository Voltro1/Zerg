"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Zap,
  Menu,
  X,
  Search,
  Bell,
  LayoutDashboard,
  Users,
  Package,
  Briefcase,
  BarChart3,
  Settings,
  CreditCard,
  Shield,
  Heart,
  LogOut,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth, useNotifications } from "@/hooks/use-notifications";
import { logoutAction } from "@/actions/auth";
import { getInitials } from "@/lib/utils";
import type { Profile } from "@/types";

const publicNav = [
  { href: "/creators", label: "Creators" },
  { href: "/products", label: "Products" },
  { href: "/#pricing", label: "Pricing" },
];

const dashboardNav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/creators", label: "Creators", icon: Users },
  { href: "/products", label: "Products", icon: Package },
  { href: "/dashboard/commissions", label: "Commissions", icon: Briefcase },
  { href: "/dashboard/analytics", label: "Analytics", icon: BarChart3, creatorOnly: true },
  { href: "/dashboard/products", label: "My Products", icon: Package, creatorOnly: true },
  { href: "/dashboard/portfolio", label: "Portfolio", icon: Briefcase, creatorOnly: true },
  { href: "/dashboard/wishlist", label: "Wishlist", icon: Heart, clientOnly: true },
  { href: "/dashboard/billing", label: "Billing", icon: CreditCard },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, profile, loading } = useAuth();
  const typedProfile = profile as Profile | null;
  const { unreadCount } = useNotifications(user?.id);

  const isDashboard = pathname.startsWith("/dashboard") || pathname.startsWith("/admin");

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-14 border-b border-border bg-background/90 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
            <Zap size={13} className="text-primary-foreground" fill="currentColor" />
          </div>
          <span className="font-display text-sm font-bold tracking-tight">Zerg</span>
        </Link>

        {!isDashboard && (
          <nav className="hidden items-center gap-6 md:flex">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        )}

        <div className="flex items-center gap-2">
          <Link href="/search" aria-label="Search">
            <Button variant="ghost" size="icon">
              <Search className="size-4" />
            </Button>
          </Link>

          {!loading && user ? (
            <>
              <Link href="/dashboard/notifications" className="relative" aria-label="Notifications">
                <Button variant="ghost" size="icon">
                  <Bell className="size-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
                      {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                  )}
                </Button>
              </Link>
              <Link href="/dashboard">
                <Avatar className="size-8">
                  <AvatarImage src={typedProfile?.avatar_url || undefined} />
                  <AvatarFallback className="text-xs">
                    {getInitials(typedProfile?.full_name || "U")}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </>
          ) : !loading ? (
            <div className="hidden items-center gap-2 md:flex">
              <Link href="/login">
                <Button variant="ghost" size="sm">Sign In</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">Get Started</Button>
              </Link>
            </div>
          ) : null}

          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {mobileOpen && (
        <div className="border-b border-border bg-card p-4 md:hidden">
          <nav className="flex flex-col gap-2">
            {publicNav.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="py-2 text-sm text-muted-foreground"
                onClick={() => setMobileOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <>
                <Link href="/login" onClick={() => setMobileOpen(false)}>
                  <Button variant="outline" className="w-full mt-2">Sign In</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileOpen(false)}>
                  <Button className="w-full">Get Started</Button>
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}

export function DashboardSidebar() {
  const pathname = usePathname();
  const { profile } = useAuth();
  const typedProfile = profile as Profile | null;

  const filteredNav = dashboardNav.filter((item) => {
    if (item.creatorOnly && typedProfile?.role !== "creator" && typedProfile?.role !== "admin") return false;
    if (item.clientOnly && typedProfile?.role === "creator") return false;
    return true;
  });

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border bg-card/50 lg:block">
      <nav className="flex flex-col gap-1 p-4">
        {filteredNav.map((item) => {
          const Icon = item.icon;
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground"
              }`}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
        {typedProfile?.role === "admin" && (
          <Link
            href="/admin"
            className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
              pathname.startsWith("/admin")
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground"
            }`}
          >
            <Shield className="size-4" />
            Admin
          </Link>
        )}
        <form action={logoutAction} className="mt-4">
          <button
            type="submit"
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            <LogOut className="size-4" />
            Logout
          </button>
        </form>
      </nav>
    </aside>
  );
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="mx-auto max-w-7xl px-4 py-12 md:px-6">
        <div className="grid gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <div className="flex size-7 items-center justify-center rounded-lg bg-primary">
                <Zap size={13} className="text-primary-foreground" fill="currentColor" />
              </div>
              <span className="font-display font-bold">Zerg</span>
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              The creator marketplace built for e-commerce growth.
            </p>
          </div>
          {[
            { title: "Marketplace", links: [["Creators", "/creators"], ["Products", "/products"], ["Commissions", "/dashboard/commissions"]] },
            { title: "Company", links: [["About", "/#features"], ["Pricing", "/#pricing"], ["FAQ", "/#faq"]] },
            { title: "Account", links: [["Dashboard", "/dashboard"], ["Settings", "/dashboard/settings"], ["Billing", "/dashboard/billing"]] },
          ].map((col) => (
            <div key={col.title}>
              <h4 className="mb-3 text-sm font-semibold">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map(([label, href]) => (
                  <li key={label}>
                    <Link href={href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-border pt-8 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Zerg. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
