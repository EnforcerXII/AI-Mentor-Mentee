import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { AppShell } from "@/components/AppShell";
import { useRole } from "@/lib/useRole";

export const Route = createFileRoute("/app")({
  component: AppLayout,
});

function AppLayout() {
  const { role, ready } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (ready && !role) navigate({ to: "/login" });
  }, [ready, role, navigate]);

  if (!ready) {
    return <div className="min-h-screen grid place-items-center text-muted-foreground text-sm">Loading…</div>;
  }
  if (!role) return null;

  return (
    <AppShell role={role}>
      <Outlet />
    </AppShell>
  );
}
