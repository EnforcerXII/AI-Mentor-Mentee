import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, Sparkles, ArrowRight, Plus, X } from "lucide-react";
import { useRole } from "@/lib/useRole";

export const Route = createFileRoute("/register/mentor")({
  head: () => ({
    meta: [
      { title: "Mentor registration — MentorMatch.AI" },
      { name: "description", content: "Create your mentor profile on MentorMatch.AI." },
    ],
  }),
  component: MentorRegister,
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

function MentorRegister() {
  const navigate = useNavigate();
  const { setRole } = useRole();
  const [name, setName] = useState("");
  const [qualifications, setQualifications] = useState("");
  const [experience, setExperience] = useState("");
  const [availability, setAvailability] = useState("High — accepting new mentees");
  const [domains, setDomains] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setRole("mentor");
    if (typeof window !== "undefined") {
      window.localStorage.setItem(
        "mm.mentor.profile",
        JSON.stringify({ name, qualifications, experience, availability, domains, skills }),
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
            <Sparkles className="size-4" /> Mentor registration
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">Build your mentor profile</h1>
          <p className="text-muted-foreground mt-2">
            Mentees are matched against this profile using semantic embeddings.
          </p>
        </div>

        <form onSubmit={submit} className="glass-card rounded-2xl p-6 space-y-5">
          <Field label="Full name">
            <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Dr. Priya Raman" className={inputCls} />
          </Field>

          <Field label="Domains" hint="The research / industry areas you mentor in.">
            <TagInput value={domains} onChange={setDomains} placeholder="e.g. NLP, Distributed Systems, HCI" />
          </Field>

          <Field label="Qualifications">
            <textarea rows={3} required value={qualifications} onChange={(e) => setQualifications(e.target.value)} placeholder="Ph.D. in Computer Science, Stanford · M.S. ETH Zürich" className={inputCls} />
          </Field>

          <Field label="Work experience">
            <textarea rows={4} required value={experience} onChange={(e) => setExperience(e.target.value)} placeholder="12 years across academia and industry. Currently Associate Professor; previously Senior Research Scientist at Meta AI." className={inputCls} />
          </Field>

          <Field label="Skills">
            <TagInput value={skills} onChange={setSkills} placeholder="e.g. PyTorch, Transformers, Vector Search" />
          </Field>

          <Field label="Availability">
            <select value={availability} onChange={(e) => setAvailability(e.target.value)} className={inputCls}>
              <option>High — accepting new mentees</option>
              <option>Medium — limited slots</option>
              <option>Low — not accepting</option>
            </select>
          </Field>

          <button type="submit" className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
            Create mentor account <ArrowRight className="size-4" />
          </button>
        </form>

        <p className="text-sm text-muted-foreground text-center mt-6">
          Looking for a mentor instead?{" "}
          <Link to="/register/mentee" className="text-primary hover:underline font-medium">
            Mentee registration
          </Link>
        </p>
      </div>
    </div>
  );
}
