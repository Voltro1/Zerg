"use client";

import Link from "next/link";
import { useState } from "react";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CommissionFormDialog } from "@/components/commissions/commission-form-dialog";
import { formatCurrency } from "@/lib/utils";
import type { Commission, CommissionStatus } from "@/types";

const columnLabels: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  in_progress: "In Progress",
  review: "Review",
  completed: "Completed",
};

const statusOrder: CommissionStatus[] = [
  "pending",
  "accepted",
  "in_progress",
  "review",
  "completed",
];

const statusColors: Record<CommissionStatus, string> = {
  pending:
    "border-yellow-500/30 bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  accepted:
    "border-cyan-500/30 bg-cyan-500/10 text-cyan-600 dark:text-cyan-400",
  in_progress:
    "border-fuchsia-500/30 bg-fuchsia-500/10 text-fuchsia-600 dark:text-fuchsia-400",
  review:
    "border-orange-500/30 bg-orange-500/10 text-orange-600 dark:text-orange-400",
  completed:
    "border-green-500/30 bg-green-500/10 text-green-600 dark:text-green-400",
  cancelled:
    "border-red-500/30 bg-red-500/10 text-red-600 dark:text-red-400"
};

export function CommissionKanban({
  commissions: initial,
  isCreator,
}: {
  commissions: Commission[];
  isCreator: boolean;
}) {
  const [dialogOpen, setDialogOpen] = useState(false);

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Commissions</h1>
          <p className="text-muted-foreground">
            Manage your project pipeline
          </p>
        </div>

        {!isCreator && (
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="mr-2 size-4" />
            New Commission
          </Button>
        )}
      </div>

      <div className="space-y-10">
        {statusOrder.map((status) => {
          const items = initial
            .filter((c) => c.status === status)
            .sort((a, b) => a.sort_order - b.sort_order);

          if (!items.length) return null;

          return (
            <section key={status}>
              <div className="mb-4 flex items-center gap-3">
                <Badge className={statusColors[status]}>
                  {columnLabels[status]}
                </Badge>

                <span className="text-sm text-muted-foreground">
                  {items.length} commission
                  {items.length !== 1 ? "s" : ""}
                </span>
              </div>

              <div className="space-y-3">
                {items.map((commission) => (
                  <Link
                    key={commission.id}
                    href={`/dashboard/commissions/${commission.id}`}
                  >
                    <Card className="mb-3 cursor-pointer transition-all hover:border-primary/30 hover:shadow-md">
                      <CardContent className="p-5">
                        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className="truncate font-semibold">
                                {commission.title}
                              </h3>

                              <Badge className={statusColors[status]}>
                                {columnLabels[status]}
                              </Badge>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-4 text-sm">
                              <span className="font-medium text-primary">
                                {formatCurrency(commission.budget)}
                              </span>

                              {commission.creator && (
                                <span className="text-muted-foreground">
                                  {commission.creator.display_name}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <CommissionFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}