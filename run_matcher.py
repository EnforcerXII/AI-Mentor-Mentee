"""
run_matcher.py — Full pipeline with smart data loading + reasons
=================================================================
Inspects any file, maps columns, runs tiered constrained matching,
and explains every assignment and every unassigned student.

Usage:
    python run_matcher.py --path my_data.xlsx
    python run_matcher.py --path my_data.xlsx --no-ai
    python run_matcher.py --capacity 15   # override per-mentor cap
    python run_matcher.py --out results.xlsx

Install:
    pip install sentence-transformers scikit-learn numpy scipy pandas openpyxl
"""

import argparse, shutil, sys, os, datetime
import numpy as np
from scipy.optimize import linear_sum_assignment
from sklearn.metrics.pairwise import cosine_similarity

# ── Clear stale .pyc cache before every run ──────────────────────
_cache = os.path.join(os.path.dirname(__file__), "__pycache__")
if os.path.exists(_cache):
    shutil.rmtree(_cache)
for mod in list(sys.modules):
    if mod in ("schema_inspector", "data_loader"):
        del sys.modules[mod]

from schema_inspector import inspect_and_load
from data_loader import export_assignments

# ── Args ─────────────────────────────────────────────────────────
parser = argparse.ArgumentParser()
parser.add_argument("--path",          default="dataset1.xlsx")
parser.add_argument("--mentor-path",  default=None)  # two-file mode
parser.add_argument("--student-path", default=None)  # two-file mode
parser.add_argument("--mentor-sheet",  default=None)
parser.add_argument("--student-sheet", default=None)
parser.add_argument("--capacity",      type=int, default=None,
                    help="Global fallback capacity if file has no Max_Mentees column")
parser.add_argument("--out",           default="assignments.xlsx")
args = parser.parse_args()

# ── Confirm file ─────────────────────────────────────────────────
if not os.path.exists(args.path):
    print(f"\n✗  File not found: {args.path}")
    sys.exit(1)

if args.mentor_path and args.student_path:
    # Two-file mode
    MENTOR_FILE  = args.mentor_path
    STUDENT_FILE = args.student_path
    TWO_FILES    = True
elif args.path and args.mentor_path:
    # --path as alias for mentor in two-file mode
    MENTOR_FILE  = args.mentor_path
    STUDENT_FILE = args.path
    TWO_FILES    = True
elif args.path:
    # Single combined file
    MENTOR_FILE  = args.path
    STUDENT_FILE = args.path
    TWO_FILES    = False
elif args.mentor_path:
    print("\n✗  --mentor-path given but --student-path is missing.")
    print("   Either provide both, or use --path for a single combined file.")
    sys.exit(1)
else:
    # Default to looking for mentor_mentee_dataset.xlsx
    MENTOR_FILE  = "mentor_mentee_dataset.xlsx"
    STUDENT_FILE = "mentor_mentee_dataset.xlsx"
    TWO_FILES    = False

mod_time = datetime.datetime.fromtimestamp(
    os.path.getmtime(args.path)).strftime("%Y-%m-%d %H:%M:%S")
size_kb  = os.path.getsize(args.path) // 1024
print(f"\nFile    : {os.path.abspath(args.path)}")
print(f"Modified: {mod_time}  |  Size: {size_kb} KB\n")

# ── Tier weights ─────────────────────────────────────────────────
TIER_WEIGHTS = {
    "support":  {"issue_match":5.0,"interest_match":0.5,"bio_similarity":2.0,
                 "skill_overlap":2.0,"industry_match":0.5,"avail_match":1.5,},
    "standard": {"issue_match":1.0,"interest_match":1.0,"bio_similarity":4.0,
                 "skill_overlap":3.0,"industry_match":1.5,"avail_match":1.0,},
    "interest": {"issue_match":0.2,"interest_match":5.0,"bio_similarity":3.0,
                 "skill_overlap":2.5,"industry_match":2.0,"avail_match":0.5,},
}

