"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { forgotPasswordSchema, type ForgotPasswordInput } from "@/lib/validations";
import { forgotPasswordAction } from "@/actions/auth";
import { ArrowLeft } from "lucide-react";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setLoading(true);
    const result = await forgotPasswordAction(data);
    setLoading(false);
    if (result.success) {
      setSent(true);
      toast.success("Password reset email sent!");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-3.5rem)] items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="font-display text-2xl">Reset password</CardTitle>
          <CardDescription>
            {sent ? "Check your email for a reset link." : "Enter your email to receive a reset link."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!sent ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" {...register("email")} error={errors.email?.message} />
              </div>
              <Button type="submit" className="w-full" loading={loading}>Send Reset Link</Button>
            </form>
          ) : (
            <Link href="/login">
              <Button className="w-full">Back to Sign In</Button>
            </Link>
          )}
          <Link href="/login" className="mt-4 flex items-center justify-center gap-1 text-sm text-muted-foreground hover:text-primary">
            <ArrowLeft className="size-3" /> Back to login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
