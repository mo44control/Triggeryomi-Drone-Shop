import { ReactNode } from "react";
import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { ShoppingCart, Hexagon, ShieldAlert, Mail, Phone } from "lucide-react";

export function MainLayout({ children }: { children: ReactNode }) {
  const { cartCount } = useCart();

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground dark">
      <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 max-w-screen-2xl items-center px-4 md:px-8">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl uppercase tracking-tighter">
            <Hexagon className="h-6 w-6 text-primary" />
            <span>Triggery<span className="text-primary">Omi</span></span>
          </Link>

          <nav className="mx-6 flex items-center gap-4 text-sm font-medium text-muted-foreground hidden md:flex">
            <Link href="/products" className="transition-colors hover:text-foreground">Catalog</Link>
            <Link href="/products?category=racing" className="transition-colors hover:text-foreground">Racing</Link>
            <Link href="/products?category=parts" className="transition-colors hover:text-foreground">Parts</Link>
          </nav>

          <div className="ml-auto flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-medium text-muted-foreground hover:text-foreground flex items-center gap-2"
            >
              <ShieldAlert className="h-4 w-4" />
              <span className="hidden md:inline">Command</span>
            </Link>
            <Link href="/cart" className="relative p-2 text-foreground hover:text-primary transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 h-4 w-4 rounded-full bg-primary text-[10px] font-bold text-primary-foreground flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      <footer className="border-t border-border/40 bg-card">
        <div className="container max-w-screen-2xl px-4 md:px-8 py-8 md:py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 font-bold text-lg uppercase tracking-tighter mb-3">
                <Hexagon className="h-5 w-5 text-primary" />
                <span>Triggery<span className="text-primary">Omi</span></span>
              </div>
              <p className="text-muted-foreground text-sm font-mono leading-relaxed">
                Military-grade drones and aerospace parts for professionals and enthusiasts.
              </p>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider font-mono text-muted-foreground mb-3">Shop</h3>
              <div className="flex flex-col gap-2 text-sm text-muted-foreground">
                <Link href="/products" className="hover:text-foreground transition-colors">All Products</Link>
                <Link href="/products?category=racing" className="hover:text-foreground transition-colors">Racing Drones</Link>
                <Link href="/products?category=camera" className="hover:text-foreground transition-colors">Camera Drones</Link>
                <Link href="/products?category=parts" className="hover:text-foreground transition-colors">Spare Parts</Link>
              </div>
            </div>

            <div>
              <h3 className="text-xs uppercase tracking-wider font-mono text-muted-foreground mb-3">Contact</h3>
              <div className="flex flex-col gap-3">
                <a
                  href="mailto:sales@triggeryomi.com"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                >
                  <Mail className="h-4 w-4 flex-shrink-0" />
                  sales@triggeryomi.com
                </a>
                <a
                  href="tel:+18453775898"
                  className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors font-mono"
                >
                  <Phone className="h-4 w-4 flex-shrink-0" />
                  (845) 377-5898
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/40 pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} TriggeryOmi Aerospace. All rights reserved.</p>
            <div className="flex gap-4">
              <Link href="#" className="hover:text-foreground">Terms</Link>
              <Link href="#" className="hover:text-foreground">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
