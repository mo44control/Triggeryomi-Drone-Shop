import { useState } from "react";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, getListProductsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Star } from "lucide-react";
import { AdminLayout } from "@/components/layout/admin-layout";

interface ProductForm {
  name: string;
  description: string;
  price: string;
  category: string;
  imageUrl: string;
  stock: string;
  featured: boolean;
}

const EMPTY_FORM: ProductForm = {
  name: "",
  description: "",
  price: "",
  category: "",
  imageUrl: "",
  stock: "0",
  featured: false,
};

export function AdminProducts() {
  const queryClient = useQueryClient();
  const { data: products, isLoading } = useListProducts();
  const createProduct = useCreateProduct({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setAddOpen(false); setForm(EMPTY_FORM); } },
  });
  const updateProduct = useUpdateProduct({
    mutation: { onSuccess: () => { queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }); setEditOpen(false); setEditingId(null); } },
  });
  const deleteProduct = useDeleteProduct({
    mutation: { onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() }) },
  });

  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState<ProductForm>(EMPTY_FORM);

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct.mutate({
      data: {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        imageUrl: form.imageUrl,
        stock: parseInt(form.stock),
        featured: form.featured,
      },
    });
  };

  const handleEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId === null) return;
    updateProduct.mutate({
      id: editingId,
      data: {
        name: form.name,
        description: form.description,
        price: parseFloat(form.price),
        category: form.category,
        imageUrl: form.imageUrl,
        stock: parseInt(form.stock),
        featured: form.featured,
      },
    });
  };

  const openEdit = (product: NonNullable<typeof products>[number]) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      description: product.description,
      price: String(product.price),
      category: product.category,
      imageUrl: product.imageUrl,
      stock: String(product.stock),
      featured: product.featured ?? false,
    });
    setEditOpen(true);
  };

  const handleDelete = (id: number) => {
    if (confirm("Delete this product?")) {
      deleteProduct.mutate({ id });
    }
  };

  const FormFields = ({ onSubmit, pending }: { onSubmit: (e: React.FormEvent) => void; pending: boolean }) => (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Product Name</Label>
          <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required placeholder="e.g. DJI FPV Combo" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Price ($)</Label>
          <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} required placeholder="299.99" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Stock</Label>
          <Input type="number" value={form.stock} onChange={e => setForm(f => ({ ...f, stock: e.target.value }))} required placeholder="10" />
        </div>
        <div>
          <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Category</Label>
          <Input value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))} required placeholder="Racing, Camera, Parts..." />
        </div>
        <div className="flex items-center gap-3 pt-6">
          <Switch checked={form.featured} onCheckedChange={v => setForm(f => ({ ...f, featured: v }))} />
          <Label className="text-sm">Featured Product</Label>
        </div>
        <div className="col-span-2">
          <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Image URL</Label>
          <Input value={form.imageUrl} onChange={e => setForm(f => ({ ...f, imageUrl: e.target.value }))} required placeholder="https://..." />
        </div>
        <div className="col-span-2">
          <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Description</Label>
          <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} required rows={3} placeholder="Product description..." className="resize-none" />
        </div>
      </div>
      <Button type="submit" className="w-full uppercase tracking-wider" disabled={pending}>
        {pending ? "Saving..." : "Save Product"}
      </Button>
    </form>
  );

  return (
    <AdminLayout>
      <div>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold uppercase tracking-tighter mb-1">Products</h1>
            <p className="text-muted-foreground font-mono text-sm">{products?.length ?? 0} items in inventory</p>
          </div>
          <Dialog open={addOpen} onOpenChange={setAddOpen}>
            <DialogTrigger asChild>
              <Button className="uppercase tracking-wider" onClick={() => setForm(EMPTY_FORM)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Product
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle className="uppercase tracking-tighter">New Product</DialogTitle>
              </DialogHeader>
              <FormFields onSubmit={handleAdd} pending={createProduct.isPending} />
            </DialogContent>
          </Dialog>
        </div>

        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="uppercase tracking-tighter">Edit Product</DialogTitle>
            </DialogHeader>
            <FormFields onSubmit={handleEdit} pending={updateProduct.isPending} />
          </DialogContent>
        </Dialog>

        {isLoading ? (
          <div className="space-y-3">
            {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 rounded-lg" />)}
          </div>
        ) : (
          <div className="border border-border rounded-lg overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-secondary/50 border-b border-border">
                <tr>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Product</th>
                  <th className="text-left px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden md:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Price</th>
                  <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden sm:table-cell">Stock</th>
                  <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground hidden lg:table-cell">Rating</th>
                  <th className="text-right px-4 py-3 font-mono text-xs uppercase tracking-wider text-muted-foreground">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {products?.map((product) => (
                  <tr key={product.id} className="hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-10 h-10 object-contain rounded bg-secondary/30 p-1 flex-shrink-0"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=40"; }}
                        />
                        <div>
                          <p className="font-medium line-clamp-1">{product.name}</p>
                          {product.featured && (
                            <span className="text-xs text-primary font-mono">Featured</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs uppercase tracking-wider hidden md:table-cell">
                      {product.category}
                    </td>
                    <td className="px-4 py-3 text-right font-mono font-bold">
                      ${product.price.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-mono hidden sm:table-cell">
                      <span className={product.stock === 0 ? "text-destructive" : product.stock < 5 ? "text-yellow-500" : "text-green-400"}>
                        {product.stock}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <div className="flex items-center justify-end gap-1">
                        {product.averageRating ? (
                          <>
                            <Star className="h-3 w-3 fill-primary text-primary" />
                            <span className="font-mono text-xs">{product.averageRating}</span>
                          </>
                        ) : (
                          <span className="text-xs text-muted-foreground font-mono">—</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEdit(product)} className="h-8 w-8 p-0">
                          <Pencil className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(product.id)}
                          className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                          disabled={deleteProduct.isPending}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {products?.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground font-mono text-sm">
                      No products yet. Add your first product above.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