# ── 1. Inspect + Map + Load ──────────────────────────────────────
mentors, students, mapping = inspect_and_load(
    path          = MENTOR_FILE,
    student_path  = STUDENT_FILE if TWO_FILES else None,
    mentor_sheet  = args.mentor_sheet,
    student_sheet = args.student_sheet,
    verbose       = True,
)
N_MENTORS, N_STUDENTS = len(mentors), len(students)

# Per-mentor capacity: use Max_Mentees from file if present, else --capacity, else 10
DEFAULT_CAP = args.capacity or 10
mentor_caps = [
    int(m.get("max_mentees") or DEFAULT_CAP) for m in mentors
]
total_capacity = sum(mentor_caps)

print(f"\nMentor capacities (from file or default={DEFAULT_CAP}):")
for m, cap in zip(mentors, mentor_caps):
    src = "file" if m.get("max_mentees") else "default"
    print(f"  {m['name']:<22} capacity={cap}  ({src})")

print(f"\nTotal capacity : {total_capacity} slots for {N_STUDENTS} students")
if N_STUDENTS > total_capacity:
    print(f"⚠  {N_STUDENTS - total_capacity} students CANNOT be assigned — "
          f"add mentors or increase capacity.")

def _check_file(p):
    if not os.path.exists(p):
        print(f"\n✗  File not found: {p}")
        sys.exit(1)
    mt  = datetime.datetime.fromtimestamp(os.path.getmtime(p)).strftime("%Y-%m-%d %H:%M:%S")
    kb  = os.path.getsize(p) // 1024
    print(f"  {os.path.abspath(p)}")
    print(f"  Modified: {mt}  |  Size: {kb} KB")
    return mt
 
if TWO_FILES:
    print("\nMentor file :")
    mod_time = _check_file(MENTOR_FILE)
    print("Student file:")
    _check_file(STUDENT_FILE)
else:
    print("\nFile:")
    mod_time = _check_file(MENTOR_FILE)
print()

# ── 2. Embed bios ────────────────────────────────────────────────
try:
    from sentence_transformers import SentenceTransformer
    print("\nEmbedding bios...")
    embedder     = SentenceTransformer('all-MiniLM-L6-v2')
    mentor_embs  = embedder.encode([m["bio"] for m in mentors],  show_progress_bar=False)
    student_embs = embedder.encode([s["bio"] for s in students], show_progress_bar=False)
    use_embeddings = True
    print("Semantic embeddings enabled.")
except ImportError:
    use_embeddings = False
    mentor_embs = student_embs = None
    print("sentence-transformers not installed — using keyword matching only.")

# ── 3. Scoring helpers ───────────────────────────────────────────
def text_overlap(a, b):
    if not a or not b: return 0.0
    return sum(1 for x in a
               if any(x.lower() in y.lower() or y.lower() in x.lower()
                      for y in b)) / len(a)

def compute_subscores(mentor, student, m_emb=None, s_emb=None):
    """Return individual feature scores (for explanation) + total."""
    w = TIER_WEIGHTS[student["tier"]]
    bio_sim    = float(cosine_similarity([m_emb], [s_emb])[0][0]) \
                 if use_embeddings else text_overlap(mentor["skills"], student["goals"])
    issue_m    = text_overlap(student["issues"],    mentor["can_help_with"])
    interest_m = text_overlap(student["interests"], mentor["specialises_in"])
    skill_ov   = 1.0 if set(mentor["skills"]) & set(student["goals"]) else 0.0
    ind_m      = 1.0 if set(mentor["industries"]) & set(student["industries"]) else 0.0
    avail_m    = 1.0 if mentor["availability"] == student["availability"] else 0.0

    total = (w["issue_match"]    * issue_m
           + w["interest_match"] * interest_m
           + w["bio_similarity"] * bio_sim
           + w["skill_overlap"]  * skill_ov
           + w["industry_match"] * ind_m
           + w["avail_match"]    * avail_m)

    return {
        "bio_similarity":  round(bio_sim,   3),
        "issue_match":     round(issue_m,   3),
        "interest_match":  round(interest_m,3),
        "skill_overlap":   round(skill_ov,  3),
        "industry_match":  round(ind_m,     3),
        "avail_match":     round(avail_m,   3),
        "total":           total,
    }

