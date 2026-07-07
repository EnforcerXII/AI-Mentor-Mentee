"""
schema_inspector.py — Discover, map, and load unknown data files
=================================================================
Works in three stages:

  Stage 1 — INSPECT
    Read whatever file exists and report what's in it.
    No assumptions about column names.

  Stage 2 — MAP
    to the required fields. Falls back to fuzzy matching
    if no API key is available.

  Stage 3 — LOAD
    Extract and normalise the mapped data into the
    standard format the matcher expects.

Supports: .xlsx, .csv, SQLite .db files
"""

import os, re, json, sqlite3
import pandas as pd
import numpy as np
from difflib import SequenceMatcher

# ─────────────────────────────────────────
# REQUIRED SCHEMA
# These are the fields the matcher needs.
# The inspector tries to find columns that
# map to each of these.
# ─────────────────────────────────────────

MENTOR_REQUIRED = {
    "id":               {"desc": "unique identifier for the mentor",                         "type": "str",   "required": True},
    "name":             {"desc": "full name of the mentor",                                  "type": "str",   "required": True},
    "bio":              {"desc": "free text biography or description of the mentor",         "type": "str",   "required": False},
    "skills":           {"desc": "skills, expertise, or competencies the mentor has",        "type": "list",  "required": True},
    "can_help_with":    {"desc": "problems, struggles, or issues the mentor can address",    "type": "list",  "required": False},
    "specialises_in":   {"desc": "advanced topics or specialisations the mentor offers",     "type": "list",  "required": False},
    "industries":       {"desc": "industry or sector the mentor works in",                   "type": "list",  "required": False},
    "availability":     {"desc": "when the mentor is available (weekends, evenings, etc.)",  "type": "str",   "required": False},
    "track":            {"desc": "domain or track such as data, product, engineering",       "type": "str",   "required": False},
}

STUDENT_REQUIRED = {
    "id":               {"desc": "unique identifier for the student",                        "type": "str",   "required": True},
    "name":             {"desc": "full name of the student",                                 "type": "str",   "required": True},
    "bio":              {"desc": "free text biography or description of the student",        "type": "str",   "required": False},
    "cgpa":             {"desc": "GPA, CGPA, or academic grade of the student",             "type": "float", "required": True},
    "goals":            {"desc": "skills or topics the student wants to learn",              "type": "list",  "required": False},
    "issues":           {"desc": "problems, challenges, or struggles the student faces",     "type": "list",  "required": False},
    "interests":        {"desc": "career aspirations or long-term interests",               "type": "list",  "required": False},
    "industries":       {"desc": "industry or sector the student is interested in",         "type": "list",  "required": False},
    "availability":     {"desc": "when the student is available (weekends, evenings, etc.)", "type": "str",   "required": False},
    "track":            {"desc": "domain or track such as data, product, engineering",       "type": "str",   "required": False},
}


# ═══════════════════════════════════════════════════════════════
# STAGE 1: INSPECT
# ═══════════════════════════════════════════════════════════════

def inspect_file(path: str) -> dict:
    """
    Read any supported file and return a full inspection report:
    sheets/tables found, columns, dtypes, sample values, nulls.
    No assumptions about what columns mean.
    """
    ext = os.path.splitext(path)[1].lower()
    report = {"path": path, "format": ext, "sheets": {}}

    if ext in (".xlsx", ".xlsm", ".xls"):
        xls = pd.ExcelFile(path)
        for sheet in xls.sheet_names:
            df = pd.read_excel(path, sheet_name=sheet, nrows=500)
            report["sheets"][sheet] = _inspect_df(df, sheet)

    elif ext == ".csv":
        df = pd.read_csv(path, nrows=500)
        report["sheets"]["(csv)"] = _inspect_df(df, path)

    elif ext == ".db":
        conn = sqlite3.connect(path)
        tables = pd.read_sql(
            "SELECT name FROM sqlite_master WHERE type='table'", conn
        )["name"].tolist()
        for table in tables:
            df = pd.read_sql(f"SELECT * FROM [{table}] LIMIT 500", conn)
            report["sheets"][table] = _inspect_df(df, table)
        conn.close()

    else:
        raise ValueError(f"Unsupported format: {ext}. Use .xlsx, .csv, or .db")

    return report


