import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Brain, Sparkles, Target, Cog, Package, Users, GraduationCap, Cpu, MessageSquare,
  RefreshCw, LayoutDashboard, CheckCircle2, XCircle, AlertTriangle, Database, Lock,
  Layers, Server, Cloud, ArrowRight, FileText, Calendar, BarChart3, BookOpen,
  MessageCircle, Briefcase, TrendingUp
} from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Mentor Mentee Platform — Semantic Student-Faculty Matching" },
      { name: "description", content: "AI-powered student-faculty matching using semantic embeddings and Claude AI reasoning. Explainable mentor pairings for academia." },
      { property: "og:title", content: "AI Mentor Mentee Platform" },
      { property: "og:description", content: "Semantic embeddings + Claude AI for explainable mentor matching." },
    ],
  }),
  component: Index,
});

function Section({ id, eyebrow, title, children, className = "" }: { id?: string; eyebrow?: string; title: string; children: React.ReactNode; className?: string }) {
  return (
    <section id={id} className={`relative py-24 px-6 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="mb-14">
          {eyebrow && (
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-4">
              <span className="h-px w-8 bg-primary" /> {eyebrow}
            </div>
          )}
          <h2 className="text-4xl md:text-5xl font-bold max-w-3xl">{title}</h2>
        </div>
        {children}
      </div>
    </section>
  );
}

function Index() {
  const problems = [
    { icon: XCircle, title: "Manual & Inefficient Matching", desc: "Students and professors are matched through emails and word-of-mouth, leading to poor compatibility and wasted time." },
    { icon: AlertTriangle, title: "Keyword-Based Filters Only", desc: "Existing platforms rely on self-selected tags — missing semantic meaning, learning style, and academic nuance." },
    { icon: MessageSquare, title: "No Explainability", desc: "Matching systems return a score but never explain why — students and mentors can't validate the recommendation." },
    { icon: Briefcase, title: "Enterprise Tools, Not Academic", desc: "Chronus and Qooper are built for corporate HR — they don't understand research domains or academic mentorship." },
  ];

  const scope = [
    { n: "01", icon: Users, title: "User Management", desc: "Registration, secure login, profile creation & editing for mentors and mentees." },
    { n: "02", icon: GraduationCap, title: "Mentor Profile System", desc: "Industry, skills, experience, mentoring domains and availability captured & embedded." },
    { n: "03", icon: BookOpen, title: "Mentee Profile System", desc: "Career goals, current skills, interests, aspired roles, and problems to solve." },
    { n: "04", icon: Cpu, title: "AI Matching Engine", desc: "Analyze profiles, recommend top mentors, rank by compatibility using embeddings." },
    { n: "05", icon: Sparkles, title: "Explainable Matches", desc: "Claude API generates human-readable explanations for every pairing decision." },
    { n: "06", icon: RefreshCw, title: "Feedback Loop", desc: "Session tracking and match quality improvement over time via collected feedback." },
    { n: "07", icon: LayoutDashboard, title: "Dashboard & Tracking", desc: "Match status, session history, and ongoing mentorship management interface." },
  ];

  const challenges = [
    { n: 1, title: "Cold Start Problem", desc: "New mentors with no history have no embeddings or feedback signals — pure semantic search may miss them." },
    { n: 2, title: "Static Profile Matching", desc: "Student goals evolve rapidly. Profiles embedded at registration become stale without re-embedding." },
    { n: 3, title: "Embedding Bias", desc: "text-embedding-3-small may encode biases, potentially skewing matches by writing style or demographics." },
    { n: 4, title: "LLM Hallucinations", desc: "Claude may generate plausible but incorrect explanations — quality must be validated with human loops." },
    { n: 5, title: "Scalability of Vector Search", desc: "pgvector at scale requires HNSW or IVFFlat indexing — unindexed search degrades to O(n)." },
    { n: 6, title: "Feedback Loop Quality", desc: "Match improvement relies on honest feedback. Students may not rate; mentors have less incentive." },
  ];

  const stack = [
    { icon: Layers, name: "Frontend", tech: "Next.js + Tailwind CSS", desc: "Server-side rendering and rapid responsive UI development." },
    { icon: Server, name: "Backend", tech: "Next.js API Routes", desc: "Serverless endpoints co-located with frontend." },
    { icon: Database, name: "Database", tech: "PostgreSQL + pgvector + pg_trgm", desc: "Relational + vector similarity + fuzzy text in one DB." },
    { icon: Lock, name: "Auth", tech: "Clerk / NextAuth.js", desc: "Social login, JWT sessions, role management." },
    { icon: Brain, name: "Embeddings", tech: "OpenAI text-embedding-3-small", desc: "1536-dim semantic vectors from profile text." },
    { icon: Sparkles, name: "AI Reasoning", tech: "Claude API (Anthropic)", desc: "Ranks candidates and generates explanations." },
    { icon: Cloud, name: "Hosting", tech: "Vercel + Supabase", desc: "Managed Postgres with pgvector; edge CI/CD." },
  ];

  const workflow = [
    { n: "01", title: "Student Onboarding", desc: "Mentee describes goals, learning style and domain." },
    { n: "02", title: "Vector Embedding", desc: "Profile text converted to 1536-dim OpenAI vectors." },
    { n: "03", title: "Similarity Search", desc: "pgvector cosine similarity surfaces top candidates." },
    { n: "04", title: "Claude AI Ranking", desc: "Claude re-ranks and writes human-readable rationale." },
    { n: "05", title: "Match Delivered", desc: "Top professor + explanation handed to the student." },
  ];

  const comparison = [
    { feature: "Matching Approach", them: "Keyword tags / self-selected categories", us: "Semantic embeddings (meaning-level)" },
    { feature: "Explainability", them: "Score only, no reasoning", us: "Claude generates human-readable reason" },
    { feature: "Academic Context", them: "Built for corporate HR workflows", us: "Research domains, learning style, academic goals" },
    { feature: "Infrastructure Cost", them: "Expensive enterprise licensing", us: "Open-source Postgres + pgvector" },
    { feature: "Faculty Specificity", them: "Generic mentor categories", us: "Professor-specific — student-to-faculty" },
    { feature: "Feedback Loop", them: "Basic ratings, no retraining", us: "Feedback improves match quality over time" },
  ];

  const phases = [
    { phase: "Phase 1", title: "Onboarding & Profiles", items: ["User registration & auth (Clerk)", "Mentor & mentee onboarding forms", "Profile storage in PostgreSQL", "Basic profile editing UI"] },
    { phase: "Phase 2", title: "AI Matching Engine", items: ["OpenAI embedding generation", "pgvector similarity indexing", "Claude API ranking integration", "Match result display with explanation"] },
    { phase: "Phase 3", title: "Dashboard & Tracking", items: ["Match status dashboard", "Session tracking interface", "Notification system", "Chat between paired users"] },
    { phase: "Phase 4", title: "Feedback & Enhancement", items: ["Post-session feedback collection", "Feedback-driven re-ranking", "Placement priority scoring", "Resume enhancement (JD-based)"] },
  ];

  const future = [
    { icon: FileText, title: "Resume Enhancement", desc: "AI-powered resume suggestions tailored to target roles." },
    { icon: MessageCircle, title: "Chat Feature", desc: "Real-time messaging with session scheduling integration." },
    { icon: BookOpen, title: "Project History", desc: "Log completed projects to improve future match quality." },
    { icon: TrendingUp, title: "Placement Priority", desc: "Students near placement get weighting in matching." },
    { icon: BarChart3, title: "Mentee Progress Dashboard", desc: "Mentors see skill growth, sessions, goals in real time." },
    { icon: Calendar, title: "Smart Availability", desc: "Calendar integration with optimal session suggestions." },
    { icon: RefreshCw, title: "Feedback & Rating Tools", desc: "Structured forms that feed back into the AI model." },
    { icon: Sparkles, title: "Research Signals", desc: "Open research positions surfaced to matching mentees." },
  ];

  return (
    <div className="min-h-screen text-foreground">
      {/* NAV */}
      <header className="fixed top-0 inset-x-0 z-50 border-b border-border/50 backdrop-blur-xl bg-background/60">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="#top" className="flex items-center gap-2 font-display font-bold">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow">
              <Brain className="size-4 text-primary-foreground" />
            </div>
            MentorMatch<span className="text-primary">.AI</span>
          </a>
          <nav className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#problem" className="hover:text-foreground transition">Problem</a>
            <a href="#scope" className="hover:text-foreground transition">Scope</a>
            <a href="#stack" className="hover:text-foreground transition">Tech</a>
            <a href="#workflow" className="hover:text-foreground transition">Workflow</a>
            <a href="#roadmap" className="hover:text-foreground transition">Roadmap</a>
          </nav>
          <div className="hidden md:flex items-center gap-2">
            <Link to="/login" className="text-sm font-medium px-4 py-2 rounded-lg text-muted-foreground hover:text-foreground transition">
              Sign in
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-lg bg-primary text-primary-foreground hover:opacity-90 transition">
              Launch App <ArrowRight className="size-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO */}
      <section id="top" className="relative pt-40 pb-32 px-6 grid-bg overflow-hidden">
        <div className="max-w-5xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-card/50 text-xs font-mono text-muted-foreground mb-8">
            <span className="size-1.5 rounded-full bg-primary animate-pulse" />
            Semantic Embeddings × Claude AI Reasoning
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-[1.05]">
            The right mentor,<br />
            <span className="text-gradient">explained by AI.</span>
          </h1>
          <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
            An AI-powered student–faculty matching platform that pairs mentees with professors
            using semantic embeddings — and tells them <em>why</em>.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
              Get started <ArrowRight className="size-4" />
            </Link>
            <Link to="/login" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg border border-border bg-card/50 font-medium hover:bg-card transition">
              Sign in
            </Link>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { k: "1536", v: "dim embeddings" },
              { k: "O(log n)", v: "HNSW search" },
              { k: "Top-K", v: "Claude re-ranking" },
              { k: "100%", v: "explainable" },
            ].map((s) => (
              <div key={s.v} className="glass-card rounded-xl p-4">
                <div className="text-2xl font-display font-bold text-gradient">{s.k}</div>
                <div className="text-xs text-muted-foreground mt-1">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PROBLEM */}
      <Section id="problem" eyebrow="The Problem" title="Mentor matching today is manual, opaque, and built for the wrong audience.">
        <div className="grid md:grid-cols-2 gap-5">
          {problems.map((p) => (
            <div key={p.title} className="glass-card rounded-2xl p-6 hover:border-primary/30 transition">
              <div className="size-10 rounded-lg bg-destructive/10 text-destructive grid place-items-center mb-4">
                <p.icon className="size-5" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{p.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* GOAL */}
      <Section eyebrow="Our Goal" title="Compatible mentor matches, with a clear reason behind every pairing.">
        <p className="text-lg text-muted-foreground max-w-3xl mb-10">
          Students describe their requirements, learning style and domain — and get matched with the most
          compatible professor mentor, with a human-readable explanation of why.
        </p>
        <div className="grid md:grid-cols-3 gap-5">
          {[
            { icon: Target, label: "GOAL", desc: "Reduce time-to-mentor and improve match quality through AI-driven compatibility scoring." },
            { icon: Cog, label: "METHOD", desc: "OpenAI embeddings + pgvector similarity + Claude AI for ranking and explanation." },
            { icon: Package, label: "OUTPUT", desc: "Top matched professor + a human-readable, explainable reason for the pairing." },
          ].map((c) => (
            <div key={c.label} className="glass-card rounded-2xl p-6">
              <c.icon className="size-6 text-primary mb-4" />
              <div className="text-xs font-mono tracking-widest text-primary mb-2">{c.label}</div>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* SCOPE */}
      <Section id="scope" eyebrow="Scope of Work" title="Seven modules that take a mentee from sign-up to a tracked mentorship.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {scope.map((s) => (
            <div key={s.n} className="glass-card rounded-2xl p-6 group hover:border-primary/40 transition">
              <div className="flex items-start justify-between mb-4">
                <div className="size-11 rounded-xl bg-primary/10 text-primary grid place-items-center group-hover:bg-primary group-hover:text-primary-foreground transition">
                  <s.icon className="size-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">{s.n}</span>
              </div>
              <h3 className="font-semibold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* WORKFLOW */}
      <Section id="workflow" eyebrow="Our Workflow" title="From profile text to a personalized, explained match — in five steps.">
        <div className="relative">
          <div className="absolute left-6 md:left-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-primary via-accent to-transparent md:-translate-x-px" />
          <div className="space-y-8">
            {workflow.map((w, i) => (
              <div key={w.n} className={`relative md:grid md:grid-cols-2 md:gap-12 ${i % 2 ? "md:[&>*:first-child]:order-2" : ""}`}>
                <div className="pl-16 md:pl-0 md:text-right md:pr-12">
                  <div className="glass-card rounded-2xl p-6 inline-block text-left">
                    <div className="font-mono text-xs text-primary mb-2">STEP {w.n}</div>
                    <h3 className="font-semibold text-lg mb-2">{w.title}</h3>
                    <p className="text-sm text-muted-foreground">{w.desc}</p>
                  </div>
                </div>
                <div className="hidden md:block" />
                <div className="absolute left-6 md:left-1/2 top-6 -translate-x-1/2 size-4 rounded-full bg-primary glow ring-4 ring-background" />
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* TECH STACK */}
      <Section id="stack" eyebrow="Tech Stack" title="A pragmatic, open-source stack — vectors and reasoning, side by side.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {stack.map((s) => (
            <div key={s.name} className="glass-card rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="size-10 rounded-lg bg-accent/10 text-accent grid place-items-center">
                  <s.icon className="size-5" />
                </div>
                <div>
                  <div className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{s.name}</div>
                  <div className="font-semibold">{s.tech}</div>
                </div>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CHALLENGES */}
      <Section eyebrow="Research Gaps" title="Six hard problems we're explicitly designing around.">
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {challenges.map((c) => (
            <div key={c.n} className="glass-card rounded-2xl p-6">
              <div className="text-4xl font-display font-bold text-gradient mb-3">0{c.n}</div>
              <h3 className="font-semibold mb-2">{c.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{c.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* COMPARISON */}
      <Section eyebrow="vs Existing Solutions" title="Where we differ from Mentor Collective and Qooper.">
        <div className="glass-card rounded-2xl overflow-hidden">
          <div className="grid grid-cols-3 px-6 py-4 border-b border-border bg-card/50 text-xs font-mono uppercase tracking-wider text-muted-foreground">
            <div>Feature</div>
            <div>Mentor Collective / Qooper</div>
            <div className="text-primary">Our Platform</div>
          </div>
          {comparison.map((row, i) => (
            <div key={row.feature} className={`grid grid-cols-3 px-6 py-5 text-sm gap-4 ${i < comparison.length - 1 ? "border-b border-border" : ""}`}>
              <div className="font-medium">{row.feature}</div>
              <div className="flex items-start gap-2 text-muted-foreground">
                <XCircle className="size-4 text-destructive mt-0.5 shrink-0" /> {row.them}
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" /> {row.us}
              </div>
            </div>
          ))}
        </div>
      </Section>

      {/* ROADMAP */}
      <Section id="roadmap" eyebrow="Roadmap" title="Four phases — from foundation to a self-improving platform.">
        <div className="grid md:grid-cols-2 gap-5">
          {phases.map((p, i) => (
            <div key={p.phase} className="glass-card rounded-2xl p-6 relative overflow-hidden">
              <div className="absolute -right-8 -top-8 size-32 rounded-full bg-primary/5 blur-2xl" />
              <div className="flex items-baseline gap-3 mb-1">
                <span className="font-mono text-xs text-primary">{p.phase}</span>
                <span className="text-xs text-muted-foreground">/ 0{i + 1} of 04</span>
              </div>
              <h3 className="font-display text-xl font-bold mb-4">{p.title}</h3>
              <ul className="space-y-2">
                {p.items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="size-4 text-primary mt-0.5 shrink-0" /> {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Section>

      {/* FUTURE */}
      <Section eyebrow="Future Enhancements" title="What comes after v1 — for both mentees and mentors.">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {future.map((f) => (
            <div key={f.title} className="glass-card rounded-2xl p-5 hover:-translate-y-1 transition">
              <div className="size-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 text-primary grid place-items-center mb-3">
                <f.icon className="size-5" />
              </div>
              <h3 className="font-semibold mb-1 text-sm">{f.title}</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </Section>

      {/* CTA / TEAM */}
      <section className="relative py-32 px-6">
        <div className="max-w-4xl mx-auto text-center glass-card rounded-3xl p-12 glow relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
          <div className="relative">
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Built for academia. <span className="text-gradient">Explained by AI.</span></h2>
            <p className="text-muted-foreground max-w-xl mx-auto mb-8">
              Questions and discussions are welcome. Built with Next.js, pgvector, OpenAI Embeddings and the Claude API.
            </p>
            <div className="flex flex-wrap justify-center gap-2 text-xs font-mono">
              {["Next.js", "pgvector", "OpenAI", "Claude API", "PostgreSQL", "Vercel"].map((t) => (
                <span key={t} className="px-3 py-1 rounded-full border border-border bg-card/50">{t}</span>
              ))}
            </div>
            <div className="mt-10 pt-8 border-t border-border">
              <div className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">Team</div>
              <div className="flex flex-wrap justify-center gap-x-6 gap-y-1 text-sm">
                <span>Atul Kandiyil</span>
                <span className="text-muted-foreground">·</span>
                <span>Hariom N Kini</span>
                <span className="text-muted-foreground">·</span>
                <span>Meghana P</span>
              </div>
              <div className="text-xs text-muted-foreground mt-2">Mentored by Animesh Giri</div>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8 px-6 text-center text-xs text-muted-foreground">
        © {new Date().getFullYear()} MentorMatch.AI — AI Mentor Mentee Platform
      </footer>
    </div>
  );
}
