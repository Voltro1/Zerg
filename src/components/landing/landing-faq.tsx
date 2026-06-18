"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

const faqs = [
  { q: "How does the commission system work?", a: "Post a project brief, receive proposals from vetted creators, choose the best fit, and collaborate through our built-in workflow — milestones, file sharing, and approval steps all in one place." },
  { q: "Are creators vetted?", a: "Yes. Every creator goes through a portfolio review and skill assessment. Verified badges are awarded to creators who meet our quality standards." },
  { q: "What payment protection do I have?", a: "Payments are held in escrow until you approve each milestone. You only release funds when you're satisfied with the deliverable." },
  { q: "Can I sell digital products on the platform?", a: "Absolutely. Creators can list templates, kits, presets, and any digital asset. Buyers get instant delivery via secure download links." },
  { q: "Is there a free plan?", a: "Yes. Browse creators, purchase products, and post up to 2 active commissions for free. Pro plans unlock unlimited commissions, analytics, and priority support." },
];

export function LandingFAQ() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <div className="space-y-2">
      {faqs.map((faq, i) => (
        <div key={i} className="rounded-lg border border-border bg-card">
          <button
            type="button"
            className="flex w-full items-center justify-between p-4 text-left text-sm font-medium"
            onClick={() => setOpen(open === i ? null : i)}
            aria-expanded={open === i}
          >
            {faq.q}
            {open === i ? <ChevronUp className="size-4 shrink-0" /> : <ChevronDown className="size-4 shrink-0" />}
          </button>
          {open === i && (
            <div className="border-t border-border px-4 pb-4 pt-2 text-sm text-muted-foreground">
              {faq.a}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
