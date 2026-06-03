import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { Sparkles, Brain, Loader2, ArrowRight, CheckCircle2, Wand2 } from "lucide-react";
import { matchMentors, type Match, type MenteeProfile } from "@/lib/mentors";
import { RoleOnly } from "@/components/RoleOnly";

export const Route = createFileRoute("/app/match")({
  head: () => ({ meta: [{ title: "Find a Mentor — MentorMatch.AI" }] }),
  component: () => (
    <RoleOnly allow="mentee">
      <MatchPage />
    </RoleOnly>
  ),
});

const INITIAL: MenteeProfile = {
  name: "",
  goals: "",
  skills: "",
  interests: "",
  aspiredRole: "",
  learningStyle: "",
};

function MatchPage() {
  const [profile, setProfile] = useState<MenteeProfile>(INITIAL);
  const [status, setStatus] = useState<"idle" | "embedding" | "searching" | "ranking" | "done">("idle");
  const [results, setResults] = useState<Match[]>([]);

  const update = (k: keyof MenteeProfile) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setProfile((p) => ({ ...p, [k]: e.target.value }));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResults([]);
    setStatus("embedding");
    await wait(700);
    setStatus("searching");
    await wait(600);
    setStatus("ranking");
    await wait(700);
    setResults(matchMentors(profile).slice(0, 4));
    setStatus("done");
  }

  function fillExample() {
    setProfile({
      name: "Meghana P",
      goals: "Publish at an ML conference and explore retrieval-augmented generation for academic search.",
      skills: "Python, PyTorch, basic Postgres, some React",
      interests: "NLP, semantic search, vector databases, transformers",
      aspiredRole: "Applied ML Researcher",
      learningStyle: "hands-on, iterative, weekly project reviews",
    });
  }

  return (
    <div className="p-6 md:p-10 max-w-6xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">AI Matching</div>
        <h1 className="text-3xl md:text-4xl font-bold">Describe yourself. We'll find the mentor.</h1>
        <p className="text-muted-foreground mt-2 max-w-2xl">
          Your text is embedded into a 1536-dim vector, searched against the faculty corpus with pgvector,
          and re-ranked by Claude with a human-readable explanation.
        </p>
      </div>

      <div className="grid lg:grid-cols-5 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-2 glass-card rounded-2xl p-6 space-y-4 self-start sticky top-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold">Your profile</h2>
            <button
              type="button"
              onClick={fillExample}
              className="text-xs inline-flex items-center gap-1 text-primary hover:underline"
            >
              <Wand2 className="size-3" /> Use example
            </button>
          </div>

          <Field label="Name">
            <input className="ipt" value={profile.name} onChange={update("name")} placeholder="e.g. Meghana P" />
          </Field>
          <Field label="Goals">
            <textarea className="ipt min-h-20" value={profile.goals} onChange={update("goals")} placeholder="What do you want to achieve?" />
          </Field>
          <Field label="Current skills">
            <input className="ipt" value={profile.skills} onChange={update("skills")} placeholder="Python, PyTorch, SQL..." />
          </Field>
          <Field label="Interests">
            <input className="ipt" value={profile.interests} onChange={update("interests")} placeholder="NLP, vector search, HCI..." />
          </Field>
          <Field label="Aspired role">
            <input className="ipt" value={profile.aspiredRole} onChange={update("aspiredRole")} placeholder="Applied ML Researcher" />
          </Field>
          <Field label="Preferred learning style">
            <input className="ipt" value={profile.learningStyle} onChange={update("learningStyle")} placeholder="hands-on, project-led..." />
          </Field>

          <button
            type="submit"
            disabled={status !== "idle" && status !== "done"}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow disabled:opacity-50"
          >
            {status === "idle" || status === "done" ? (
              <>
                <Sparkles className="size-4" /> Find my mentor
              </>
            ) : (
              <>
                <Loader2 className="size-4 animate-spin" /> Matching...
              </>
            )}
          </button>
        </form>

        {/* Results */}
        <div className="lg:col-span-3">
          {status === "idle" && results.length === 0 && (
            <div className="glass-card rounded-2xl p-10 text-center">
              <div className="size-14 rounded-2xl bg-primary/10 text-primary grid place-items-center mx-auto mb-4">
                <Brain className="size-7" />
              </div>
              <h3 className="font-display text-xl font-bold mb-2">Ready when you are.</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                Fill out the form on the left — even rough text works. The matcher rewards specificity.
              </p>
            </div>
          )}

          {status !== "idle" && status !== "done" && <PipelineStatus status={status} />}

          {status === "done" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-xl font-bold">Top matches</h2>
                <span className="text-xs text-muted-foreground font-mono">
                  4 of {results.length > 0 ? "6" : "0"} surfaced · ranked by Claude
                </span>
              </div>
              {results.map((m, i) => (
                <MatchCard key={m.mentor.id} match={m} rank={i + 1} />
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .ipt {
          width: 100%;
          background: var(--color-muted);
          border: 1px solid var(--color-border);
          color: var(--color-foreground);
          border-radius: 0.5rem;
          padding: 0.625rem 0.75rem;
          font-size: 0.875rem;
          outline: none;
          transition: border-color 0.15s, box-shadow 0.15s;
        }
        .ipt:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 3px oklch(0.72 0.18 155 / 0.15);
        }
      `}</style>
    </div>
  );
}

function wait(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
    </label>
  );
}

function PipelineStatus({ status }: { status: "embedding" | "searching" | "ranking" }) {
  const steps = [
    { key: "embedding", label: "Generating embeddings", sub: "OpenAI text-embedding-3-small · 1536 dims" },
    { key: "searching", label: "Vector similarity search", sub: "pgvector cosine · top-K candidates" },
    { key: "ranking", label: "Claude re-ranking", sub: "Contextual reasoning + explanation" },
  ] as const;
  const order: Record<typeof status, number> = { embedding: 0, searching: 1, ranking: 2 };
  return (
    <div className="glass-card rounded-2xl p-6">
      <div className="text-xs font-mono uppercase tracking-widest text-primary mb-4">Matching pipeline</div>
      <div className="space-y-3">
        {steps.map((s, i) => {
          const cur = order[status];
          const done = i < cur;
          const active = i === cur;
          return (
            <div key={s.key} className="flex items-center gap-3">
              <div
                className={`size-8 rounded-lg grid place-items-center ${
                  done ? "bg-primary text-primary-foreground" : active ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {done ? <CheckCircle2 className="size-4" /> : active ? <Loader2 className="size-4 animate-spin" /> : <span className="text-xs">{i + 1}</span>}
              </div>
              <div className="flex-1">
                <div className={`text-sm font-medium ${active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                  {s.label}
                </div>
                <div className="text-xs text-muted-foreground/70 font-mono">{s.sub}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MatchCard({ match, rank }: { match: Match; rank: number }) {
  const pct = Math.round(match.score * 100);
  return (
    <div className="glass-card rounded-2xl p-6 hover:border-primary/30 transition">
      <div className="flex items-start gap-4">
        <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground shrink-0">
          {match.mentor.avatar}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline justify-between gap-3 flex-wrap">
            <div>
              <h3 className="font-semibold text-lg">{match.mentor.name}</h3>
              <div className="text-xs text-muted-foreground">
                {match.mentor.title} · {match.mentor.department}
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-display font-bold text-gradient">{pct}%</div>
              <div className="text-xs text-muted-foreground font-mono">rank #{rank}</div>
            </div>
          </div>

          <div className="mt-4 rounded-xl border border-accent/20 bg-accent/5 p-4">
            <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-accent mb-2">
              <Sparkles className="size-3" /> Why this match
            </div>
            <p className="text-sm leading-relaxed">{match.summary}</p>
            <ul className="mt-3 space-y-1.5">
              {match.reasons.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-muted-foreground">
                  <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" /> {r}
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            {match.mentor.domains.map((d) => (
              <span key={d} className="text-xs px-2.5 py-1 rounded-full bg-muted border border-border">{d}</span>
            ))}
          </div>

          <div className="mt-4 flex items-center justify-between">
            <div className="text-xs text-muted-foreground">
              <span className={`inline-block size-2 rounded-full mr-1.5 ${match.mentor.availability === "High" ? "bg-success" : match.mentor.availability === "Medium" ? "bg-warning" : "bg-danger"}`} />
              {match.mentor.availability} availability
            </div>
            <Link
              to="/app/mentors/$id"
              params={{ id: match.mentor.id }}
              className="inline-flex items-center gap-1 text-sm text-primary font-medium hover:underline"
            >
              View profile <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
