import { Link } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Zap, Crosshair, Star } from "lucide-react";
import { useCart } from "@/hooks/use-cart";
import { MainLayout } from "@/components/layout/main-layout";

export function Home() {
  const { data: products, isLoading } = useListProducts();
  const { addToCart } = useCart();

  const featured = products?.filter(p => p.featured).slice(0, 4);
  const displayProducts = featured?.length ? featured : products?.slice(0, 4);

  return (
    <MainLayout>
      <div className="flex flex-col pb-20">
        <section className="relative h-[80vh] flex items-center overflow-hidden border-b border-border bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-background to-background z-0" />
          <div
            className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-luminosity z-0"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1473968512647-3e447244af8f?q=80&w=2070')" }}
          />
          <div className="container relative z-10 px-4 md:px-8">
            <div className="max-w-3xl">
              <Badge variant="outline" className="mb-6 border-primary/50 text-primary uppercase tracking-widest font-mono text-xs bg-primary/10">
                Military Grade · Precision Engineered
              </Badge>
              <h1 className="text-5xl md:text-7xl font-bold uppercase tracking-tighter mb-6 leading-tight text-white">
                Own the <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-accent">Sky</span>.<br />
                No <span className="text-transparent bg-clip-text bg-gradient-to-r from-muted-foreground to-border">Compromises</span>.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl font-mono">
                High-performance racing drones, professional camera rigs, and aerospace-grade replacement parts.
              </p>
              <div className="flex flex-wrap gap-4">
                <Link href="/products">
                  <Button className="h-12 px-8 uppercase tracking-widest hover-elevate">
                    Explore Fleet
                  </Button>
                </Link>
                <Link href="/products?category=parts">
                  <Button variant="outline" className="h-12 px-8 uppercase tracking-widest hover-elevate">
                    Spare Parts
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="border-b border-border bg-card">
          <div className="container grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            {[
              { icon: Zap, title: "Zero Latency", desc: "OcuSync 3.0+ compatible transmission systems for instantaneous response." },
              { icon: Crosshair, title: "Surgical Precision", desc: "Carbon fiber frames and brushless motors calibrated to microscopic tolerances." },
              { icon: ShieldCheck, title: "Combat Tested", desc: "Every component stress-tested in extreme conditions before shipping." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="p-8 flex items-start gap-4">
                <div className="bg-primary/10 p-3 rounded-lg text-primary flex-shrink-0">
                  <Icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="container px-4 md:px-8 py-16 md:py-24">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="text-3xl font-bold uppercase tracking-tighter">Featured Arsenal</h2>
              <p className="text-muted-foreground font-mono text-sm mt-2">Top tier equipment selected by our engineers.</p>
            </div>
            <Link href="/products" className="text-sm font-medium text-primary hover:underline uppercase tracking-wider hidden md:block">
              View All →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {isLoading ? (
              Array(4).fill(0).map((_, i) => (
                <div key={i} className="flex flex-col gap-3">
                  <Skeleton className="h-64 w-full rounded-lg" />
                  <Skeleton className="h-4 w-2/3" />
                  <Skeleton className="h-4 w-1/3" />
                </div>
              ))
            ) : (
              displayProducts?.map((product) => (
                <div key={product.id} className="group border border-border rounded-lg bg-card overflow-hidden hover:border-primary transition-all duration-200 flex flex-col">
                  <Link href={`/products/${product.id}`} className="block">
                    <div className="aspect-square relative bg-secondary/30 p-6 flex items-center justify-center overflow-hidden">
                      {product.soldLastMonth > 0 && (
                        <Badge className="absolute top-3 left-3 bg-background/80 text-foreground backdrop-blur border-border font-mono text-xs">
                          {product.soldLastMonth} sold this month
                        </Badge>
                      )}
                      <img
                        src={product.imageUrl}
                        alt={product.name}
                        className="object-contain w-full h-full mix-blend-luminosity group-hover:mix-blend-normal transition-all duration-500 group-hover:scale-105"
                        onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=400"; }}
                      />
                    </div>
                  </Link>
                  <div className="p-5 border-t border-border flex flex-col flex-1">
                    <div className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-mono">{product.category}</div>
                    <Link href={`/products/${product.id}`}>
                      <h3 className="font-bold text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.name}</h3>
                    </Link>
                    {product.averageRating && (
                      <div className="flex items-center gap-1 mb-2">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.round(product.averageRating!) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                        ))}
                        <span className="text-xs text-muted-foreground font-mono ml-1">({product.reviewCount})</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between mt-auto">
                      <span className="font-mono font-bold text-xl">${product.price.toFixed(2)}</span>
                      <Button size="sm" className="uppercase tracking-wider text-xs" onClick={() => addToCart(product.id, 1)}>
                        Add
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
          <div className="mt-8 md:hidden">
            <Link href="/products">
              <Button variant="outline" className="w-full uppercase tracking-widest">View All</Button>
            </Link>
          </div>
        </section>
      </div>
    </MainLayout>
  );
}
