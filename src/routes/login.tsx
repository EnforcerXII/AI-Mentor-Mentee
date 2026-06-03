import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Brain, GraduationCap, Sparkles, ArrowRight, Mail, Lock, Github } from "lucide-react";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign in — MentorMatch.AI" },
      { name: "description", content: "Sign in to MentorMatch.AI as a mentor or mentee." },
    ],
  }),
  component: Login,
});

type Role = "mentee" | "mentor";
type Mode = "signin" | "signup";

function Login() {
  const navigate = useNavigate();
  const [role, setRole] = useState<Role>("mentee");
  const [mode, setMode] = useState<Mode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== "undefined") {
      window.localStorage.setItem("mm.role", role);
      window.localStorage.setItem("mm.email", email);
    }
    if (mode === "signup") {
      navigate({ to: "/app/profile" });
    } else {
      navigate({ to: "/app" });
    }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* Left — brand panel */}
      <div className="hidden lg:flex flex-col justify-between p-12 grid-bg border-r border-border relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 pointer-events-none" />
        <Link to="/" className="relative flex items-center gap-2 font-display font-bold text-lg">
          <div className="size-9 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow">
            <Brain className="size-5 text-primary-foreground" />
          </div>
          MentorMatch<span className="text-primary">.AI</span>
        </Link>

        <div className="relative space-y-6 max-w-md">
          <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-primary">
            <span className="h-px w-8 bg-primary" /> Semantic matching
          </div>
          <h1 className="text-4xl font-bold leading-tight">
            Mentor pairings, <span className="text-gradient">explained</span> by AI.
          </h1>
          <p className="text-muted-foreground">
            Sign in to access semantic mentor matching, session tracking, and Claude-powered
            explanations for every pairing.
          </p>
          <div className="glass-card rounded-2xl p-5 text-sm">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <Sparkles className="size-4" />
              <span className="font-mono uppercase text-xs tracking-widest">Demo mode</span>
            </div>
            <p className="text-muted-foreground">
              No real authentication is wired up — any email/password lands you in the app.
              Your role choice determines which profile setup you see.
            </p>
          </div>
        </div>

        <div className="relative text-xs text-muted-foreground">
          © 2026 MentorMatch.AI — built for academic mentorship.
        </div>
      </div>

      {/* Right — form */}
      <div className="flex items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="lg:hidden flex items-center gap-2 font-display font-bold mb-8">
            <div className="size-8 rounded-lg bg-gradient-to-br from-primary to-accent grid place-items-center glow">
              <Brain className="size-4 text-primary-foreground" />
            </div>
            MentorMatch<span className="text-primary">.AI</span>
          </Link>

          <h2 className="text-3xl font-bold mb-2">
            {mode === "signin" ? "Welcome back" : "Create your account"}
          </h2>
          <p className="text-muted-foreground mb-8">
            {mode === "signin"
              ? "Sign in to continue to your dashboard."
              : "Pick your role to get a tailored profile setup."}
          </p>

          {/* Role toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl border border-border bg-muted/40 mb-6">
            {([
              { v: "mentee", label: "I'm a Mentee", icon: GraduationCap },
              { v: "mentor", label: "I'm a Mentor", icon: Sparkles },
            ] as const).map((r) => {
              const active = role === r.v;
              return (
                <button
                  key={r.v}
                  type="button"
                  onClick={() => setRole(r.v)}
                  className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                    active
                      ? "bg-primary text-primary-foreground glow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <r.icon className="size-4" />
                  {r.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <label className="block">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                {role === "mentor" ? "Faculty email" : "Student email"}
              </span>
              <div className="relative mt-1.5">
                <Mail className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={role === "mentor" ? "you@university.edu" : "student@university.edu"}
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none transition"
                />
              </div>
            </label>

            <label className="block">
              <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                Password
              </span>
              <div className="relative mt-1.5">
                <Lock className="size-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-muted border border-border rounded-lg pl-10 pr-3 py-2.5 text-sm focus:border-primary focus:outline-none transition"
                />
              </div>
              {mode === "signin" && (
                <div className="text-right mt-1.5">
                  <button type="button" className="text-xs text-primary hover:underline">
                    Forgot password?
                  </button>
                </div>
              )}
            </label>

            <button
              type="submit"
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:opacity-90 transition glow"
            >
              {mode === "signin" ? "Sign in" : "Create account"}
              <ArrowRight className="size-4" />
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="h-px flex-1 bg-border" />
            <span className="text-xs text-muted-foreground font-mono uppercase tracking-wider">or</span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            type="button"
            onClick={handleSubmit as never}
            className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-lg border border-border bg-card/50 font-medium hover:bg-card transition text-sm"
          >
            <Github className="size-4" /> Continue with university SSO
          </button>

          <p className="text-sm text-muted-foreground text-center mt-8">
            {mode === "signin" ? "New to MentorMatch?" : "Already have an account?"}{" "}
            {mode === "signin" ? (
              <Link
                to={role === "mentor" ? "/register/mentor" : "/register/mentee"}
                className="text-primary hover:underline font-medium"
              >
                Create a {role} account
              </Link>
            ) : (
              <button
                type="button"
                onClick={() => setMode("signin")}
                className="text-primary hover:underline font-medium"
              >
                Sign in
              </button>
            )}
          </p>

          <div className="mt-4 grid grid-cols-2 gap-2 text-center text-xs">
            <Link to="/register/mentee" className="px-3 py-2 rounded-lg border border-border hover:bg-card transition text-muted-foreground hover:text-foreground">
              Register as Mentee
            </Link>
            <Link to="/register/mentor" className="px-3 py-2 rounded-lg border border-border hover:bg-card transition text-muted-foreground hover:text-foreground">
              Register as Mentor
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
