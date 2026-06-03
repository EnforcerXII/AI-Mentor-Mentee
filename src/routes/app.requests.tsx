import { createFileRoute } from "@tanstack/react-router";
import { Inbox, Check, X, Sparkles } from "lucide-react";
import { RoleOnly } from "@/components/RoleOnly";

export const Route = createFileRoute("/app/requests")({
  head: () => ({ meta: [{ title: "Mentee Requests — MentorMatch.AI" }] }),
  component: () => (
    <RoleOnly allow="mentor">
      <Requests />
    </RoleOnly>
  ),
});

const REQUESTS = [
  {
    id: "r1", name: "Atul Kandiyil", program: "B.Tech CSE · 3rd yr", avatar: "AK", score: 94,
    goal: "Pursue MS in ML with focus on retrieval systems.",
    why: "Strong overlap on NLP, vector search; hands-on learning style match.",
  },
  {
    id: "r2", name: "Sneha Verma", program: "M.Tech CSE · 1st yr", avatar: "SV", score: 88,
    goal: "RAG evaluation benchmarks for low-resource languages.",
    why: "Shared interest in retrieval-augmented generation; project-led style.",
  },
  {
    id: "r3", name: "Rohit Banerjee", program: "B.Tech ISE · 4th yr", avatar: "RB", score: 81,
    goal: "Industry-grade ML systems — looking to ship products.",
    why: "Broad ML interest; could benefit from your applied research lens.",
  },
];

function Requests() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2 inline-flex items-center gap-2">
          <Inbox className="size-3" /> Inbox
        </div>
        <h1 className="text-3xl md:text-4xl font-bold">Mentee requests</h1>
        <p className="text-muted-foreground mt-2">
          Students matched to you by the engine. Accept to start a mentorship.
        </p>
      </div>

      <div className="space-y-4">
        {REQUESTS.map((r) => (
          <div key={r.id} className="glass-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start gap-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground shrink-0">
                {r.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1">
                  <div>
                    <span className="font-semibold">{r.name}</span>
                    <span className="text-xs text-muted-foreground ml-2">{r.program}</span>
                  </div>
                  <div className="inline-flex items-center gap-1 text-xs text-primary font-mono">
                    <Sparkles className="size-3" /> {r.score}% match
                  </div>
                </div>
                <p className="text-sm mb-2">{r.goal}</p>
                <p className="text-xs text-muted-foreground italic">Why: {r.why}</p>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition glow">
                  <Check className="size-4" /> Accept
                </button>
                <button className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg border border-border text-sm hover:bg-card transition">
                  <X className="size-4" /> Decline
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
