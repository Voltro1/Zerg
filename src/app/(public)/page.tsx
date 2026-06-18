import Link from "next/link";
import {
  ArrowRight,
  Check,
  Sparkles,
  TrendingUp,
  Shield,
  BarChart3,
  Users,
  Package,
  Briefcase,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { CreatorCard } from "@/components/marketplace/creator-card";
import { ProductCard } from "@/components/marketplace/product-card";
import { StarRating } from "@/components/shared/star-rating";
import {
  getFeaturedCreators,
  getFeaturedProducts,
  getLandingStats,
  getLandingTestimonials,
} from "@/services/marketplace";
import { LandingFAQ } from "@/components/landing/landing-faq";
import { formatCurrency } from "@/lib/utils";

const features = [
  { icon: Users, title: "Vetted Creators", desc: "Every creator is portfolio-reviewed and skill-assessed before joining." },
  { icon: Briefcase, title: "Commission Workflow", desc: "End-to-end project management with milestones, messaging, and approvals." },
  { icon: Package, title: "Digital Marketplace", desc: "Buy templates, presets, and assets with instant secure delivery." },
  { icon: Shield, title: "Payment Protection", desc: "Escrow-style milestones ensure you only pay for approved work." },
  { icon: BarChart3, title: "Creator Analytics", desc: "Track views, sales, and commission revenue with premium insights." },
  { icon: TrendingUp, title: "Featured Placement", desc: "Premium creators get priority visibility across the marketplace." },
];

const pricing = [
  {
    name: "Free",
    price: "$0",
    desc: "Perfect for getting started",
    features: ["Browse marketplace", "2 active commissions", "Basic support", "Purchase products"],
    cta: "Start Free",
    href: "/register",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "$29",
    desc: "For growing businesses",
    features: ["Unlimited commissions", "Advanced analytics", "Priority badge", "Featured placement", "Priority support"],
    cta: "Upgrade to Pro",
    href: "/register?plan=pro",
    highlighted: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    desc: "For large teams",
    features: ["Dedicated account manager", "Custom integrations", "SLA guarantee", "Volume discounts", "White-label options"],
    cta: "Contact Sales",
    href: "/register",
    highlighted: false,
  },
];

export default async function LandingPage() {
  const [creators, products, stats, testimonials] = await Promise.all([
    getFeaturedCreators(6),
    getFeaturedProducts(4),
    getLandingStats(),
    getLandingTestimonials(3),
  ]);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Zerg",
    url: process.env.NEXT_PUBLIC_APP_URL,
    description: "Creator marketplace for e-commerce",
    potentialAction: {
      "@type": "SearchAction",
      target: `${process.env.NEXT_PUBLIC_APP_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-20 left-1/2 -translate-x-1/2 w-[900px] h-[500px] rounded-full bg-primary/5 blur-[140px]" />
      </div>

      {/* Hero */}
      <section className="relative px-4 py-24 md:px-6 md:py-32">
        <div className="mx-auto max-w-4xl text-center">
          <Badge variant="outline" className="mb-6 border-primary/20 bg-primary/10 text-primary">
            <Sparkles className="mr-1 size-3" />
            The Creator Marketplace for E-Commerce
          </Badge>
          <h1 className="font-display text-5xl font-black leading-tight tracking-tight md:text-7xl">
            Hire creators.
            <br />
            <span className="text-primary">Sell digital assets.</span>
            <br />
            Grow your store.
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-muted-foreground md:text-lg">
            Connect e-commerce store owners with world-class designers, writers, and content creators.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link href="/register">
              <Button size="lg" className="shadow-[0_0_40px_rgba(255,221,51,0.2)]">
                Start for free <ArrowRight className="size-4" />
              </Button>
            </Link>
            <Link href="/creators">
              <Button variant="outline" size="lg">Browse creators</Button>
            </Link>
          </div>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground">
            {[
              `${stats.verifiedCreators.toLocaleString()} verified creators`,
              `${formatCurrency(stats.totalPaidOut)} paid out`,
              `${stats.storeOwners.toLocaleString()} store owners`,
            ].map((s) => (
              <span key={s} className="flex items-center gap-1.5">
                <Check className="size-3 text-primary" />
                {s}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Everything you need to scale</h2>
            <p className="mt-3 text-muted-foreground">A complete platform for hiring creators and selling digital products.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <Card key={f.title} className="border-border bg-card/50 transition-colors hover:border-primary/20">
                <CardContent className="p-6">
                  <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                    <f.icon className="size-5 text-primary" />
                  </div>
                  <h3 className="font-semibold">{f.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Creators Preview */}
      <section className="border-t border-border px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Top creators</h2>
              <p className="mt-2 text-muted-foreground">Vetted professionals ready for your next project.</p>
            </div>
            <Link href="/creators">
              <Button variant="outline">View all <ArrowRight className="size-4" /></Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {creators.length > 0 ? (
              creators.map((c) => <CreatorCard key={c.id} creator={c} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No creators yet. Be the first to join!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="border-t border-border px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex items-end justify-between">
            <div>
              <h2 className="font-display text-3xl font-bold">Featured products</h2>
              <p className="mt-2 text-muted-foreground">Digital assets to accelerate your store.</p>
            </div>
            <Link href="/products">
              <Button variant="outline">Browse all <ArrowRight className="size-4" /></Button>
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {products.length > 0 ? (
              products.map((p) => <ProductCard key={p.id} product={p} />)
            ) : (
              <p className="col-span-full text-center text-muted-foreground py-8">
                No products yet. Creators can start listing today!
              </p>
            )}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="border-t border-border px-4 py-20 md:px-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">Simple, transparent pricing</h2>
            <p className="mt-3 text-muted-foreground">Start free. Upgrade when you&apos;re ready to scale.</p>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            {pricing.map((plan) => (
              <Card
                key={plan.name}
                className={`relative h-full ${plan.highlighted ? "border-primary shadow-[0_0_40px_rgba(255,221,51,0.1)]" : ""}`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">Most Popular</Badge>
                )}
                <CardContent className="flex h-full flex-col p-6">
                  <h3 className="text-lg font-semibold">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground">{plan.desc}</p>
                  <div className="my-4">
                    <span className="font-display text-4xl font-bold">{plan.price}</span>
                    {plan.price !== "Custom" && <span className="text-muted-foreground">/mo</span>}
                  </div>
                  <ul className="mb-6 flex-1 space-y-2">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-center gap-2 text-sm">
                        <Check className="size-4 shrink-0 text-primary" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <Link href={plan.href} className="mt-auto block">
                    <Button variant={plan.highlighted ? "default" : "outline"} className="w-full">
                      {plan.cta}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-t border-border px-4 py-20 md:px-6">
          <div className="mx-auto max-w-7xl">
            <h2 className="mb-12 text-center font-display text-3xl font-bold">Loved by store owners & creators</h2>
            <div className="grid gap-6 md:grid-cols-3">
              {testimonials.map((t) => (
                <Card key={t.id}>
                  <CardContent className="p-6">
                    <StarRating rating={t.rating} size="sm" />
                    <p className="mt-4 text-sm leading-relaxed">&ldquo;{t.text}&rdquo;</p>
                    <div className="mt-4">
                      <p className="font-semibold text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.role}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section id="faq" className="border-t border-border px-4 py-20 md:px-6">
        <div className="mx-auto max-w-2xl">
          <h2 className="mb-8 text-center font-display text-3xl font-bold">Frequently asked questions</h2>
          <LandingFAQ />
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border px-4 py-20 md:px-6">
        <div className="mx-auto max-w-3xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center md:p-12">
          <Zap className="mx-auto size-10 text-primary" fill="currentColor" />
          <h2 className="mt-4 font-display text-3xl font-bold">Ready to grow your store?</h2>
          <p className="mt-3 text-muted-foreground">Join thousands of e-commerce brands on Zerg today.</p>
          <Link href="/register" className="mt-6 inline-block">
            <Button size="lg">Get started free <ArrowRight className="size-4" /></Button>
          </Link>
        </div>
      </section>
    </>
  );
}