def build_reason(student, mentor, subscores, ):
    """Build a human-readable explanation of why this match was made."""
    lines = []
    shared_skills = set(mentor["skills"]) & set(student["goals"])

    # Primary driver based on tier
    if subscores["issue_match"] > 0:
            lines.append(f"Mentor can address student's issues "
                         f"(overlap {subscores['issue_match']:.0%})")
    else:
            lines.append("No direct issue match found — best available support mentor")
    if subscores["interest_match"] > 0:
            lines.append(f"Mentor specialises in student's career interests "
                         f"(overlap {subscores['interest_match']:.0%})")
    else:
            lines.append("No direct interest match — best available mentor for aspirations")
    if subscores["bio_similarity"] >= 0.5:
            lines.append(f"Strong semantic bio match ({subscores['bio_similarity']:.2f})")
    elif subscores["bio_similarity"] >= 0.3:
            lines.append(f"Moderate semantic match ({subscores['bio_similarity']:.2f})")
    else:
            lines.append(f"Weak semantic match ({subscores['bio_similarity']:.2f}) — best available")

    # Secondary signals
    if shared_skills:
        lines.append(f"Shared skills: {', '.join(shared_skills)}")
    if subscores["industry_match"] == 1.0 and mentor["industries"]:
        lines.append(f"Same industry: {', '.join(mentor['industries'])}")
    if subscores["avail_match"] == 1.0:
        lines.append(f"Matching availability: {mentor['availability']}")
    
    return " | ".join(lines)

def build_unassigned_reason(student, mentors, score_matrix, N_STUDENTS, assignments):
    """Explain why a student wasn't assigned."""
    si = next(i for i, s in enumerate(students) if s["id"] == student["id"])
    best_j   = int(np.argmax(score_matrix[si]))
    best_sc  = score_matrix[si][best_j]
    best_m   = mentors[best_j]["name"]

    # Count how many students each mentor got
    roster_sizes = {}
    for s_idx, m_idx in assignments.items():
        roster_sizes[m_idx] = roster_sizes.get(m_idx, 0) + 1

    best_filled = roster_sizes.get(best_j, 0)
    best_cap    = mentor_caps[best_j]

    return (f"Best match was {best_m} (score {best_sc:.2f}/10) "
            f"but that mentor's capacity ({best_cap}) was already full "
            f"({best_filled} students assigned). "
            f"All other mentors also at capacity.")

# ── 4. Score matrix ──────────────────────────────────────────────
print("\nBuilding score matrix...")
raw        = np.zeros((N_STUDENTS, N_MENTORS))
subscores_ = [[None]*N_MENTORS for _ in range(N_STUDENTS)]

for i, (s, s_emb) in enumerate(zip(students,
                                    student_embs if use_embeddings
                                    else [None]*N_STUDENTS)):
    for j, (m, m_emb) in enumerate(zip(mentors,
                                        mentor_embs if use_embeddings
                                        else [None]*N_MENTORS)):
        sc = compute_subscores(m, s, m_emb, s_emb)
        raw[i][j]        = sc["total"]
        subscores_[i][j] = sc

lo, hi = raw.min(), raw.max()
score_matrix = 1 + 9 * (raw - lo) / (hi - lo + 1e-9)