def _inspect_df(df: pd.DataFrame, name: str) -> dict:
    """Build per-column stats for one sheet/table."""
    info = {
        "name":    name,
        "rows":    len(df),
        "columns": {}
    }
    for col in df.columns:
        series  = df[col].dropna()
        samples = series.head(3).astype(str).tolist()
        info["columns"][col] = {
            "dtype":       str(df[col].dtype),
            "null_pct":    round(df[col].isna().mean() * 100, 1),
            "unique":      int(df[col].nunique()),
            "samples":     samples,
            "looks_like":  _guess_semantic(col, samples),
        }
    return info


def _guess_semantic(col_name: str, samples: list) -> str:
    """
    Heuristic: what does this column probably contain?
    Used to give the AI mapper more context.
    """
    name_lower = col_name.lower()
    sample_str = " ".join(samples).lower()

    if any(k in name_lower for k in ["id","code","roll","no","number","num"]):
        return "identifier"
    if any(k in name_lower for k in ["name","full name","student name","mentor name"]):
        return "name"
    if any(k in name_lower for k in ["bio","about","description","profile","summary"]):
        return "biography"
    if any(k in name_lower for k in ["gpa","cgpa","grade","marks","score","point"]):
        return "academic_score"
    if any(k in name_lower for k in ["skill","expert","competen","proficien","technolog"]):
        return "skills_list"
    if any(k in name_lower for k in ["goal","learn","want to","interest","aspir","career"]):
        return "goals_or_interests"
    if any(k in name_lower for k in ["issue","challenge","problem","struggle","help","weak"]):
        return "issues_or_struggles"
    if any(k in name_lower for k in ["industry","sector","domain","field","area","track"]):
        return "domain_or_industry"
    if any(k in name_lower for k in ["avail","slot","time","schedule","when"]):
        return "availability"
    if any(k in name_lower for k in ["email","mail","phone","mobile","contact","dept","batch","gender","branch"]):
        return "metadata_irrelevant"
    # Check sample values for comma-separated lists
    if samples and "," in samples[0]:
        return "comma_separated_list"
    return "unknown"


def print_inspection(report: dict):
    """Pretty-print the inspection report."""
    print(f"\n{'═'*60}")
    print(f"FILE INSPECTION: {report['path']}")
    print(f"{'═'*60}")
    for sheet_name, sheet in report["sheets"].items():
        print(f"\n  Sheet / Table : {sheet_name}  ({sheet['rows']} rows)")
        print(f"  {'Column':<28} {'Type':<10} {'Nulls':>6}  {'Looks like':<24}  Samples")
        print(f"  {'-'*90}")
        for col, info in sheet["columns"].items():
            samples = " | ".join(info["samples"][:2])[:38]
            print(f"  {col:<28} {info['dtype']:<10} {info['null_pct']:>5}%  "
                  f"{info['looks_like']:<24}  {samples}")


# ═══════════════════════════════════════════════════════════════
# STAGE 2: MAP
# Two strategies — or fuzzy fallback
# ═══════════════════════════════════════════════════════════════

