"use client";

import { toast } from "sonner";
import { useState } from "react";
import { Plus, Trash2, Edit } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { productSchema, type ProductInput } from "@/lib/validations";
import { createProductAction, updateProductAction, deleteProductAction, uploadProductImageAction } from "@/actions/products";
import { formatCurrency } from "@/lib/utils";
import type { Product, ProductCategory } from "@/types";

export function ProductsManageClient({
  products: initial,
  categories,
}: {
  products: Product[];
  categories: ProductCategory[];
}) {
  const [products, setProducts] = useState(initial);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const { register, handleSubmit, control, reset, formState: { errors } } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: { published: true, tags: [], images: [] },
  });

  const openCreate = () => {
    setEditing(null);
    setImages([]);
    reset({ title: "", description: "", price: 0, category_id: "", published: true, tags: [], images: [] });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditing(product);
    setImages(product.images || []);
    reset({
      title: product.title,
      description: product.description,
      price: product.price,
      category_id: product.category_id || "",
      published: product.published,
      tags: product.tags || [],
      images: product.images || [],
    });
    setDialogOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append("file", file);
    const result = await uploadProductImageAction(formData);
    if (result.success && result.data) {
      setImages((prev) => [...prev, result.data!.url]);
    } else if (!result.success) {
      toast.error(result.error);
    }
  };

  const onSubmit = async (data: ProductInput) => {
    setLoading(true);
    const payload = { ...data, images };
    const result = editing
      ? await updateProductAction(editing.id, payload)
      : await createProductAction(payload);
    setLoading(false);
    if (result.success) {
      toast.success(editing ? "Product updated!" : "Product created!");
      setDialogOpen(false);
      window.location.reload();
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this product?")) return;
    const result = await deleteProductAction(id);
    if (result.success) {
      setProducts(products.filter((p) => p.id !== id));
      toast.success("Product deleted");
    } else {
      toast.error(result.error);
    }
  };

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold">My Products</h1>
          <p className="mt-1 text-muted-foreground">Create and manage your digital products</p>
        </div>
        <Button onClick={openCreate}><Plus className="size-4" /> New Product</Button>
      </div>

      {products.length > 0 ? (
        <div className="space-y-3">
          {products.map((product) => (
            <Card key={product.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{product.title}</h3>
                    <Badge variant={product.published ? "success" : "outline"}>
                      {product.published ? "Published" : "Draft"}
                    </Badge>
                  </div>
                  <p className="text-sm text-primary font-medium">{formatCurrency(product.price)}</p>
                </div>
                <div className="flex gap-2">
                  <Link href={`/products/${product.slug}`}>
                    <Button variant="outline" size="sm">View</Button>
                  </Link>
                  <Button variant="outline" size="icon" onClick={() => openEdit(product)}>
                    <Edit className="size-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => handleDelete(product.id)}>
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-muted-foreground mb-4">No products yet. Create your first one!</p>
            <Button onClick={openCreate}><Plus className="size-4" /> Create Product</Button>
          </CardContent>
        </Card>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Product" : "Create Product"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input {...register("title")} error={errors.title?.message} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea rows={4} {...register("description")} error={errors.description?.message} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Price ($)</Label>
                <Input type="number" step="0.01" {...register("price")} error={errors.price?.message} />
              </div>
              <div>
                <Label>Category</Label>
                <Controller
                  name="category_id"
                  control={control}
                  render={({ field }) => (
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
              </div>
            </div>
            <div>
              <Label>Images</Label>
              <Input type="file" accept="image/*" onChange={handleImageUpload} />
              {images.length > 0 && (
                <p className="mt-1 text-xs text-muted-foreground">{images.length} image(s) uploaded</p>
              )}
            </div>
            <Button type="submit" className="w-full" loading={loading}>
              {editing ? "Update Product" : "Create Product"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