# ── 5. Constrained assignment (per-mentor capacity) ───────────────
print("Solving assignment...")
# Expand: repeat mentor j exactly mentor_caps[j] times
col_to_mentor = []
expanded_cols = []
for j, (cap, col) in enumerate(zip(mentor_caps,
                                    score_matrix.T)):  # col = scores for mentor j
    for _ in range(cap):
        col_to_mentor.append(j)
        expanded_cols.append(col)

expanded = np.column_stack(expanded_cols)   # shape: (N_STUDENTS, sum_of_caps)
row_ind, col_ind = linear_sum_assignment(-expanded)
assignments  = {int(si): col_to_mentor[ci] for si, ci in zip(row_ind, col_ind)}
unassigned   = [si for si in range(N_STUDENTS) if si not in assignments]

print(f"Assigned   : {len(assignments)} / {N_STUDENTS}")
print(f"Unassigned : {len(unassigned)}")

# ── 6. Print results with reasons ────────────────────────────────
print(f"\n{'='*70}")
print("ASSIGNED STUDENTS")
print(f"{'='*70}")

all_scores = []
for tier in ["support", "standard", "interest"]:
    tier_s = [(si, assignments[si], score_matrix[si][assignments[si]])
               for si in range(N_STUDENTS)
               if students[si]["tier"] == tier and si in assignments]
    if not tier_s: continue
    scores = [sc for _, _, sc in tier_s]
    all_scores.extend(scores)
    emoji = {"support":"🔴","standard":"🟡","interest":"🟢"}[tier]
    print(f"\n{emoji} {tier.upper()} TIER  "
          f"({len(scores)} students | avg={np.mean(scores):.2f} | "
          f"min={min(scores):.2f} | max={max(scores):.2f})")
    print(f"  {'Student':<16} {'CGPA':>5}  {'Mentor':<22} {'Score':>6}  Reason")
    print(f"  {'-'*68}")
    for si, mi, sc in sorted(tier_s, key=lambda x: x[2], reverse=True):
        s, m = students[si], mentors[mi]
        sub  = subscores_[si][mi]
        reason = build_reason(s, m, sub,)
        print(f"  {s['name']:<16} {s['cgpa']:>5}  {m['name']:<22} {sc:>5.2f}/10")
        print(f"    → {reason}")

print(f"\n  Overall avg : {np.mean(all_scores):.2f}/10 "
      f"across {len(assignments)} students")

if unassigned:
    print(f"\n{'='*70}")
    print(f"UNASSIGNED STUDENTS  ({len(unassigned)} total)")
    print(f"{'='*70}")
    print(f"  {'Student':<16} {'CGPA':>5}  {'Tier':<10}  Reason")
    print(f"  {'-'*68}")
    for si in unassigned:
        s      = students[si]
        reason = build_unassigned_reason(s, mentors, score_matrix,
                                         N_STUDENTS, assignments)
        print(f"  {s['name']:<16} {s['cgpa']:>5}  {s['tier']:<10}")
        print(f"    → {reason}")

if TWO_FILES:
    print(f"\n  Mentors : {os.path.abspath(MENTOR_FILE)}")
    print(f"  Students: {os.path.abspath(STUDENT_FILE)}  (modified {mod_time})")
else:
    print(f"\n  Source: {os.path.abspath(MENTOR_FILE)}  (modified {mod_time})")

unassigned_reasons = {
    si: build_unassigned_reason(students[si], mentors, score_matrix,
                                N_STUDENTS, assignments)
    for si in unassigned
}
assigned_reasons = {}

for si, mi in assignments.items():
    sub = subscores_[si][mi]

    assigned_reasons[si] = build_reason(
        students[si],
        mentors[mi],
        sub
    )        

# ───────────────────────────────────────────────────────────────
# MENTOR-WISE MENTEE SUMMARY
# ───────────────────────────────────────────────────────────────

from collections import Counter

print("\n" + "="*80)
print("MENTOR-WISE MENTEE SUMMARY")
print("="*80)

