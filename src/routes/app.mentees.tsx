import { createFileRoute } from "@tanstack/react-router";
import { MessageSquare, Calendar } from "lucide-react";
import { RoleOnly } from "@/components/RoleOnly";

export const Route = createFileRoute("/app/mentees")({
  head: () => ({ meta: [{ title: "My Mentees — MentorMatch.AI" }] }),
  component: () => (
    <RoleOnly allow="mentor">
      <Mentees />
    </RoleOnly>
  ),
});

const MENTEES = [
  { id: "u1", name: "Atul Kandiyil", program: "B.Tech CSE · 3rd yr", avatar: "AK", focus: "RAG eval", next: "Tomorrow · 4:30 PM", sessions: 8 },
  { id: "u2", name: "Sneha Verma", program: "M.Tech CSE · 1st yr", avatar: "SV", focus: "Multilingual retrieval", next: "Fri · 11:00 AM", sessions: 3 },
];

function Mentees() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Active</div>
        <h1 className="text-3xl md:text-4xl font-bold">My mentees</h1>
        <p className="text-muted-foreground mt-2">Ongoing mentorships, organized by focus area.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {MENTEES.map((m) => (
          <div key={m.id} className="glass-card rounded-2xl p-5">
            <div className="flex items-start gap-4 mb-4">
              <div className="size-12 rounded-full bg-gradient-to-br from-primary to-accent grid place-items-center text-sm font-semibold text-primary-foreground">
                {m.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold truncate">{m.name}</div>
                <div className="text-xs text-muted-foreground">{m.program}</div>
                <div className="text-xs text-primary mt-1">Focus: {m.focus}</div>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground mb-4">
              <span className="inline-flex items-center gap-1.5"><Calendar className="size-3" /> Next: {m.next}</span>
              <span>{m.sessions} sessions</span>
            </div>
            <div className="flex gap-2">
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
                <MessageSquare className="size-4" /> Message
              </button>
              <button className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm hover:bg-card transition">
                <Calendar className="size-4" /> Schedule
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
