import { useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, KeyRound } from "lucide-react";

export function AdminSettings() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    if (newPassword.length < 1) {
      setError("New password cannot be empty");
      return;
    }

    setLoading(true);
    const r = await fetch("/api/admin/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "same-origin",
      body: JSON.stringify({ currentPassword, newPassword }),
    });
    setLoading(false);

    if (r.ok) {
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      const data = await r.json().catch(() => ({}));
      setError((data as { error?: string }).error ?? "Failed to change password");
    }
  };

  return (
    <AdminLayout>
      <div>
        <h1 className="text-3xl font-bold uppercase tracking-tighter mb-2">Settings</h1>
        <p className="text-muted-foreground font-mono text-sm mb-8">
          Manage admin credentials and configuration.
        </p>

        <div className="max-w-md">
          <div className="border border-border rounded-lg bg-card p-6">
            <div className="flex items-center gap-2 mb-6">
              <KeyRound className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-bold uppercase tracking-tighter">Change Password</h2>
            </div>

            {success && (
              <div className="flex items-center gap-2 text-green-400 font-mono text-sm mb-4 p-3 bg-green-400/10 border border-green-500/30 rounded-md">
                <CheckCircle className="h-4 w-4 flex-shrink-0" />
                Password changed successfully.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">
                  Current Password
                </Label>
                <Input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-background border-border"
                  autoComplete="current-password"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">
                  New Password
                </Label>
                <Input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-background border-border"
                  autoComplete="new-password"
                />
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider font-mono mb-1 block">
                  Confirm New Password
                </Label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="bg-background border-border"
                  autoComplete="new-password"
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
                {loading ? "Updating..." : "Update Password"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
