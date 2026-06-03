export type Mentor = {
  id: string;
  name: string;
  title: string;
  department: string;
  avatar: string;
  domains: string[];
  skills: string[];
  experienceYears: number;
  publications: number;
  availability: "High" | "Medium" | "Low";
  bio: string;
  learningStyle: string[];
  rating: number;
  sessions: number;
};

export const MENTORS: Mentor[] = [
  {
    id: "m1",
    name: "Dr. Priya Raman",
    title: "Associate Professor",
    department: "Computer Science",
    avatar: "PR",
    domains: ["Machine Learning", "NLP", "Information Retrieval"],
    skills: ["Transformers", "Vector Search", "PyTorch", "Python"],
    experienceYears: 12,
    publications: 47,
    availability: "High",
    bio: "Works on retrieval-augmented generation and semantic search at scale. Loves mentoring students through their first publication.",
    learningStyle: ["Hands-on", "Project-led", "Iterative"],
    rating: 4.9,
    sessions: 184,
  },
  {
    id: "m2",
    name: "Prof. Animesh Giri",
    title: "Professor & Lab Head",
    department: "Information Science",
    avatar: "AG",
    domains: ["Distributed Systems", "Cloud", "Systems ML"],
    skills: ["Kubernetes", "Go", "Postgres", "gRPC"],
    experienceYears: 18,
    publications: 62,
    availability: "Medium",
    bio: "Heads the Systems Lab. Mentors students into industry-grade engineering with weekly code reviews and architecture critiques.",
    learningStyle: ["Socratic", "Critique-driven", "Reading groups"],
    rating: 4.8,
    sessions: 312,
  },
  {
    id: "m3",
    name: "Dr. Kavya Nair",
    title: "Assistant Professor",
    department: "Computer Science",
    avatar: "KN",
    domains: ["HCI", "AI Ethics", "Explainability"],
    skills: ["User Research", "Mixed Methods", "Figma", "R"],
    experienceYears: 7,
    publications: 23,
    availability: "High",
    bio: "Studies how people actually understand model outputs. Great fit for students who want to combine design thinking with AI.",
    learningStyle: ["Discussion-led", "Reflective", "Writing-heavy"],
    rating: 4.9,
    sessions: 96,
  },
  {
    id: "m4",
    name: "Dr. Rohan Mehta",
    title: "Associate Professor",
    department: "Electronics",
    avatar: "RM",
    domains: ["Embedded AI", "Edge Computing", "Computer Vision"],
    skills: ["C++", "CUDA", "TensorRT", "ROS"],
    experienceYears: 14,
    publications: 38,
    availability: "Low",
    bio: "Builds tiny models for big robots. Mentors students who like to ship physical things.",
    learningStyle: ["Hands-on", "Hardware-first"],
    rating: 4.7,
    sessions: 142,
  },
  {
    id: "m5",
    name: "Dr. Sneha Iyer",
    title: "Professor",
    department: "Data Science",
    avatar: "SI",
    domains: ["Statistical Learning", "Causal Inference", "Healthcare AI"],
    skills: ["R", "Python", "Stan", "Bayesian Methods"],
    experienceYears: 16,
    publications: 71,
    availability: "Medium",
    bio: "Bridges medicine and ML. Strong on rigour — ideal for students aiming at top conferences.",
    learningStyle: ["Reading groups", "Mathematical rigor"],
    rating: 4.9,
    sessions: 208,
  },
  {
    id: "m6",
    name: "Prof. Vikram Shah",
    title: "Associate Professor",
    department: "Computer Science",
    avatar: "VS",
    domains: ["Security", "Cryptography", "Privacy-Preserving ML"],
    skills: ["Rust", "Zero-Knowledge", "Differential Privacy"],
    experienceYears: 11,
    publications: 34,
    availability: "Medium",
    bio: "Mentors students at the intersection of security and ML — federated learning, ZK proofs, secure enclaves.",
    learningStyle: ["Project-led", "Critique-driven"],
    rating: 4.8,
    sessions: 121,
  },
];

