"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  loginSchema,
  registerSchema,
  forgotPasswordSchema,
  type LoginInput,
  type RegisterInput,
  type ForgotPasswordInput,
} from "@/lib/validations";

export type ActionResult<T = void> =
  | { success: true; data?: T }
  | { success: false; error: string };

type RegisterResult = {
  message: string;
  nextPath: string;
};

export async function loginAction(input: LoginInput): Promise<ActionResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { success: false, error: error.message };

  revalidatePath("/", "layout");
  redirect("/dashboard");
}

export async function registerAction(input: RegisterInput): Promise<ActionResult<RegisterResult>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const normalizedUsername = parsed.data.username.toLowerCase();
  const normalizedEmail = parsed.data.email.toLowerCase();

  const [{ data: existingUsername }, { data: existingEmail }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id")
      .eq("username", normalizedUsername)
      .maybeSingle(),
    supabase
      .from("profiles")
      .select("id")
      .eq("email", normalizedEmail)
      .maybeSingle(),
  ]);

  if (existingUsername) {
    return { success: false, error: "That username is already taken." };
  }

  if (existingEmail) {
    return { success: false, error: "An account already exists for that email." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: normalizedEmail,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.full_name,
        username: normalizedUsername,
        role: parsed.data.role,
      },
    },
  });

  if (error) return { success: false, error: error.message };

  if (parsed.data.role === "creator" && data.user && data.session) {
    const { error: creatorError } = await supabase
      .from("creators")
      .upsert(
        {
          user_id: data.user.id,
          display_name: parsed.data.full_name,
          username: normalizedUsername,
          category: "General",
        },
        { onConflict: "user_id", ignoreDuplicates: true }
      );

    if (creatorError) {
      return { success: false, error: creatorError.message };
    }
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    return {
      success: true,
      data: {
        message: "Account created. Check your email to confirm your account before signing in.",
        nextPath: "/login",
      },
    };
  }

  return {
    success: true,
    data: {
      message: "Account created.",
      nextPath: "/dashboard",
    },
  };
}

export async function forgotPasswordAction(input: ForgotPasswordInput): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0].message };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.resetPasswordForEmail(parsed.data.email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/login`,
  });

  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function logoutAction(): Promise<void> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  revalidatePath("/", "layout");
  redirect("/login");
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return profile;
}

export async function getCurrentCreator() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: creator } = await supabase
    .from("creators")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return creator;
}
