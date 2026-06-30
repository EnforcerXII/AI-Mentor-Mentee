"""
server.py — Flask API that wraps the existing matcher pipeline
=============================================================
Run:  python server.py
Then open:  http://localhost:5000

Endpoints:
  POST /run      — upload file(s), run matcher, return assignments.xlsx
  GET  /status   — health check
"""

import os, sys, shutil, json, tempfile, traceback
from flask import Flask, request, jsonify, send_file, after_this_request
import numpy as np
from scipy.optimize import linear_sum_assignment
from sklearn.metrics.pairwise import cosine_similarity

# ── Always import fresh (same cache-bust as run_matcher) ─────────
_cache = os.path.join(os.path.dirname(__file__), "__pycache__")
if os.path.exists(_cache):
    shutil.rmtree(_cache)
for mod in list(sys.modules):
    if mod in ("schema_inspector", "data_loader"):
        del sys.modules[mod]

from schema_inspector import inspect_and_load
from data_loader import export_assignments

app = Flask(__name__)
import shutil

OUTPUT_DIR = os.path.join(os.path.dirname(__file__), "outputs")
os.makedirs(OUTPUT_DIR, exist_ok=True)

LATEST_FILE = os.path.join(OUTPUT_DIR, "assignments.xlsx")

@app.after_request
def add_cors(response):
    response.headers["Access-Control-Allow-Origin"]  = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

@app.route("/")
def index():
    return send_file("ui2.html")

@app.route("/dashboard")
def dashboard():
    return send_file("ui.html")

@app.route("/run",     methods=["OPTIONS"])
@app.route("/preview", methods=["OPTIONS"])
@app.route("/status",  methods=["OPTIONS"])
def handle_options():
    return "", 204

# ── Tier weights (same as run_matcher.py) ────────────────────────
TIER_WEIGHTS = {
    "support":  {"issue_match":5.0,"interest_match":0.5,"bio_similarity":2.0,
                 "skill_overlap":2.0,"industry_match":0.5,"avail_match":1.5},
    "standard": {"issue_match":1.0,"interest_match":1.0,"bio_similarity":4.0,
                 "skill_overlap":3.0,"industry_match":1.5,"avail_match":1.0},
    "interest": {"issue_match":0.2,"interest_match":5.0,"bio_similarity":3.0,
                 "skill_overlap":2.5,"industry_match":2.0,"avail_match":0.5},
}

def text_overlap(a, b):
    if not a or not b: return 0.0
    return sum(1 for x in a
               if any(x.lower() in y.lower() or y.lower() in x.lower()
                      for y in b)) / len(a)

def compute_subscores(mentor, student, m_emb=None, s_emb=None):
    w = TIER_WEIGHTS[student["tier"]]
    bio_sim = float(cosine_similarity([m_emb], [s_emb])[0][0]) \
              if m_emb is not None else \
              text_overlap(mentor["skills"], student["goals"])
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
           + w["avail_match"]    * avail_m
           )
    return {"bio_similarity":round(bio_sim,3),"issue_match":round(issue_m,3),
            "interest_match":round(interest_m,3),"skill_overlap":round(skill_ov,3),
            "industry_match":round(ind_m,3),"avail_match":round(avail_m,3),
            "total":total}

def build_reason(student, mentor, sub, tier):
    lines = []
    shared = set(mentor["skills"]) & set(student["goals"])
    if tier == "support":
        if sub["issue_match"] > 0:
            lines.append(f"Mentor addresses issues ({sub['issue_match']:.0%})")
        else:
            lines.append("Best available support mentor")
    elif tier == "interest":
        if sub["interest_match"] > 0:
            lines.append(f"Mentor specialises in student's interests ({sub['interest_match']:.0%})")
        else:
            lines.append("Best available mentor for aspirations")
    else:
        if sub["bio_similarity"] >= 0.5:
            lines.append(f"Strong semantic match ({sub['bio_similarity']:.2f})")
        elif sub["bio_similarity"] >= 0.3:
            lines.append(f"Moderate semantic match ({sub['bio_similarity']:.2f})")
        else:
            lines.append(f"Best available match ({sub['bio_similarity']:.2f})")
    if shared:
        lines.append(f"Shared skills: {', '.join(shared)}")
    if sub["industry_match"] == 1.0 and mentor["industries"]:
        lines.append(f"Same industry: {', '.join(mentor['industries'])}")
    if sub["avail_match"] == 1.0:
        lines.append(f"Matching availability: {mentor['availability']}")

    return " | ".join(lines)

def build_unassigned_reason(si, mentors, score_matrix, assignments):
    best_j  = int(np.argmax(score_matrix[si]))
    best_sc = score_matrix[si][best_j]
    best_m  = mentors[best_j]["name"]
    filled  = sum(1 for v in assignments.values() if v == best_j)
    return (f"Best match was {best_m} (score {best_sc:.2f}/10) "
            f"but capacity was full ({filled} already assigned).")