// Deterministic pseudo-embedding similarity for the demo:
// derive a stable vector from text, then cosine compare.
function hashVec(text: string, dims = 32): number[] {
  const v = new Array(dims).fill(0);
  const tokens = text.toLowerCase().match(/[a-z0-9]+/g) ?? [];
  for (const tok of tokens) {
    let h = 2166136261;
    for (let i = 0; i < tok.length; i++) {
      h ^= tok.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    const idx = Math.abs(h) % dims;
    v[idx] += 1;
    v[(idx + 7) % dims] += 0.5;
  }
  const norm = Math.sqrt(v.reduce((s, x) => s + x * x, 0)) || 1;
  return v.map((x) => x / norm);
}

function cosine(a: number[], b: number[]): number {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

export type MenteeProfile = {
  name: string;
  goals: string;
  skills: string;
  interests: string;
  aspiredRole: string;
  learningStyle: string;
};

export type Match = {
  mentor: Mentor;
  score: number; // 0..1
  reasons: string[];
  summary: string;
};

export function matchMentors(profile: MenteeProfile): Match[] {
  const menteeText = [
    profile.goals,
    profile.skills,
    profile.interests,
    profile.aspiredRole,
    profile.learningStyle,
  ].join(" ");
  const mVec = hashVec(menteeText);

  const results: Match[] = MENTORS.map((mentor) => {
    const mentorText = [
      mentor.bio,
      mentor.domains.join(" "),
      mentor.skills.join(" "),
      mentor.learningStyle.join(" "),
      mentor.department,
    ].join(" ");
    const sVec = hashVec(mentorText);
    const raw = cosine(mVec, sVec);
    // squash + boost availability slightly
    const availBoost = mentor.availability === "High" ? 0.05 : mentor.availability === "Medium" ? 0.02 : 0;
    const score = Math.max(0, Math.min(1, 0.5 + raw * 1.5 + availBoost));

    const overlapSkills = mentor.skills.filter((s) =>
      profile.skills.toLowerCase().includes(s.toLowerCase()) ||
      profile.interests.toLowerCase().includes(s.toLowerCase()),
    );
    const overlapDomains = mentor.domains.filter((d) =>
      [profile.goals, profile.interests, profile.aspiredRole]
        .join(" ").toLowerCase().includes(d.toLowerCase().split(" ")[0]),
    );
    const styleMatch = mentor.learningStyle.find((s) =>
      profile.learningStyle.toLowerCase().includes(s.toLowerCase().split("-")[0].split(" ")[0]),
    );

    const reasons: string[] = [];
    if (overlapDomains.length)
      reasons.push(`Mentor's research in ${overlapDomains.join(", ")} directly aligns with your stated interests.`);
    if (overlapSkills.length)
      reasons.push(`Shared technical vocabulary: ${overlapSkills.slice(0, 3).join(", ")}.`);
    if (styleMatch)
      reasons.push(`Learning style fit — mentor favours a ${styleMatch.toLowerCase()} approach.`);
    if (mentor.availability === "High")
      reasons.push(`Currently has high availability for new mentees this semester.`);
    if (!reasons.length)
      reasons.push(`Broad expertise across ${mentor.domains.slice(0, 2).join(" and ")} provides exploration room.`);

    const summary =
      `${mentor.name} is a strong candidate because their work on ` +
      `${mentor.domains[0].toLowerCase()} maps onto your goal of "${profile.aspiredRole || "exploring this field"}". ` +
      `With ${mentor.experienceYears} years of experience and ${mentor.publications} publications, they can guide ` +
      `you from your current level toward ${profile.aspiredRole ? `a ${profile.aspiredRole.toLowerCase()} trajectory` : "publication-quality research"}.`;

    return { mentor, score, reasons, summary };
  });

  return results.sort((a, b) => b.score - a.score);
}

export function getMentor(id: string): Mentor | undefined {
  return MENTORS.find((m) => m.id === id);
}
