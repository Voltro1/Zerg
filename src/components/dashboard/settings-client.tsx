"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { profileSchema, creatorProfileSchema, type ProfileInput, type CreatorProfileInput } from "@/lib/validations";
import { updateProfileAction, updateCreatorProfileAction } from "@/actions/profile";
import type { Profile, Creator, CreatorSkill } from "@/types";

interface SettingsClientProps {
  profile: Profile;
  creator: (Creator & { creator_skills?: CreatorSkill[] }) | null;
}

export function SettingsClient({ profile, creator }: SettingsClientProps) {
  const [loading, setLoading] = useState(false);
  const isCreator = profile.role === "creator" || profile.role === "admin";

  const profileForm = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      full_name: profile.full_name || "",
      username: profile.username || "",
      bio: profile.bio || "",
      avatar_url: profile.avatar_url || "",
    },
  });

  const creatorForm = useForm<CreatorProfileInput>({
    resolver: zodResolver(creatorProfileSchema),
    defaultValues: creator ? {
      display_name: creator.display_name,
      username: creator.username,
      bio: creator.bio || "",
      category: creator.category || "General",
      price_from: creator.price_from,
      delivery_days: creator.delivery_days,
      revisions: creator.revisions,
      response_time: creator.response_time || "< 24h",
      available: creator.available,
      languages: creator.languages || [],
      tags: creator.tags || [],
      skills: creator.creator_skills?.map((s) => s.skill) || [],
    } : undefined,
  });

  const onProfileSubmit = async (data: ProfileInput) => {
    setLoading(true);
    const result = await updateProfileAction(data);
    setLoading(false);
    if (result.success) toast.success("Profile updated!");
    else toast.error(result.error);
  };

  const onCreatorSubmit = async (data: CreatorProfileInput) => {
    setLoading(true);
    const result = await updateCreatorProfileAction(data);
    setLoading(false);
    if (result.success) toast.success("Creator profile updated!");
    else toast.error(result.error);
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Settings</h1>
        <p className="mt-1 text-muted-foreground">Manage your account and profile</p>
      </div>

      <Tabs defaultValue="profile">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          {isCreator && <TabsTrigger value="creator">Creator Profile</TabsTrigger>}
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Account Settings</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="full_name">Full Name</Label>
                  <Input id="full_name" {...profileForm.register("full_name")} error={profileForm.formState.errors.full_name?.message} />
                </div>
                <div>
                  <Label htmlFor="username">Username</Label>
                  <Input id="username" {...profileForm.register("username")} error={profileForm.formState.errors.username?.message} />
                </div>
                <div>
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" {...profileForm.register("bio")} />
                </div>
                <Button type="submit" loading={loading}>Save Changes</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {isCreator && creator && (
          <TabsContent value="creator" className="mt-6">
            <Card>
              <CardHeader><CardTitle className="text-base">Creator Settings</CardTitle></CardHeader>
              <CardContent>
                <form onSubmit={creatorForm.handleSubmit(onCreatorSubmit)} className="space-y-4">
                  <div>
                    <Label>Display Name</Label>
                    <Input {...creatorForm.register("display_name")} />
                  </div>
                  <div>
                    <Label>Category</Label>
                    <Input {...creatorForm.register("category")} />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label>Price From ($)</Label>
                      <Input type="number" {...creatorForm.register("price_from")} />
                    </div>
                    <div>
                      <Label>Delivery Days</Label>
                      <Input type="number" {...creatorForm.register("delivery_days")} />
                    </div>
                    <div>
                      <Label>Revisions</Label>
                      <Input type="number" {...creatorForm.register("revisions")} />
                    </div>
                  </div>
                  <div>
                    <Label>Skills (comma separated)</Label>
                    <Input
                      defaultValue={creator.creator_skills?.map((s) => s.skill).join(", ")}
                      onChange={(e) => creatorForm.setValue("skills", e.target.value.split(",").map((s) => s.trim()).filter(Boolean))}
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={creatorForm.watch("available")}
                      onCheckedChange={(v) => creatorForm.setValue("available", v)}
                    />
                    <Label>Available for work</Label>
                  </div>
                  <Button type="submit" loading={loading}>Save Creator Profile</Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
