import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { MENTORS } from "@/lib/mentors";
import { RoleOnly } from "@/components/RoleOnly";

export const Route = createFileRoute("/app/mentors")({
  head: () => ({ meta: [{ title: "Browse Mentors — MentorMatch.AI" }] }),
  component: () => (
    <RoleOnly allow="mentee">
      <Browse />
    </RoleOnly>
  ),
});

function Browse() {
  const [q, setQ] = useState("");
  const [dept, setDept] = useState<string>("All");

  const depts = useMemo(() => ["All", ...Array.from(new Set(MENTORS.map((m) => m.department)))], []);

  const filtered = MENTORS.filter((m) => {
    if (dept !== "All" && m.department !== dept) return false;
    if (!q) return true;
    const hay = [m.name, m.bio, m.domains.join(" "), m.skills.join(" ")].join(" ").toLowerCase();
    return hay.includes(q.toLowerCase());
  });

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Faculty Directory</div>
        <h1 className="text-3xl md:text-4xl font-bold">Browse mentors</h1>
        <p className="text-muted-foreground mt-2">Explore all faculty, or use AI matching for personalized results.</p>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-64">
          <Search className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, domain, skill..."
            className="w-full bg-muted border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none transition"
          />
        </div>
        <div className="flex gap-1 p-1 rounded-lg border border-border bg-muted/50">
          {depts.map((d) => (
            <button
              key={d}
              onClick={() => setDept(d)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                dept === d ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {filtered.map((m) => (
          <Link
            key={m.id}
            to="/app/mentors/$id"
            params={{ id: m.id }}
            className="glass-card rounded-2xl p-5 hover:border-primary/40 transition group"
          >
            <div className="flex items-start gap-4">
              <div className="size-14 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground shrink-0">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2">
                  <h3 className="font-semibold truncate group-hover:text-primary transition">{m.name}</h3>
                  <div className="flex items-center gap-1 text-xs text-warning shrink-0">
                    <Star className="size-3 fill-current" /> {m.rating}
                  </div>
                </div>
                <div className="text-xs text-muted-foreground mb-2">{m.title} · {m.department}</div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{m.bio}</p>
                <div className="flex flex-wrap gap-1.5">
                  {m.domains.slice(0, 3).map((d) => (
                    <span key={d} className="text-xs px-2 py-0.5 rounded-full bg-muted border border-border">{d}</span>
                  ))}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="glass-card rounded-2xl p-10 text-center text-muted-foreground">No mentors match those filters.</div>
      )}
    </div>
  );
}
