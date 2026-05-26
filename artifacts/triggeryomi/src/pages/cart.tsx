import { Link } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useGetProduct } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Trash2, ShoppingCart, ArrowRight } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

function CartItemRow({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useGetProduct(productId);
  const { removeFromCart, updateQuantity } = useCart();

  if (!product) return null;

  return (
    <div className="flex items-center gap-6 py-6 border-b border-border">
      <div className="w-20 h-20 rounded-lg bg-secondary/30 flex items-center justify-center flex-shrink-0 p-2">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="object-contain w-full h-full"
          onError={(e) => {
            (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=100";
          }}
        />
      </div>
      <div className="flex-1 min-w-0">
        <Link href={`/products/${product.id}`} className="font-bold text-base hover:text-primary transition-colors line-clamp-1">
          {product.name}
        </Link>
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider mt-1">{product.category}</p>
        <p className="font-mono font-bold mt-2">${product.price.toFixed(2)}</p>
      </div>
      <div className="flex items-center border border-border rounded-md overflow-hidden flex-shrink-0">
        <button
          className="px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors text-sm"
          onClick={() => updateQuantity(productId, quantity - 1)}
        >
          -
        </button>
        <span className="px-3 py-2 font-mono text-sm border-x border-border">{quantity}</span>
        <button
          className="px-3 py-2 text-muted-foreground hover:bg-secondary transition-colors text-sm"
          onClick={() => updateQuantity(productId, quantity + 1)}
        >
          +
        </button>
      </div>
      <div className="font-mono font-bold w-20 text-right flex-shrink-0">
        ${(product.price * quantity).toFixed(2)}
      </div>
      <button
        className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0"
        onClick={() => removeFromCart(productId)}
      >
        <Trash2 className="h-4 w-4" />
      </button>
    </div>
  );
}

export function Cart() {
  const { items, clearCart } = useCart();

  return (
    <MainLayout>
      <div className="container px-4 md:px-8 py-10">
        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Cart</h1>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center border border-border rounded-lg bg-card">
            <ShoppingCart className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-xl font-bold uppercase tracking-tighter mb-2">Your Cart is Empty</p>
            <p className="text-muted-foreground text-sm font-mono mb-8">Add some drones or parts to get started.</p>
            <Link href="/products">
              <Button className="uppercase tracking-wider">Browse Catalog</Button>
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-12">
            <div className="md:col-span-2">
              <div className="border-t border-border">
                {items.map((item) => (
                  <CartItemRow key={item.productId} productId={item.productId} quantity={item.quantity} />
                ))}
              </div>
              <div className="mt-4">
                <button
                  onClick={clearCart}
                  className="text-sm text-muted-foreground hover:text-destructive transition-colors font-mono uppercase tracking-wider"
                >
                  Clear Cart
                </button>
              </div>
            </div>

            <div>
              <OrderSummary items={items} />
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

function OrderSummary({ items }: { items: { productId: number; quantity: number }[] }) {
  return (
    <OrderSummaryInner items={items} />
  );
}

function OrderSummaryInner({ items }: { items: { productId: number; quantity: number }[] }) {
  const products = items.map(item => {
    return { ...item };
  });

  return (
    <div className="border border-border rounded-lg bg-card p-6 sticky top-20">
      <h2 className="text-lg font-bold uppercase tracking-tighter mb-6">Order Summary</h2>
      <div className="space-y-4 mb-6">
        {items.map((item) => (
          <ProductSummaryRow key={item.productId} productId={item.productId} quantity={item.quantity} />
        ))}
      </div>
      <div className="border-t border-border pt-4 mb-6">
        <TotalRow items={items} />
      </div>
      <Link href="/checkout">
        <Button className="w-full uppercase tracking-wider">
          Proceed to Checkout
          <ArrowRight className="h-4 w-4 ml-2" />
        </Button>
      </Link>
    </div>
  );
}

function ProductSummaryRow({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useGetProduct(productId);
  if (!product) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">{product.name} x{quantity}</span>
      <span className="font-mono font-bold">${(product.price * quantity).toFixed(2)}</span>
    </div>
  );
}

function TotalRow({ items }: { items: { productId: number; quantity: number }[] }) {
  const totals = items.map(item => {
    return <TotalContrib key={item.productId} productId={item.productId} quantity={item.quantity} />;
  });
  return <>{totals}</>;
}

function TotalContrib({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useGetProduct(productId);
  if (!product) return null;
  return (
    <div className="flex justify-between font-bold">
      <span>Subtotal</span>
      <span className="font-mono">${(product.price * quantity).toFixed(2)}</span>
    </div>
  );
}
