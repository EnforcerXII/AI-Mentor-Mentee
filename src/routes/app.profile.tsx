import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save, Plus, X } from "lucide-react";
import { useRole } from "@/lib/useRole";

export const Route = createFileRoute("/app/profile")({
  head: () => ({ meta: [{ title: "Profile — MentorMatch.AI" }] }),
  component: Profile,
});

function Profile() {
  const { role, ready } = useRole();

  if (!ready) return <div className="p-10 text-center text-sm text-muted-foreground">Loading…</div>;
  if (!role) return null;

  return (
    <div className="p-6 md:p-10 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="text-xs font-mono uppercase tracking-widest text-primary mb-2">Profile</div>
        <h1 className="text-3xl md:text-4xl font-bold">Your {role} profile</h1>
        <p className="text-muted-foreground mt-2">
          {role === "mentee"
            ? "This is what gets embedded and matched against the faculty corpus."
            : "Mentees will be matched against this profile using semantic embeddings."}
        </p>
      </div>

      {role === "mentee" ? <MenteeForm /> : <MentorForm />}
    </div>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="mt-1.5">{children}</div>
      {hint && <span className="text-xs text-muted-foreground mt-1 block">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full bg-muted border border-border rounded-lg px-3 py-2.5 text-sm focus:border-primary focus:outline-none transition";

function TagInput({ initial, placeholder }: { initial: string[]; placeholder: string }) {
  const [tags, setTags] = useState<string[]>(initial);
  const [draft, setDraft] = useState("");
  const add = () => {
    const v = draft.trim();
    if (v && !tags.includes(v)) setTags([...tags, v]);
    setDraft("");
  };
  return (
    <div>
      <div className="flex flex-wrap gap-1.5 mb-2">
        {tags.map((t) => (
          <span key={t} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-primary/10 text-primary border border-primary/20 text-xs">
            {t}
            <button type="button" onClick={() => setTags(tags.filter((x) => x !== t))}>
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

function MenteeForm() {
  return (
    <form className="glass-card rounded-2xl p-6 space-y-5">
      <Field label="Full name"><input defaultValue="Atul Kandiyil" className={inputCls} /></Field>
      <Field label="Email"><input defaultValue="atul@university.edu" className={inputCls} /></Field>
      <Field label="Program"><input defaultValue="B.Tech · Computer Science · 3rd year" className={inputCls} /></Field>
      <Field label="Career goals" hint="Free-form — embedded into your profile vector.">
        <textarea rows={3} defaultValue="Pursue an MS in ML with a focus on retrieval systems." className={inputCls} />
      </Field>
      <Field label="Current skills">
        <TagInput initial={["Python", "PyTorch", "JavaScript", "Postgres"]} placeholder="Add a skill and press Enter" />
      </Field>
      <Field label="Interests">
        <TagInput initial={["NLP", "Vector Search", "Distributed Systems"]} placeholder="Add an interest" />
      </Field>
      <Field label="Aspired role"><input defaultValue="Applied ML Researcher" className={inputCls} /></Field>
      <Field label="Preferred learning style">
        <select className={inputCls} defaultValue="Hands-on">
          <option>Hands-on</option>
          <option>Reading groups</option>
          <option>Socratic / discussion-led</option>
          <option>Project-led</option>
        </select>
      </Field>
      <SaveBar hint="Saving regenerates your 1536-dim profile vector so future matches reflect your latest goals." />
    </form>
  );
}

function MentorForm() {
  return (
    <form className="glass-card rounded-2xl p-6 space-y-5">
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Full name"><input defaultValue="Dr. Priya Raman" className={inputCls} /></Field>
        <Field label="Title">
          <select className={inputCls} defaultValue="Associate Professor">
            <option>Assistant Professor</option>
            <option>Associate Professor</option>
            <option>Professor</option>
            <option>Lab Head</option>
            <option>Industry Mentor</option>
          </select>
        </Field>
        <Field label="University email"><input defaultValue="priya.raman@university.edu" className={inputCls} /></Field>
        <Field label="Department"><input defaultValue="Computer Science" className={inputCls} /></Field>
        <Field label="Years of experience"><input type="number" defaultValue={12} className={inputCls} /></Field>
        <Field label="Publications"><input type="number" defaultValue={47} className={inputCls} /></Field>
      </div>
      <Field label="Research bio" hint="Used as the primary text source for semantic matching.">
        <textarea rows={4} defaultValue="Works on retrieval-augmented generation and semantic search at scale. Loves mentoring students through their first publication." className={inputCls} />
      </Field>
      <Field label="Research domains">
        <TagInput initial={["Machine Learning", "NLP", "Information Retrieval"]} placeholder="Add a research domain" />
      </Field>
      <Field label="Technical skills">
        <TagInput initial={["Transformers", "Vector Search", "PyTorch", "Python"]} placeholder="Add a skill" />
      </Field>
      <Field label="Mentoring style">
        <TagInput initial={["Hands-on", "Project-led", "Iterative"]} placeholder="Add a style" />
      </Field>
      <div className="grid md:grid-cols-2 gap-5">
        <Field label="Availability this semester">
          <select className={inputCls} defaultValue="High">
            <option>High — accepting new mentees</option>
            <option>Medium — limited slots</option>
            <option>Low — not accepting</option>
          </select>
        </Field>
        <Field label="Max concurrent mentees"><input type="number" defaultValue={5} className={inputCls} /></Field>
      </div>
      <Field label="Office hours"><input defaultValue="Tue & Thu · 3pm – 5pm" className={inputCls} /></Field>
      <Field label="Meeting cadence preference">
        <select className={inputCls} defaultValue="Weekly">
          <option>Weekly</option>
          <option>Bi-weekly</option>
          <option>Monthly</option>
          <option>Ad hoc</option>
        </select>
      </Field>
      <SaveBar hint="Saving re-embeds your bio + domains so mentees can be matched against your latest profile." />
    </form>
  );
}

function SaveBar({ hint }: { hint: string }) {
  return (
    <>
      <button type="button" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow">
        <Save className="size-4" /> Save & re-embed
      </button>
      <p className="text-xs text-muted-foreground">{hint}</p>
    </>
  );
}
