"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Check, Zap, Crown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { upgradeToPremiumAction } from "@/actions/profile";

const features = [
  "Featured creator placement",
  "Advanced analytics dashboard",
  "Priority support badge",
  "Unlimited commissions",
  "Premium profile badge",
];

export function BillingClient({ isPremium }: { isPremium: boolean }) {
  const [loading, setLoading] = useState(false);

  const handleUpgrade = async () => {
    setLoading(true);
    const result = await upgradeToPremiumAction();
    setLoading(false);
    if (result.success) {
      toast.success("Welcome to Premium!");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Billing</h1>
        <p className="mt-1 text-muted-foreground">Manage your subscription</p>
      </div>

      <Card className={isPremium ? "border-primary shadow-[0_0_40px_rgba(255,221,51,0.1)]" : ""}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Crown className="size-5 text-primary" />
                {isPremium ? "Premium Plan" : "Free Plan"}
              </CardTitle>
              <CardDescription>
                {isPremium ? "You have access to all premium features" : "Upgrade to unlock premium features"}
              </CardDescription>
            </div>
            {isPremium && <Badge>Premium Active</Badge>}
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <span className="font-display text-4xl font-bold">$29</span>
            <span className="text-muted-foreground">/month</span>
          </div>
          <ul className="mb-6 space-y-2">
            {features.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm">
                <Check className="size-4 text-primary shrink-0" />
                {f}
              </li>
            ))}
          </ul>
          {!isPremium ? (
            <Button className="w-full" size="lg" onClick={handleUpgrade} loading={loading}>
              <Zap className="size-4" fill="currentColor" />
              Upgrade to Premium
            </Button>
          ) : (
            <p className="text-center text-sm text-muted-foreground">
              Your premium subscription is active. No payment required for this demo.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