def map_columns(report: dict,
                mentor_sheet: str = None,
                student_sheet: str = None,
                student_report : dict = None
                ) -> dict:
    """
    Map discovered columns → required schema fields.
    Returns:
      {
        "mentor_sheet": "Mentors",
        "student_sheet": "Students",
        "mentor_map":  {"id": "ID", "name": "Full Name", ...},
        "student_map": {"id": "Roll No", "cgpa": "GPA",  ...},
        "mentor_missing":  ["can_help_with"],   # required fields not found
        "student_missing": [],
      }
    """
    m_report = report
    s_report = student_report if student_report is not None else report
 
    m_sheets = list(m_report["sheets"].keys())
    s_sheets = list(s_report["sheets"].keys())
 
    # Auto-detect which sheet is mentors and which is students
    mentor_sheet  = mentor_sheet  or _detect_sheet(m_sheets, ["mentor","faculty","teacher","staff","guide"])
    student_sheet = student_sheet or _detect_sheet(s_sheets, ["student","learner","mentee","trainee","participant"])
 
    if not mentor_sheet or mentor_sheet not in m_report["sheets"]:
        raise ValueError(f"Could not identify mentor sheet. Available: {m_sheets}. "
                         f"Pass mentor_sheet='SheetName' explicitly.")
    if not student_sheet or student_sheet not in s_report["sheets"]:
        raise ValueError(f"Could not identify student sheet. Available: {s_sheets}. "
                         f"Pass student_sheet='SheetName' explicitly.")

    mentor_cols  = list(report["sheets"][mentor_sheet]["columns"].keys())
    student_cols = list(report["sheets"][student_sheet]["columns"].keys())
    mentor_info  = report["sheets"][mentor_sheet]["columns"]
    student_info = report["sheets"][student_sheet]["columns"]

    mentor_map  = _map_fuzzy(mentor_cols,  mentor_info,  MENTOR_REQUIRED)
    student_map = _map_fuzzy(student_cols, student_info, STUDENT_REQUIRED)
    method = "fuzzy matching"

    # Find missing required fields
    mentor_missing  = [f for f, meta in MENTOR_REQUIRED.items()
                       if meta["required"] and f not in mentor_map]
    student_missing = [f for f, meta in STUDENT_REQUIRED.items()
                       if meta["required"] and f not in student_map]

    result = {
        "mentor_sheet":   mentor_sheet,
        "student_sheet":  student_sheet,
        "mentor_report":  m_report,
        "student_report": s_report,
        "mentor_map":     mentor_map,
        "student_map":    student_map,
        "mentor_missing": mentor_missing,
        "student_missing":student_missing,
        "method":         method,
    }
    return result

def _detect_sheet(sheets: list, keywords: list) -> str | None:
    for sheet in sheets:
        if any(kw in sheet.lower() for kw in keywords):
            return sheet
    return sheets[0] if sheets else None


def _map_fuzzy(columns: list, col_info: dict, required_schema: dict) -> dict:
    """
    Fallback: fuzzy string match + semantic-hint match.
    Maps each required field to the highest-scoring source column.
    """
    # Keyword hints per required field
    FIELD_HINTS = {
        "id":             ["id","code","roll","no","number","num","ref"],
        "name":           ["name","full name","student","mentor"],
        "bio":            ["bio","about","description","profile","summary","intro"],
        "cgpa":           ["cgpa","gpa","grade","marks","score","point","academic"],
        "skills":         ["skill","expert","competen","proficien","technolog","expertise"],
        "can_help_with":  ["help","issue","problem","struggle","weakness","support","remedial"],
        "specialises_in": ["speciali","advanced","topic","focus","area"],
        "goals":          ["goal","learn","objective","want","target","aim"],
        "issues":         ["issue","challenge","problem","struggle","weak","difficult"],
        "interests":      ["interest","aspir","career","passion","ambition","future"],
        "industries":     ["industry","sector","domain","field"],
        "availability":   ["avail","slot","time","schedule","when","free"],
        "track":          ["track","domain","field","area","category","type","discipline"],
    }

    used_cols = set()
    mapping   = {}

    for field, meta in required_schema.items():
        hints     = FIELD_HINTS.get(field, [field])
        best_col  = None
        best_score = 0.0

        for col in columns:
            if col in used_cols:
                continue
            col_lower  = col.lower()
            sem_hint   = col_info[col]["looks_like"]

            # Score 1: direct string similarity
            str_score  = max(SequenceMatcher(None, field.lower(), col_lower).ratio(),
                             SequenceMatcher(None, meta["desc"].lower(), col_lower).ratio())

            # Score 2: keyword hint match
            hint_score = max((1.0 if h in col_lower else 0.0) for h in hints)

            # Score 3: semantic hint match
            sem_score  = 0.5 if sem_hint not in ("metadata_irrelevant", "unknown") else 0.0
            if field == "cgpa"       and sem_hint == "academic_score":        sem_score = 1.0
            if field in ("id",)      and sem_hint == "identifier":            sem_score = 0.9
            if field == "name"       and sem_hint == "name":                  sem_score = 0.9
            if field == "bio"        and sem_hint == "biography":             sem_score = 0.9
            if field == "skills"     and sem_hint in ("skills_list","comma_separated_list"): sem_score = 0.8
            if field == "availability" and sem_hint == "availability":        sem_score = 0.9

            total = str_score * 0.3 + hint_score * 0.5 + sem_score * 0.2

            if total > best_score and total > 0.25:
                best_score = total
                best_col   = col

        if best_col:
            mapping[field]  = best_col
            used_cols.add(best_col)

    return mapping


