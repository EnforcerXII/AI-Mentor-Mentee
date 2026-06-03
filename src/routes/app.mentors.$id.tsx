import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, Calendar, MessageSquare, Star } from "lucide-react";
import { getMentor } from "@/lib/mentors";
import { RoleOnly } from "@/components/RoleOnly";

export const Route = createFileRoute("/app/mentors/$id")({
  head: () => ({ meta: [{ title: "Mentor Profile — MentorMatch.AI" }] }),
  component: () => (
    <RoleOnly allow="mentee">
      <MentorProfile />
    </RoleOnly>
  ),
});

function MentorProfile() {
  const { id } = useParams({ from: "/app/mentors/$id" });
  const mentor = getMentor(id);

  if (!mentor) {
    return (
      <div className="p-10 text-center">
        <p className="text-muted-foreground">Mentor not found.</p>
        <Link to="/app/mentors" className="text-primary hover:underline mt-3 inline-block">Back to directory</Link>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-10 max-w-5xl mx-auto">
      <Link to="/app/mentors" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="size-4" /> Back to directory
      </Link>

      <div className="glass-card rounded-3xl p-8 mb-6">
        <div className="flex flex-wrap items-start gap-6">
          <div className="size-24 rounded-2xl bg-gradient-to-br from-primary to-accent grid place-items-center text-2xl font-display font-bold text-primary-foreground glow">
            {mentor.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold">{mentor.name}</h1>
            <div className="text-muted-foreground mt-1">{mentor.title} · {mentor.department}</div>
            <div className="flex flex-wrap items-center gap-4 mt-3 text-sm">
              <div className="flex items-center gap-1 text-warning"><Star className="size-4 fill-current" /> {mentor.rating}</div>
              <div className="text-muted-foreground">{mentor.sessions} sessions</div>
              <div className="text-muted-foreground">{mentor.publications} publications</div>
              <div className="text-muted-foreground">{mentor.experienceYears} yrs experience</div>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
              <Calendar className="size-4" /> Request mentorship
            </button>
            <button className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-border bg-card/50 font-medium hover:bg-card transition">
              <MessageSquare className="size-4" /> Send message
            </button>
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold mb-3 flex items-center gap-2"><BookOpen className="size-4 text-primary" /> About</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">{mentor.bio}</p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold mb-4">Research domains</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.domains.map((d) => (
                <span key={d} className="px-3 py-1.5 rounded-lg bg-primary/10 text-primary text-sm border border-primary/20">{d}</span>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-lg font-bold mb-4">Technical skills</h2>
            <div className="flex flex-wrap gap-2">
              {mentor.skills.map((s) => (
                <span key={s} className="px-3 py-1.5 rounded-lg bg-muted text-sm border border-border font-mono">{s}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Availability</h2>
            <div className="flex items-center gap-2 mb-2">
              <div className={`size-2.5 rounded-full ${mentor.availability === "High" ? "bg-success" : mentor.availability === "Medium" ? "bg-warning" : "bg-danger"}`} />
              <span className="font-semibold">{mentor.availability}</span>
            </div>
            <p className="text-xs text-muted-foreground">
              Currently accepting new mentees this semester.
            </p>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Mentoring style</h2>
            <ul className="space-y-1.5 text-sm">
              {mentor.learningStyle.map((s) => (
                <li key={s} className="text-muted-foreground">— {s}</li>
              ))}
            </ul>
          </div>

          <div className="glass-card rounded-2xl p-6">
            <h2 className="font-display text-sm font-bold uppercase tracking-wider text-muted-foreground mb-3">Stats</h2>
            <div className="space-y-3">
              {[
                ["Publications", mentor.publications],
                ["Mentored sessions", mentor.sessions],
                ["Years experience", mentor.experienceYears],
                ["Avg rating", mentor.rating],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="font-mono font-semibold">{v}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
