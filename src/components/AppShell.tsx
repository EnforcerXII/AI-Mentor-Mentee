import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Brain, Compass, LayoutDashboard, Users, UserCircle2, Sparkles, Calendar, Inbox, LogOut,
} from "lucide-react";
import type { ReactNode } from "react";
import { useRole, type Role } from "@/lib/useRole";

type NavItem = { to: string; label: string; icon: typeof LayoutDashboard; exact?: boolean };

const MENTEE_NAV: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/match", label: "Find a Mentor", icon: Sparkles },
  { to: "/app/mentors", label: "Browse Mentors", icon: Compass },
  { to: "/app/sessions", label: "Sessions", icon: Calendar },
  { to: "/app/profile", label: "Profile", icon: UserCircle2 },
];

const MENTOR_NAV: NavItem[] = [
  { to: "/app", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/app/requests", label: "Mentee Requests", icon: Inbox },
  { to: "/app/mentees", label: "My Mentees", icon: Users },
  { to: "/app/sessions", label: "Sessions", icon: Calendar },
  { to: "/app/profile", label: "Profile", icon: UserCircle2 },
];

export function AppShell({ role, children }: { role: Role; children: ReactNode }) {
  const path = useRouterState({ select: (s) => s.location.pathname });
  const { setRole } = useRole();
  const navigate = useNavigate();
  const items = role === "mentor" ? MENTOR_NAV : MENTEE_NAV;

  const handleSignOut = () => {
    setRole(null);
    navigate({ to: "/login" });
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="md:w-64 md:fixed md:inset-y-0 md:left-0 border-b md:border-b-0 md:border-r border-border bg-card/40 backdrop-blur-xl z-40">
        <div className="p-5 flex md:block items-center justify-between">
          <Link to="/" className="flex items-center gap-2 font-display font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow">
              <Brain className="size-4 text-primary-foreground" />
            </div>
            MentorMatch<span className="text-primary">.AI</span>
          </Link>
          <nav className="md:hidden flex gap-1">
            {items.map((n) => {
              const active = n.exact ? path === n.to : path.startsWith(n.to);
              return (
                <Link
                  key={n.to}
                  to={n.to}
                  className={`size-9 grid place-items-center rounded-lg ${
                    active ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-card"
                  }`}
                >
                  <n.icon className="size-4" />
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:flex items-center gap-2 px-3 mb-2">
          <span className={`text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 rounded-md border ${
            role === "mentor"
              ? "text-accent border-accent/30 bg-accent/10"
              : "text-primary border-primary/30 bg-primary/10"
          }`}>
            {role} mode
          </span>
        </div>

        <nav className="hidden md:flex flex-col gap-1 px-3">
          {items.map((n) => {
            const active = n.exact ? path === n.to : path.startsWith(n.to);
            return (
              <Link
                key={n.to}
                to={n.to}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition ${
                  active
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-muted-foreground hover:bg-card hover:text-foreground"
                }`}
              >
                <n.icon className="size-4" />
                {n.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden md:block absolute bottom-5 left-3 right-3">
          <div className="glass-card rounded-xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="size-9 rounded-full bg-gradient-to-br from-accent to-primary grid place-items-center text-sm font-semibold text-primary-foreground">
                {role === "mentor" ? "PR" : "AK"}
              </div>
              <div className="text-sm min-w-0">
                <div className="font-medium truncate">
                  {role === "mentor" ? "Dr. Priya Raman" : "Atul K."}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {role === "mentor" ? "Assoc. Prof · CSE" : "B.Tech · CSE"}
                </div>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-1.5 rounded-lg border border-border text-xs text-muted-foreground hover:text-foreground hover:bg-card transition"
            >
              <LogOut className="size-3" /> Sign out
            </button>
          </div>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 min-w-0">{children}</main>
    </div>
  );
}