def print_mapping(mapping: dict):
    """Pretty-print the column mapping result."""
    print(f"\n{'═'*60}")
    print(f"COLUMN MAPPING  (method: {mapping['method']})")
    print(f"{'═'*60}")
 
    for role, schema, sheet_key, map_key, miss_key, rep_key in [
        ("MENTORS",  MENTOR_REQUIRED,  "mentor_sheet",  "mentor_map",  "mentor_missing",  "mentor_report"),
        ("STUDENTS", STUDENT_REQUIRED, "student_sheet", "student_map", "student_missing", "student_report"),
    ]:
        src_path = mapping[rep_key].get("path","")
        src_label = f"{mapping[sheet_key]} ({src_path})" if src_path else mapping[sheet_key]
        print(f"\n  {role}  (sheet: {src_label})")
        print(f"  {'Required field':<20} {'Source column':<28} {'Status'}")
        print(f"  {'-'*65}")
        for field, meta in schema.items():
            src_col = mapping[map_key].get(field)
            req     = "required" if meta["required"] else "optional"
            if src_col:
                status = "✓ mapped"
            elif meta["required"]:
                status = "✗ MISSING (required)"
            else:
                status = "– not found (optional)"
            print(f"  {field:<20} {(src_col or '—'):<28} {status}")
 
    if mapping["mentor_missing"] or mapping["student_missing"]:
        print(f"\n  ⚠  Missing required fields:")
        for f in mapping["mentor_missing"]:
            print(f"     Mentors  → {f}")
        for f in mapping["student_missing"]:
            print(f"     Students → {f}")
 


# ═══════════════════════════════════════════════════════════════
# STAGE 3: LOAD
# Use the mapping to extract + normalise data
# ═══════════════════════════════════════════════════════════════

CGPA_SUPPORT_BELOW  = 6.0
CGPA_INTEREST_ABOVE = 8.0

def _parse_list(value) -> list:
    if pd.isna(value) or str(value).strip() == "":
        return []
    return [v.strip() for v in str(value).split(",") if v.strip()]

def _assign_tier(cgpa: float) -> str:
    if cgpa < CGPA_SUPPORT_BELOW:   return "support"
    if cgpa >= CGPA_INTEREST_ABOVE: return "interest"
    return "standard"

