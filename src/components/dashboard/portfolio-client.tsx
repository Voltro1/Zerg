"use client";

import { useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { EmptyState } from "@/components/shared/empty-state";
import { addPortfolioItemAction, deletePortfolioItemAction } from "@/actions/social";
import { uploadProductImageAction } from "@/actions/products";
import type { CreatorPortfolio } from "@/types";

export function PortfolioClient({ items: initial }: { items: CreatorPortfolio[] }) {
  const [items, setItems] = useState(initial);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductImageAction(formData);
    if (result.success && result.data) {
      setImageUrl(result.data.url);
      toast.success("Image uploaded");
    } else if (!result.success) {
      toast.error(result.error);
    }
  };

  const handleAdd = async () => {
    if (!title || !imageUrl) {
      toast.error("Title and image are required");
      return;
    }
    setLoading(true);
    const result = await addPortfolioItemAction({ title, image_url: imageUrl, description });
    setLoading(false);
    if (result.success) {
      toast.success("Portfolio item added");
      setOpen(false);
      setTitle("");
      setDescription("");
      setImageUrl("");
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    const result = await deletePortfolioItemAction(id);
    if (result.success) {
      setItems(items.filter((i) => i.id !== id));
      toast.success("Item removed");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">Portfolio</h1>
          <p className="mt-1 text-muted-foreground">Showcase your best work</p>
        </div>
        <Button onClick={() => setOpen(true)}><Plus className="size-4" /> Add Item</Button>
      </div>

      {items.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="overflow-hidden">
              <div className="relative aspect-[4/3]">
                <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="33vw" />
              </div>
              <CardContent className="flex items-start justify-between p-4">
                <div>
                  <h3 className="font-semibold">{item.title}</h3>
                  {item.description && <p className="text-sm text-muted-foreground mt-1">{item.description}</p>}
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
                  <Trash2 className="size-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <EmptyState title="No portfolio items" description="Add your best work to attract clients." actionLabel="Add Item" onAction={() => setOpen(true)} />
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add Portfolio Item</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={handleUpload} />
            </div>
            <Button className="w-full" onClick={handleAdd} loading={loading}>Add to Portfolio</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
