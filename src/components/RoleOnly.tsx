import { useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useRole, type Role } from "@/lib/useRole";

export function RoleOnly({ allow, children }: { allow: Role; children: React.ReactNode }) {
  const { role, ready } = useRole();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) return;
    if (!role) navigate({ to: "/login" });
    else if (role !== allow) navigate({ to: "/app" });
  }, [ready, role, allow, navigate]);

  if (!ready || role !== allow) {
    return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  }
  return <>{children}</>;
}