def load_from_mapping(path: str, mapping: dict) -> tuple[list, list]:
    """
    Use the discovered column mapping to extract and normalise
    mentor and student data into the standard matcher format.
    Handles both single-file (one path) and two-file (separate paths
    stored in mapping["mentor_report"]["path"] / ["student_report"]["path"]).
    """
    # Resolve the actual file path for each half independently.
    # When two separate files are used, the mapping stores each file's
    # own report (with its path). Fall back to the single `path` arg
    # for backward compatibility with single-file usage.
    mentor_path  = mapping.get("mentor_report",  {}).get("path") or path
    student_path = mapping.get("student_report", {}).get("path") or path
 
    def _reader(file_path, sheet_name):
        ext = os.path.splitext(file_path)[1].lower()
        if ext in (".xlsx", ".xlsm", ".xls"):
            return pd.read_excel(file_path, sheet_name=sheet_name)
        elif ext == ".csv":
            return pd.read_csv(file_path)
        elif ext == ".db":
            conn = sqlite3.connect(file_path)
            df = pd.read_sql(f"SELECT * FROM [{sheet_name}]", conn)
            conn.close()
            return df
        raise ValueError(f"Unsupported format: {ext}")
 
    def get(row, col_map, field, default=None):
        col = col_map.get(field)
        if col is None or col not in row.index:
            return default
        val = row[col]
        return default if pd.isna(val) else val
 
    # ── MENTORS ──────────────────────────────────────────────────
    df_m   = _reader(mentor_path, mapping["mentor_sheet"])
    m_map  = mapping["mentor_map"]
 
    # Detect per-mentor capacity column (Max_Mentees, max_students, etc.)
    max_col = next(
        (c for c in df_m.columns
         if "max" in c.lower() and any(k in c.lower()
            for k in ["mentee","student","capacity","load","limit"])),
        None
    )
 
    mentors = []
    for i, row in df_m.iterrows():
        # Build bio from mapped col, or synthesise from whatever columns exist
        bio = get(row, m_map, "bio", "")
        if not bio:
            parts = []
            name = get(row, m_map, "name", "")
            if name: parts.append(f"{name} is a mentor")
            skills = get(row, m_map, "skills", "")
            if skills: parts.append(f"with expertise in {skills}")
            spec = get(row, m_map, "specialises_in", "")
            if spec: parts.append(f"focusing on {spec}")
            for col in df_m.columns:
                if "dept" in col.lower() or "department" in col.lower():
                    val = row.get(col, "")
                    if val and not pd.isna(val): parts.append(f"in the {val} department")
                    break
            bio = ". ".join(parts) if parts else "Experienced mentor."
 
        mentors.append({
            "id":             str(get(row, m_map, "id",           f"M{i:03d}")),
            "name":           str(get(row, m_map, "name",         f"Mentor {i}")),
            "bio":            str(bio),
            "skills":         _parse_list(get(row, m_map, "skills",         "")),
            "can_help_with":  _parse_list(get(row, m_map, "can_help_with",  "")),
            "specialises_in": _parse_list(get(row, m_map, "specialises_in", "")),
            "industries":     _parse_list(get(row, m_map, "industries",     "")),
            "availability":   str(get(row, m_map, "availability", "weekends")).strip().lower(),
            "track":          str(get(row, m_map, "track",        "general")).strip().lower(),
            "max_mentees":    int(row[max_col]) if max_col and not pd.isna(row[max_col]) else None,
        })
 
    # ── STUDENTS ─────────────────────────────────────────────────
    df_s    = _reader(student_path, mapping["student_sheet"])
    s_map   = mapping["student_map"]
    students = []
    for i, row in df_s.iterrows():
        # Build bio from whatever descriptive columns exist
        bio = get(row, s_map, "bio", "")
        if not bio:
            parts = []
            name = get(row, s_map, "name", "")
            if name: parts.append(f"{name} is a student")
            for col in df_s.columns:
                if "dept" in col.lower() or "department" in col.lower():
                    val = row.get(col, "")
                    if val and not pd.isna(val): parts.append(f"in {val}")
                    break
            interests = get(row, s_map, "interests", "")
            if interests: parts.append(f"interested in {interests}")
            # Check for aspiration column directly
            for col in df_s.columns:
                if "aspir" in col.lower() or "future" in col.lower():
                    val = row.get(col, "")
                    if val and not pd.isna(val): parts.append(f"aspiring to become {val}")
                    break
            issues = get(row, s_map, "issues", "")
            if issues: parts.append(f"facing challenges with {issues}")
            bio = ". ".join(parts) if parts else "Student seeking mentorship."
 
        # goals: use mapped col; if missing, fall back to interests + aspiration
        goals_raw = get(row, s_map, "goals", "")
        if not goals_raw:
            fallback = []
            iv = get(row, s_map, "interests", "")
            if iv: fallback.append(str(iv))
            for col in df_s.columns:
                if "aspir" in col.lower() or "future" in col.lower():
                    val = row.get(col, "")
                    if val and not pd.isna(val): fallback.append(str(val))
                    break
            goals_raw = ", ".join(fallback)
 
        cgpa = float(get(row, s_map, "cgpa", 7.0))
        students.append({
            "id":           str(get(row, s_map, "id",           f"S{i:03d}")),
            "name":         str(get(row, s_map, "name",         f"Student {i}")),
            "bio":          str(bio),
            "cgpa":         cgpa,
            "tier":         _assign_tier(cgpa),
            "goals":        _parse_list(goals_raw),
            "issues":       _parse_list(get(row, s_map, "issues",       "")),
            "interests":    _parse_list(get(row, s_map, "interests",    "")),
            "industries":   _parse_list(get(row, s_map, "industries",   "")),
            "availability": str(get(row, s_map, "availability", "weekends")).strip().lower(),
            "track":        str(get(row, s_map, "track",        "general")).strip().lower(),
        })
 
    tiers = {t: sum(1 for s in students if s["tier"]==t)
             for t in ["support","standard","interest"]}
    print(f"\nLoaded {len(mentors)} mentors, {len(students)} students")
    print(f"Tiers → support: {tiers['support']}  "
          f"standard: {tiers['standard']}  interest: {tiers['interest']}")
    return mentors, students
