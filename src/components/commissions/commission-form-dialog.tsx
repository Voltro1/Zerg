"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { commissionSchema, type CommissionInput } from "@/lib/validations";
import { createCommissionAction } from "@/actions/commissions";
import { useRouter } from "next/navigation";

interface CommissionFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  creatorId?: string;
  creatorName?: string;
}

export function CommissionFormDialog({
  open,
  onOpenChange,
  creatorId,
  creatorName,
}: CommissionFormDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, reset, formState: { errors } } = useForm<CommissionInput>({
    resolver: zodResolver(commissionSchema),
    defaultValues: { creator_id: creatorId },
  });

  const onSubmit = async (data: CommissionInput) => {
    setLoading(true);
    const result = await createCommissionAction({ ...data, creator_id: creatorId });
    setLoading(false);
    if (result.success) {
      toast.success("Commission request sent!");
      reset();
      onOpenChange(false);
      router.push(`/dashboard/commissions/${result.data?.id}`);
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Request Commission</DialogTitle>
          {creatorName && (
            <DialogDescription>Send a project brief to {creatorName}</DialogDescription>
          )}
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Label htmlFor="title">Project Title</Label>
            <Input id="title" {...register("title")} error={errors.title?.message} />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" rows={4} {...register("description")} error={errors.description?.message} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="budget">Budget ($)</Label>
              <Input id="budget" type="number" {...register("budget")} error={errors.budget?.message} />
            </div>
            <div>
              <Label htmlFor="deadline">Deadline</Label>
              <Input id="deadline" type="date" {...register("deadline")} />
            </div>
          </div>
          <div>
            <Label htmlFor="requirements">Requirements</Label>
            <Textarea id="requirements" rows={3} {...register("requirements")} />
          </div>
          <Button type="submit" className="w-full" loading={loading}>Send Request</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