def run_pipeline(mentor_path, student_path, capacity_override):
    # 1. Load
    mentors, students, mapping = inspect_and_load(
        path=mentor_path,
        student_path=student_path if student_path != mentor_path else None,
        verbose=False,
    )
    N_M, N_S = len(mentors), len(students)

    # 2. Embed (optional)
    try:
        from sentence_transformers import SentenceTransformer
        emb = SentenceTransformer("all-MiniLM-L6-v2")
        m_embs = emb.encode([m["bio"] for m in mentors], show_progress_bar=False)
        s_embs = emb.encode([s["bio"] for s in students], show_progress_bar=False)
        use_emb = True
    except Exception:
        m_embs = s_embs = [None]*max(N_M,N_S)
        use_emb = False

    # 3. Score matrix
    DEFAULT_CAP = capacity_override or 10
    mentor_caps = [int(m.get("max_mentees") or DEFAULT_CAP) for m in mentors]
    raw = np.zeros((N_S, N_M))
    subs = [[None]*N_M for _ in range(N_S)]
    for i, (s, se) in enumerate(zip(students, s_embs if use_emb else [None]*N_S)):
        for j, (m, me) in enumerate(zip(mentors, m_embs if use_emb else [None]*N_M)):
            sc = compute_subscores(m, s, me, se)
            raw[i][j] = sc["total"]
            subs[i][j] = sc
    lo, hi = raw.min(), raw.max()
    score_matrix = 1 + 9*(raw-lo)/(hi-lo+1e-9)

    # 4. Constrained assignment
    col_to_mentor, expanded_cols = [], []
    for j, cap in enumerate(mentor_caps):
        for _ in range(cap):
            col_to_mentor.append(j)
            expanded_cols.append(score_matrix.T[j])
    expanded = np.column_stack(expanded_cols)
    ri, ci = linear_sum_assignment(-expanded)
    assignments = {int(si): col_to_mentor[c] for si, c in zip(ri, ci)}
    unassigned  = [si for si in range(N_S) if si not in assignments]

    # 5. Build reason strings
    ua_reasons = {si: build_unassigned_reason(si, mentors, score_matrix, assignments)
                  for si in unassigned}

    # 6. Export to temp file
    tmp = tempfile.NamedTemporaryFile(suffix=".xlsx", delete=False)
    tmp.close()
    export_assignments(assignments, students, mentors, score_matrix,
                       out_path=tmp.name,
                       unassigned=unassigned,
                       unassigned_reasons=ua_reasons)

    # 7. Build summary for the UI
    tier_counts = {t: sum(1 for s in students if s["tier"]==t)
                   for t in ["support","standard","interest"]}
    scores = [float(score_matrix[si][assignments[si]]) for si in assignments]
    summary = {
        "total":      N_S,
        "assigned":   len(assignments),
        "unassigned": len(unassigned),
        "mentors":    N_M,
        "avg_score":  round(sum(scores)/len(scores), 2) if scores else 0,
        "tiers":      tier_counts,
        "used_embeddings": use_emb,
        "mentor_caps": {mentors[j]["name"]: mentor_caps[j] for j in range(N_M)},
    }
    return tmp.name, summary

# ── Routes ───────────────────────────────────────────────────────

@app.route("/status")
def status():
    return jsonify({"ok": True, "message": "Matcher server is running."})

@app.route("/run", methods=["POST"])
def run():
    try:
        mentor_file  = request.files.get("mentor_file")
        student_file = request.files.get("student_file")   # optional

        if not mentor_file:
            return jsonify({"error": "No file uploaded. Send mentor_file (and optionally student_file)."}), 400

        capacity = request.form.get("capacity", type=int)

        # Save uploaded file(s) to temp directory
        tmp_dir = tempfile.mkdtemp()
        mentor_path = os.path.join(tmp_dir, mentor_file.filename)
        mentor_file.save(mentor_path)

        if student_file and student_file.filename:
            student_path = os.path.join(tmp_dir, student_file.filename)
            student_file.save(student_path)
        else:
            student_path = mentor_path   # same file, two sheets

        out_path, summary = run_pipeline(mentor_path, student_path, capacity)
# Save a permanent copy for the dashboard
        shutil.copy2(out_path, LATEST_FILE)
        print("Latest file saved to:", LATEST_FILE)

        # Clean up temp input files
        shutil.rmtree(tmp_dir, ignore_errors=True)

        return send_file(
            out_path,
            as_attachment=True,
            download_name="assignments.xlsx",
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500

@app.route("/latest")
def latest():

    if os.path.exists(LATEST_FILE):
        return send_file(
            LATEST_FILE,
            mimetype="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        )

    return "No results yet", 404

@app.route("/xlsx.full.min.js")
def xlsx_library():
    return send_file("xlsx.full.min.js")

@app.route("/preview", methods=["POST"])
def preview():
    """Same as /run but returns JSON summary instead of the file.
       The UI calls this first to show stats, then /run to download."""
    try:
        mentor_file  = request.files.get("mentor_file")
        student_file = request.files.get("student_file")

        if not mentor_file:
            return jsonify({"error": "No file uploaded."}), 400

        capacity = request.form.get("capacity", type=int)
        tmp_dir  = tempfile.mkdtemp()
        mentor_path = os.path.join(tmp_dir, mentor_file.filename)
        mentor_file.save(mentor_path)

        if student_file and student_file.filename:
            student_path = os.path.join(tmp_dir, student_file.filename)
            student_file.save(student_path)
        else:
            student_path = mentor_path

        out_path, summary = run_pipeline(mentor_path, student_path, capacity)
        os.unlink(out_path)
        shutil.rmtree(tmp_dir, ignore_errors=True)

        return jsonify(summary)

    except Exception as e:
        traceback.print_exc()
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    print("\n Mentorship Matcher Server")
    print("══════════════════════════")
    print(" Open in browser → http://localhost:5000")
    print(" (Do NOT open ui2.html directly — use the URL above)")
    print(" Press Ctrl+C to stop\n")
    app.run(debug=False, port=5000)