for mi, mentor in enumerate(mentors):

    assigned_students = [
        students[si]
        for si, m in assignments.items()
        if m == mi
    ]

    print(f"\n👨‍🏫 Mentor: {mentor['name']}")
    print(f"Track      : {mentor['track']}")
    print(f"Skills     : {', '.join(mentor['skills'])}")
    print(f"Mentees    : {len(assigned_students)}")

    if not assigned_students:
        print("No mentees assigned.")
        continue

    all_goals = []
    all_interests = []
    all_issues = []

    print("\nAssigned Students:")

    for s in assigned_students:

        all_goals.extend(s["goals"])
        all_interests.extend(s["interests"])
        all_issues.extend(s["issues"])

        print(f"  • {s['name']} (CGPA: {s['cgpa']}, Tier: {s['tier']})")

        if s["goals"]:
            print(f"      Goals     : {', '.join(s['goals'])}")

        if s["interests"]:
            print(f"      Interests : {', '.join(s['interests'])}")

        if s["issues"]:
            print(f"      Issues    : {', '.join(s['issues'])}")

    goal_summary = Counter(all_goals).most_common(5)
    interest_summary = Counter(all_interests).most_common(5)
    issue_summary = Counter(all_issues).most_common(5)

    print("\nSummary for Mentor")
    print("------------------")

    if goal_summary:
        print("Most common learning goals:")
        for g, c in goal_summary:
            print(f"   • {g} ({c})")

    if interest_summary:
        print("\nMost common career interests:")
        for g, c in interest_summary:
            print(f"   • {g} ({c})")

    if issue_summary:
        print("\nMost common student issues:")
        for g, c in issue_summary:
            print(f"   • {g} ({c})");    

# ───────────────────────────────────────────────────────────────
# MENTOR-WISE MENTEE SUMMARY
# ───────────────────────────────────────────────────────────────

from collections import Counter

print("\n" + "="*80)
print("MENTOR-WISE MENTEE SUMMARY")
print("="*80)

for mi, mentor in enumerate(mentors):

    assigned_students = [
        students[si]
        for si, m in assignments.items()
        if m == mi
    ]

    print(f"\n👨‍🏫 Mentor: {mentor['name']}")
    print(f"Track      : {mentor['track']}")
    print(f"Skills     : {', '.join(mentor['skills'])}")
    print(f"Mentees    : {len(assigned_students)}")

    if not assigned_students:
        print("No mentees assigned.")
        continue

    all_goals = []
    all_interests = []
    all_issues = []

    print("\nAssigned Students:")

    for s in assigned_students:

        all_goals.extend(s["goals"])
        all_interests.extend(s["interests"])
        all_issues.extend(s["issues"])

        print(f"  • {s['name']} (CGPA: {s['cgpa']}, Tier: {s['tier']})")

        if s["goals"]:
            print(f"      Goals     : {', '.join(s['goals'])}")

        if s["interests"]:
            print(f"      Interests : {', '.join(s['interests'])}")

        if s["issues"]:
            print(f"      Issues    : {', '.join(s['issues'])}")

    goal_summary = Counter(all_goals).most_common(5)
    interest_summary = Counter(all_interests).most_common(5)
    issue_summary = Counter(all_issues).most_common(5)

    print("\nSummary for Mentor")
    print("------------------")

    if goal_summary:
        print("Most common learning goals:")
        for g, c in goal_summary:
            print(f"   • {g} ({c})")

    if interest_summary:
        print("\nMost common career interests:")
        for g, c in interest_summary:
            print(f"   • {g} ({c})")

    if issue_summary:
        print("\nMost common student issues:")
        for g, c in issue_summary:
            print(f"   • {g} ({c})")

# ── 7. Export ─────────────────────────────────────────────────────
export_assignments(assignments, students, mentors, score_matrix,
                   out_path=args.out,
                   unassigned=unassigned,
                   unassigned_reasons=unassigned_reasons,
                   assigned_reasons=assigned_reasons)