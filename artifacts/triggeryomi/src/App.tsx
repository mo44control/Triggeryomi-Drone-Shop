import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { CartProvider } from "@/hooks/use-cart";
import { AdminAuthProvider, useAdminAuth } from "@/hooks/use-admin-auth";
import { Home } from "@/pages/home";
import { Products } from "@/pages/products";
import { ProductDetail } from "@/pages/product-detail";
import { Cart } from "@/pages/cart";
import { Checkout } from "@/pages/checkout";
import { AdminDashboard } from "@/pages/admin/dashboard";
import { AdminProducts } from "@/pages/admin/products";
import { AdminOrders } from "@/pages/admin/orders";
import { AdminSettings } from "@/pages/admin/settings";
import { AdminLogin } from "@/pages/admin/login";
import NotFound from "@/pages/not-found";
import { useEffect, type JSX } from "react";

const queryClient = new QueryClient();

function ProtectedAdminRoute({ component: Component }: { component: () => JSX.Element }) {
  const { isAuthenticated } = useAdminAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (isAuthenticated === false) {
      navigate("/admin/login");
    }
  }, [isAuthenticated, navigate]);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-[100dvh] flex items-center justify-center bg-background dark">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/products" component={Products} />
      <Route path="/products/:id" component={ProductDetail} />
      <Route path="/cart" component={Cart} />
      <Route path="/checkout" component={Checkout} />
      <Route path="/admin/login" component={AdminLogin} />
      <Route path="/admin">
        {() => <ProtectedAdminRoute component={AdminDashboard} />}
      </Route>
      <Route path="/admin/products">
        {() => <ProtectedAdminRoute component={AdminProducts} />}
      </Route>
      <Route path="/admin/orders">
        {() => <ProtectedAdminRoute component={AdminOrders} />}
      </Route>
      <Route path="/admin/settings">
        {() => <ProtectedAdminRoute component={AdminSettings} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AdminAuthProvider>
          <CartProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
              <Router />
            </WouterRouter>
          </CartProvider>
        </AdminAuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
