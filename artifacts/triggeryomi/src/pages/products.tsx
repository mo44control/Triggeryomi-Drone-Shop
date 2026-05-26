import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Star, ShoppingCart } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { MainLayout } from "@/components/layout/main-layout";

const CATEGORIES = ["All", "Racing", "Camera", "FPV", "Parts", "Accessories"];

export function Products() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [searchQuery, setSearchQuery] = useState(params.get("search") || "");
  const [activeCategory, setActiveCategory] = useState(params.get("category") || "All");
  const { addToCart } = useCart();

  const queryParams: { category?: string; search?: string } = {};
  if (activeCategory !== "All") queryParams.category = activeCategory;
  if (searchQuery) queryParams.search = searchQuery;

  const { data: products, isLoading } = useListProducts(queryParams);

  return (
    <MainLayout>
      <div className="container px-4 md:px-8 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold uppercase tracking-tighter mb-2">Catalog</h1>
          <p className="text-muted-foreground font-mono text-sm">
            {products ? `${products.length} items available` : "Loading inventory..."}
          </p>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              className="pl-10 bg-card border-border font-mono"
              placeholder="Search drones, parts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={activeCategory === cat ? "default" : "outline"}
                size="sm"
                className="uppercase tracking-wider text-xs font-mono"
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </Button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <Skeleton className="h-56 w-full rounded-lg" />
                <Skeleton className="h-4 w-2/3" />
                <Skeleton className="h-4 w-1/3" />
              </div>
            ))}
          </div>
        ) : products?.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="text-4xl mb-4 text-muted-foreground">--</div>
            <p className="text-xl font-bold uppercase tracking-tighter mb-2">No Items Found</p>
            <p className="text-muted-foreground text-sm font-mono">Adjust your search or category filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products?.map((product) => (
              <div key={product.id} className="group border border-border rounded-lg bg-card overflow-hidden hover:border-primary transition-all duration-200 flex flex-col">
                <Link href={`/products/${product.id}`} className="block">
                  <div className="aspect-square relative bg-secondary/30 p-6 flex items-center justify-center overflow-hidden">
                    {product.soldLastMonth > 0 && (
                      <Badge className="absolute top-3 left-3 bg-primary/90 text-primary-foreground font-mono text-xs">
                        {product.soldLastMonth} sold
                      </Badge>
                    )}
                    {product.featured && (
                      <Badge variant="outline" className="absolute top-3 right-3 border-primary/50 text-primary text-xs">
                        Featured
                      </Badge>
                    )}
                    <img
                      src={product.imageUrl}
                      alt={product.name}
                      className="object-contain w-full h-full mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 group-hover:scale-105"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=400";
                      }}
                    />
                  </div>
                </Link>
                <div className="p-5 border-t border-border flex flex-col flex-1">
                  <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-mono">
                    {product.category}
                  </div>
                  <Link href={`/products/${product.id}`}>
                    <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                      {product.name}
                    </h3>
                  </Link>
                  {product.averageRating && (
                    <div className="flex items-center gap-1 mb-3">
                      {Array(5).fill(0).map((_, i) => (
                        <Star
                          key={i}
                          className={`h-3 w-3 ${i < Math.round(product.averageRating!) ? "fill-primary text-primary" : "text-muted-foreground"}`}
                        />
                      ))}
                      <span className="text-xs text-muted-foreground font-mono ml-1">
                        ({product.reviewCount})
                      </span>
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-mono font-bold text-xl">${product.price.toFixed(2)}</span>
                    <Button
                      size="sm"
                      className="uppercase tracking-wider text-xs"
                      onClick={() => addToCart(product.id, 1)}
                      disabled={product.stock === 0}
                    >
                      <ShoppingCart className="h-3 w-3 mr-1" />
                      {product.stock === 0 ? "Out" : "Add"}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