# ═══════════════════════════════════════════════════════════════
# PUBLIC API — single entry point
# ═══════════════════════════════════════════════════════════════

def inspect_and_load(path: str,
                     mentor_sheet: str  = None,
                     student_sheet: str = None,
                     verbose: bool      = True,
                     student_path: str  = None) -> tuple[list, list, dict]:
    """
    Full pipeline: inspect → map → load.
 
    Parameters
    ----------
    path          : path to mentor file (or single combined file)
    student_path  : path to student file when separate from mentor file.
                    If None, students are expected in the same file as mentors.
    mentor_sheet  : sheet/table name for mentors (auto-detected if None)
    student_sheet : sheet/table name for students (auto-detected if None)
    use_ai        : use Claude API for column mapping (falls back to fuzzy)
    verbose       : print inspection and mapping reports
 
    Returns
    -------
    mentors   : list of dicts (standard format)
    students  : list of dicts (standard format)
    mapping   : the column mapping dict (for inspection/debugging)
    """
    two_files = student_path is not None and student_path != path
 
    print(f"\nInspecting mentor file : {path}")
    mentor_report = inspect_file(path)
    mentor_report["path"] = path          # store path for load_from_mapping
    if verbose:
        print_inspection(mentor_report)
 
    if two_files:
        print(f"\nInspecting student file: {student_path}")
        student_report = inspect_file(student_path)
        student_report["path"] = student_path
        if verbose:
            print_inspection(student_report)
    else:
        student_report = None
 
    print(f"\nMapping columns...")
    mapping = map_columns(mentor_report,
                          mentor_sheet=mentor_sheet,
                          student_sheet=student_sheet,
                          student_report=student_report)
    if verbose:
        print_mapping(mapping)
 
    if mapping["mentor_missing"] or mapping["student_missing"]:
        missing = mapping["mentor_missing"] + mapping["student_missing"]
        raise ValueError(
            f"Cannot proceed — required fields not found: {missing}\n"
            f"Either add these columns to your file, or pass "
            f"mentor_sheet=/student_sheet= to point to the right sheet."
        )
 
    mentors, students = load_from_mapping(path, mapping)
    return mentors, students, mapping


# ═══════════════════════════════════════════════════════════════
# QUICK TEST
# ═══════════════════════════════════════════════════════════════

if __name__ == "__main__":
    mentors, students, mapping = inspect_and_load(
        "unknown_format.xlsx",
        verbose=True,
    )

    print(f"\n{'═'*60}")
    print("LOADED DATA SAMPLE")
    print(f"{'═'*60}")
    m = mentors[0]
    s = students[0]
    print(f"\nMentor 0:  {m['name']}")
    print(f"  skills       : {m['skills']}")
    print(f"  can_help_with: {m['can_help_with']}")
    print(f"  industries   : {m['industries']}")

    print(f"\nStudent 0: {s['name']}")
    print(f"  cgpa    : {s['cgpa']}  →  tier: {s['tier']}")
    print(f"  goals   : {s['goals']}")
    print(f"  issues  : {s['issues']}")
