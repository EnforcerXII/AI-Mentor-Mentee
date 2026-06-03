import { createFileRoute } from "@tanstack/react-router";
import { Calendar, Clock, MessageSquare, Star, Video } from "lucide-react";

export const Route = createFileRoute("/app/sessions")({
  head: () => ({ meta: [{ title: "Sessions — MentorMatch.AI" }] }),
  component: Sessions,
});

const UPCOMING = [
  { id: 1, mentor: "Dr. Priya Raman", topic: "Embedding architectures review", when: "Tomorrow · 4:30 PM", duration: "45 min" },
  { id: 2, mentor: "Prof. Animesh Giri", topic: "Systems design critique", when: "Thu · 11:00 AM", duration: "60 min" },
  { id: 3, mentor: "Dr. Priya Raman", topic: "RAG evaluation sync", when: "Fri · 5:00 PM", duration: "30 min" },
];

const PAST = [
  { id: 4, mentor: "Dr. Priya Raman", topic: "Project kickoff", when: "May 22", rating: 5, notes: "Discussed pgvector indexing strategy and evaluation harness." },
  { id: 5, mentor: "Prof. Animesh Giri", topic: "Initial intro", when: "May 18", rating: 5, notes: "Aligned on systems-side scope; reading list shared." },
  { id: 6, mentor: "Dr. Priya Raman", topic: "Literature review", when: "May 12", rating: 4, notes: "Reviewed 4 papers on dense retrieval; picked baseline." },
];

function Sessions() {
  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Sessions</div>
        <h1 className="text-3xl md:text-4xl font-bold">Your mentorship sessions</h1>
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Upcoming</h2>
      <div className="space-y-3 mb-10">
        {UPCOMING.map((s) => (
          <div key={s.id} className="glass-card rounded-2xl p-5 flex flex-wrap items-center gap-4">
            <div className="size-12 rounded-xl bg-primary/10 text-primary grid place-items-center">
              <Calendar className="size-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold">{s.topic}</div>
              <div className="text-xs text-muted-foreground">with {s.mentor}</div>
            </div>
            <div className="text-sm text-right">
              <div className="font-mono">{s.when}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1 justify-end mt-0.5">
                <Clock className="size-3" /> {s.duration}
              </div>
            </div>
            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition">
              <Video className="size-4" /> Join
            </button>
          </div>
        ))}
      </div>

      <h2 className="font-display text-xl font-bold mb-4">Past sessions</h2>
      <div className="space-y-3">
        {PAST.map((s) => (
          <div key={s.id} className="glass-card rounded-2xl p-5">
            <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
              <div>
                <div className="font-semibold">{s.topic}</div>
                <div className="text-xs text-muted-foreground">with {s.mentor} · {s.when}</div>
              </div>
              <div className="flex items-center gap-1 text-warning text-sm">
                {Array.from({ length: s.rating }).map((_, i) => <Star key={i} className="size-3.5 fill-current" />)}
              </div>
            </div>
            <p className="text-sm text-muted-foreground">{s.notes}</p>
            <div className="mt-3 flex gap-2">
              <button className="text-xs inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-border hover:bg-card transition">
                <MessageSquare className="size-3" /> Follow up
              </button>
              <button className="text-xs px-3 py-1.5 rounded-md border border-border hover:bg-card transition">View notes</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
