import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, GraduationCap, ArrowRight, Plus, X } from "lucide-react";
import { useRole } from "@/lib/useRole";

export const Route = createFileRoute("/register/mentee")({
  head: () => ({
    meta: [
      { title: "Mentee registration — MentorMatch.AI" },
      { name: "description", content: "Create your mentee profile on MentorMatch.AI." },
    ],
  }),
  component: MenteeRegister,
});

const inputCls =
  "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none transition";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}

function TagInput({ value, onChange, placeholder }: { value: string[]; onChange: (v: string[]) => void; placeholder: string }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !value.includes(v)) onChange([...value, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs">
            {t}
            <button type="button" onClick={() => onChange(value.filter((x) => x !== t))}>
              <X className="size-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder={placeholder}
          className={inputCls}
        />
        <button type="button" onClick={add} className="px-3 rounded-lg border border-border bg-card/50 hover:bg-card transition">
          <Plus className="size-4" />
        </button>
      </div>
    </div>
  );
}

function MenteeRegister() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [name, setName] = useState("");
  const [marks, setMarks] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [branch, setBranch] = useState("");
  const [aspiringRoles, setAspiringRoles] = useState("");
  const [interests, setInterests] = useState<string[]>([]);
  const [problems, setProblems] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole("mentee");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "mm.mentee.profile",
        JSON.stringify({ name, marks, cgpa, branch, aspiringRoles, interests, problems }),
      );
    }
    navigate({ to: "/app" });
  };

  return (
    <div className="min-h-screen grid-bg">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/" className="flex items-center gap-2 font-display font-bold mb-8">
          <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow">
            <Brain className="size-4 text-primary-foreground" />
          </div>
          MentorMatch<span className="text-primary">.AI</span>
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary mb-3">
            <GraduationCap className="size-4" /> Mentee registration
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Tell us about you</h1>
          <p className="text-muted-foreground mt-2">
            This becomes your profile vector and drives every mentor match.
          </p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-5">
          <Field label="Full name">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Atul Kandiyil" className={inputCls} />
          </Field>

          <div className="grid md:grid-cols-2 gap-5">
            <Field label="12th / school marks (%)">
              <input required value={marks} onChange={(e) => setMarks(e.target.value)} placeholder="92" className={inputCls} />
            </Field>
            <Field label="Current CGPA">
              <input required value={cgpa} onChange={(e) => setCgpa(e.target.value)} placeholder="8.6" className={inputCls} />
            </Field>
          </div>

          <Field label="Branch / Program">
            <input required value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="B.Tech · Computer Science" className={inputCls} />
          </Field>

          <Field label="Interests" hint="Add as many as you like — press Enter after each.">
            <TagInput value={interests} onChange={setInterests} placeholder="e.g. NLP, Robotics, Systems" />
          </Field>

          <Field label="Aspiring roles">
            <input required value={aspiringRoles} onChange={(e) => setAspiringRoles(e.target.value)} placeholder="Applied ML Researcher, ML Engineer" className={inputCls} />
          </Field>

          <Field label="Problems you want to solve" hint="Free-form — embedded into your profile vector.">
            <textarea rows={4} required value={problems} onChange={(e) => setProblems(e.target.value)} placeholder="I want to work on retrieval systems for low-resource languages…" className={inputCls} />
          </Field>

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
            Create mentee account <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Are you a mentor instead?{" "}
          <Link to="/register/mentor" className="text-primary hover:underline font-medium">
            Mentor registration
          </Link>
        </p>
      </div>
    </div>
  );
}
