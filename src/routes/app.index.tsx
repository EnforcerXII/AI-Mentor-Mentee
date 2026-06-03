import { createFileRoute, Link } from "@tanstack/react-router";
import { Sparkles, MessageSquare, TrendingUp, Calendar, ArrowRight, Brain, Inbox, Users, GraduationCap } from "lucide-react";
import { MENTORS } from "@/lib/mentors";
import { useRole } from "@/lib/useRole";

export const Route = createFileRoute("/app/")({
  head: () => ({ meta: [{ title: "Dashboard — MentorMatch.AI" }] }),
  component: Dashboard,
});

function Dashboard() {
  const { role, ready } = useRole();
  if (!ready) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  return role === "mentor" ? <MentorDashboard /> : <MenteeDashboard />;
}

function MenteeDashboard() {
  const featured = MENTORS.slice(0, 3);
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Mentee Dashboard</div>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, Atul.</h1>
          <p className="text-muted-foreground mt-2">Here's what's happening with your mentorships.</p>
        </div>
        <Link to="/app/match" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
          <Sparkles className="size-4" /> Find a mentor
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Active mentorships", value: "2", icon: Brain, delta: "+1 this month" },
          { label: "Sessions completed", value: "14", icon: Calendar, delta: "3 upcoming" },
          { label: "Match score avg", value: "92%", icon: TrendingUp, delta: "+4% vs Q1" },
          { label: "Unread messages", value: "5", icon: MessageSquare, delta: "2 from Dr. Raman" },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Recommended for you</h2>
            <Link to="/app/mentors" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
              See all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {featured.map((m) => (
              <Link key={m.id} to="/app/mentors/$id" params={{ id: m.id }} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-card/60 transition">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground">{m.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold truncate">{m.name}</span>
                    <span className="text-xs text-muted-foreground hidden sm:inline">· {m.department}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate mt-0.5">{m.domains.join(" · ")}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-primary">94%</div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Upcoming session</h2>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
            <div className="text-xs font-mono text-primary mb-1">TOMORROW · 4:30 PM</div>
            <div className="font-semibold">Embedding architectures review</div>
            <div className="text-xs text-muted-foreground mt-1">with Dr. Priya Raman</div>
          </div>
          <div className="text-sm font-medium mb-2">This week</div>
          <ul className="space-y-2 text-sm">
            {[["Thu", "Paper reading group"], ["Fri", "Project sync — RAG eval"]].map(([d, t]) => (
              <li key={t} className="flex items-center gap-3 text-muted-foreground">
                <span className="font-mono text-xs text-primary w-8">{d}</span> {t}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MentorDashboard() {
  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-8">
        <div>
          <div className="text-xs font-mono uppercase tracking-widest text-accent mb-2">Mentor Dashboard</div>
          <h1 className="text-3xl md:text-4xl font-bold">Welcome back, Dr. Raman.</h1>
          <p className="text-muted-foreground mt-2">Pending requests and active mentees, at a glance.</p>
        </div>
        <Link to="/app/requests" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
          <Inbox className="size-4" /> Review requests
        </Link>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Pending requests", value: "3", icon: Inbox, delta: "2 new today" },
          { label: "Active mentees", value: "5", icon: Users, delta: "of 5 max" },
          { label: "Sessions this week", value: "7", icon: Calendar, delta: "2 today" },
          { label: "Avg match score", value: "88%", icon: TrendingUp, delta: "+3% vs last term" },
        ].map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-display text-xl font-bold">Recent requests</h2>
            <Link to="/app/requests" className="text-xs text-primary inline-flex items-center gap-1 hover:underline">
              See all <ArrowRight className="size-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Atul Kandiyil", program: "B.Tech CSE · 3rd yr", avatar: "AK", score: 94, goal: "MS in ML — retrieval systems" },
              { name: "Sneha Verma", program: "M.Tech CSE · 1st yr", avatar: "SV", score: 88, goal: "RAG eval for low-resource languages" },
              { name: "Rohit Banerjee", program: "B.Tech ISE · 4th yr", avatar: "RB", score: 81, goal: "Applied ML in industry" },
            ].map((r) => (
              <div key={r.name} className="flex items-center gap-4 p-4 rounded-xl border border-border hover:border-primary/40 hover:bg-card/60 transition">
                <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground">{r.avatar}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.program} · {r.goal}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-mono text-primary">{r.score}%</div>
                  <div className="text-xs text-muted-foreground">match</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <h2 className="font-display text-xl font-bold mb-4">Next session</h2>
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 mb-4">
            <div className="text-xs font-mono text-primary mb-1">TOMORROW · 4:30 PM</div>
            <div className="font-semibold">Embedding architectures review</div>
            <div className="text-xs text-muted-foreground mt-1">with Atul Kandiyil</div>
          </div>
          <div className="text-sm font-medium mb-2 inline-flex items-center gap-2">
            <GraduationCap className="size-4 text-primary" /> Mentees this term
          </div>
          <ul className="space-y-2 text-sm">
            {[["AK", "Atul K."], ["SV", "Sneha V."]].map(([a, n]) => (
              <li key={n} className="flex items-center gap-3 text-muted-foreground">
                <span className="size-6 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-[10px] font-semibold text-primary-foreground">{a}</span>
                {n}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, delta }: { label: string; value: string; icon: typeof Brain; delta: string }) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <Icon className="size-5 text-primary" />
        <span className="text-xs text-muted-foreground">{delta}</span>
      </div>
      <div className="text-3xl font-display font-bold">{value}</div>
      <div className="text-sm text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
