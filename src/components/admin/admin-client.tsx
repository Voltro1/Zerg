"use client";

import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { updateUserRoleAction, toggleProductPublishedAction, toggleCreatorFeaturedAction } from "@/actions/social";
import { formatCurrency, formatDate } from "@/lib/utils";
import type { Profile, Creator, Product, Commission } from "@/types";

interface AdminClientProps {
  stats: { totalUsers: number; totalCreators: number; totalProducts: number; totalCommissions: number };
  users: Profile[];
  creators: Creator[];
  products: Product[];
  commissions: Commission[];
}

export function AdminClient({ stats, users, creators, products, commissions }: AdminClientProps) {
  const handleRoleChange = async (userId: string, role: "client" | "creator" | "admin") => {
    const result = await updateUserRoleAction(userId, role);
    if (result.success) toast.success("Role updated");
    else toast.error(result.error);
  };

  const handleTogglePublished = async (productId: string, published: boolean) => {
    const result = await toggleProductPublishedAction(productId, published);
    if (result.success) toast.success(published ? "Product published" : "Product unpublished");
    else toast.error(result.error);
  };

  const handleToggleFeatured = async (creatorId: string, featured: boolean) => {
    const result = await toggleCreatorFeaturedAction(creatorId, featured);
    if (result.success) toast.success(featured ? "Creator featured" : "Feature removed");
    else toast.error(result.error);
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-3xl font-bold">Admin Panel</h1>
        <p className="mt-1 text-muted-foreground">Platform management and moderation</p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Users", value: stats.totalUsers },
          { label: "Creators", value: stats.totalCreators },
          { label: "Products", value: stats.totalProducts },
          { label: "Commissions", value: stats.totalCommissions },
        ].map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-2xl font-bold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="creators">Creators</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="commissions">Commissions</TabsTrigger>
        </TabsList>

        <TabsContent value="users" className="mt-4">
          <div className="space-y-2">
            {users.map((user) => (
              <Card key={user.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{user.full_name}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                  <Select
                    defaultValue={user.role}
                    onValueChange={(v) => handleRoleChange(user.id, v as "client" | "creator" | "admin")}
                  >
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="client">Client</SelectItem>
                      <SelectItem value="creator">Creator</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="creators" className="mt-4">
          <div className="space-y-2">
            {creators.map((creator) => (
              <Card key={creator.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{creator.display_name}</p>
                    <p className="text-xs text-muted-foreground">@{creator.username} · {creator.category}</p>
                  </div>
                  <Button
                    variant={creator.featured ? "default" : "outline"}
                    size="sm"
                    onClick={() => handleToggleFeatured(creator.id, !creator.featured)}
                  >
                    {creator.featured ? "Featured" : "Feature"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <div className="space-y-2">
            {products.map((product) => (
              <Card key={product.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{product.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatCurrency(product.price)} · by {product.creator?.display_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={product.published ? "success" : "outline"}>
                      {product.published ? "Published" : "Unpublished"}
                    </Badge>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleTogglePublished(product.id, !product.published)}
                    >
                      {product.published ? "Unpublish" : "Publish"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="commissions" className="mt-4">
          <div className="space-y-2">
            {commissions.map((c) => (
              <Card key={c.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{c.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.client?.full_name} → {c.creator?.display_name || "Unassigned"} · {formatDate(c.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline">{c.status.replace("_", " ")}</Badge>
                    <span className="text-sm font-medium text-primary">{formatCurrency(c.budget)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
