import { redirect } from "next/navigation";
import { SettingsClient } from "@/components/dashboard/settings-client";
import { getCurrentUser } from "@/actions/auth";
import { createClient } from "@/lib/supabase/server";

export const metadata = { title: "Settings" };

export default async function SettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  let creator = null;
  if (user.role === "creator" || user.role === "admin") {
    const supabase = await createClient();
    const { data } = await supabase
      .from("creators")
      .select("*, creator_skills(*)")
      .eq("user_id", user.id)
      .single();
    creator = data;
  }

  return <SettingsClient profile={user} creator={creator} />;
}
