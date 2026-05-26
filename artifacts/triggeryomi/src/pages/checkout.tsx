import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useCart } from "@/hooks/use-cart";
import { useGetProduct, useCreateOrder } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Shield, Lock, CheckCircle, ArrowLeft } from "lucide-react";
import { MainLayout } from "@/components/layout/main-layout";

function CartSummaryItem({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useGetProduct(productId);
  if (!product) return null;
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-secondary/30 rounded flex items-center justify-center flex-shrink-0">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="object-contain w-full h-full p-1"
            onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1579829366248-204fe8413f31?q=80&w=100"; }}
          />
        </div>
        <div>
          <p className="text-sm font-medium line-clamp-1">{product.name}</p>
          <p className="text-xs text-muted-foreground font-mono">Qty: {quantity}</p>
        </div>
      </div>
      <span className="font-mono font-bold text-sm">${(product.price * quantity).toFixed(2)}</span>
    </div>
  );
}

function CartTotal({ items }: { items: { productId: number; quantity: number }[] }) {
  const products = items.map(i => ({ productId: i.productId, quantity: i.quantity }));
  return <CartTotalInner items={items} />;
}

function CartTotalInner({ items }: { items: { productId: number; quantity: number }[] }) {
  return (
    <>
      {items.map(item => (
        <CartTotalRow key={item.productId} productId={item.productId} quantity={item.quantity} />
      ))}
    </>
  );
}

function CartTotalRow({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useGetProduct(productId);
  if (!product) return null;
  return null;
}

export function Checkout() {
  const { items, clearCart } = useCart();
  const [, navigate] = useLocation();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderId, setOrderId] = useState<number | null>(null);

  const [customerName, setCustomerName] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");

  const createOrder = useCreateOrder({
    mutation: {
      onSuccess: (data) => {
        setOrderId(data.id);
        setOrderSuccess(true);
        clearCart();
      },
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    createOrder.mutate({
      data: {
        customerName,
        customerEmail,
        shippingAddress,
        cardNumber,
        cardExpiry,
        cardCvv,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      },
    });
  };

  const formatCard = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, "$1 ").trim();
  };

  const formatExpiry = (val: string) => {
    const digits = val.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  if (orderSuccess) {
    return (
      <MainLayout>
        <div className="container px-4 md:px-8 py-24 flex flex-col items-center text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter mb-3">Order Confirmed</h1>
          <p className="text-muted-foreground font-mono text-sm mb-2">
            Order #{orderId} has been placed successfully.
          </p>
          <p className="text-muted-foreground text-sm mb-8">
            A confirmation will be sent to <strong>{customerEmail}</strong>. Your gear is being prepared for dispatch.
          </p>
          <div className="flex gap-4">
            <Link href="/products">
              <Button variant="outline" className="uppercase tracking-wider">Continue Shopping</Button>
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (items.length === 0) {
    return (
      <MainLayout>
        <div className="container px-4 md:px-8 py-24 flex flex-col items-center text-center">
          <p className="text-xl font-bold uppercase tracking-tighter mb-4">Your cart is empty</p>
          <Link href="/products">
            <Button className="uppercase tracking-wider">Browse Catalog</Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container px-4 md:px-8 py-10 max-w-6xl">
        <Link href="/cart" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 font-mono uppercase tracking-wider">
          <ArrowLeft className="h-4 w-4" />
          Back to Cart
        </Link>

        <h1 className="text-4xl font-bold uppercase tracking-tighter mb-8">Checkout</h1>

        <div className="grid md:grid-cols-3 gap-12">
          <form onSubmit={handleSubmit} className="md:col-span-2 space-y-8">
            <div className="border border-border rounded-lg p-6 bg-card">
              <h2 className="text-lg font-bold uppercase tracking-tighter mb-6">Contact Information</h2>
              <div className="grid sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Full Name</Label>
                  <Input
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="John Doe"
                    required
                    className="bg-background border-border"
                  />
                </div>
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Email Address</Label>
                  <Input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder="john@example.com"
                    required
                    className="bg-background border-border"
                  />
                </div>
              </div>
              <div className="mt-4">
                <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Shipping Address</Label>
                <Input
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="123 Main St, City, State, ZIP"
                  required
                  className="bg-background border-border"
                />
              </div>
            </div>

            <div className="border border-border rounded-lg p-6 bg-card">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold uppercase tracking-tighter">Payment Details</h2>
                <div className="flex items-center gap-2 text-xs text-muted-foreground font-mono">
                  <Lock className="h-3 w-3" />
                  256-bit SSL
                </div>
              </div>

              <div className="flex gap-2 mb-4">
                {["VISA", "MC", "AMEX", "DISC"].map(card => (
                  <div key={card} className="border border-border rounded px-2 py-1 text-xs font-mono text-muted-foreground">
                    {card}
                  </div>
                ))}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Card Number</Label>
                  <Input
                    value={cardNumber}
                    onChange={(e) => setCardNumber(formatCard(e.target.value))}
                    placeholder="4242 4242 4242 4242"
                    required
                    maxLength={19}
                    className="bg-background border-border font-mono tracking-widest"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">Expiry Date</Label>
                    <Input
                      value={cardExpiry}
                      onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                      placeholder="MM/YY"
                      required
                      maxLength={5}
                      className="bg-background border-border font-mono"
                    />
                  </div>
                  <div>
                    <Label className="text-xs uppercase tracking-wider font-mono mb-2 block">CVV</Label>
                    <Input
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, "").slice(0, 4))}
                      placeholder="123"
                      required
                      maxLength={4}
                      className="bg-background border-border font-mono"
                      type="password"
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 uppercase tracking-widest text-base"
              disabled={createOrder.isPending}
            >
              <Shield className="h-4 w-4 mr-2" />
              {createOrder.isPending ? "Processing..." : "Place Order"}
            </Button>

            <p className="text-xs text-muted-foreground font-mono text-center">
              This is a demonstration store. No real payment will be processed.
            </p>
          </form>

          <div>
            <div className="border border-border rounded-lg bg-card p-6 sticky top-20">
              <h2 className="text-lg font-bold uppercase tracking-tighter mb-4">Order Summary</h2>
              <div className="divide-y divide-border mb-4">
                {items.map((item) => (
                  <CartSummaryItem key={item.productId} productId={item.productId} quantity={item.quantity} />
                ))}
              </div>
              <Separator className="my-4" />
              <OrderTotal items={items} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

function OrderTotal({ items }: { items: { productId: number; quantity: number }[] }) {
  return (
    <div className="space-y-1">
      {items.map(item => <OrderTotalItem key={item.productId} productId={item.productId} quantity={item.quantity} />)}
    </div>
  );
}

function OrderTotalItem({ productId, quantity }: { productId: number; quantity: number }) {
  const { data: product } = useGetProduct(productId);
  if (!product) return null;
  return (
    <div className="flex justify-between text-sm">
      <span className="text-muted-foreground line-clamp-1 flex-1 mr-2">
        {product.name} x{quantity}
      </span>
      <span className="font-mono font-bold">${(product.price * quantity).toFixed(2)}</span>
    </div>
  );
}
