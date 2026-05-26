import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAdminAuth } from "@/hooks/use-admin-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Hexagon, Lock } from "lucide-react";

export function AdminLogin() {
  const { login, isAuthenticated } = useAdminAuth();
  const [, navigate] = useLocation();
  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated === true) {
      navigate("/admin");
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username, password);
    setLoading(false);
    if (ok) {
      navigate("/admin");
    } else {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="min-h-[100dvh] flex items-center justify-center bg-background dark">
      <div className="w-full max-w-sm px-6">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Hexagon className="h-8 w-8 text-primary" />
          <span className="font-bold text-2xl uppercase tracking-tighter">
            Omi<span className="text-primary">Command</span>
          </span>
        </div>

        <div className="border border-border rounded-lg bg-card p-6">
          <h1 className="text-xl font-bold uppercase tracking-tighter mb-1">Admin Login</h1>
          <p className="text-muted-foreground font-mono text-xs mb-6">
            Restricted access. Authorized personnel only.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Username</Label>
              <Input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                placeholder="admin"
                className="bg-background border-border"
                autoComplete="username"
              />
            </div>
            <div>
              <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="bg-background border-border"
                autoComplete="current-password"
              />
            </div>
            {error && (
              <p className="text-destructive text-sm font-mono">{error}</p>
            )}
            <Button
              type="submit"
              className="w-full uppercase tracking-wider"
              disabled={loading}
            >
              <Lock className="h-4 w-4 mr-2" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-muted-foreground font-mono mt-4">
          Default credentials: admin / admin
        </p>
      </div>
    </div>
  );
}
