# AI Mentor–Mentee Matching System

An AI-powered mentor–mentee matching system that automatically maps unknown datasets, analyzes mentor and student profiles, and generates optimal assignments using semantic similarity and the Hungarian Algorithm.

## Features
- Automatic schema detection and column mapping
- Supports Excel, CSV, and SQLite datasets
- AI-powered semantic matching using Sentence Transformers
- Tier-based matching (Support, Standard, Interest)
- Capacity-aware mentor assignment
- Match explanations for every assignment
- Excel report generation with mentor summaries

## Tech Stack
- Python
- Pandas
- NumPy
- Scikit-learn
- SciPy
- Sentence Transformers
- OpenPyXL
- SQLite

## Installation

```bash
pip install pandas numpy scipy scikit-learn sentence-transformers openpyxl
```

## Usage

```bash
python run_matcher.py --path mentor_mentee_dataset.xlsx
```

## Output
- Optimized mentor–mentee assignments
- Match scores and explanations
- Mentor-wise summary
- Formatted Excel report (`assignments.xlsx`)

## Future Enhancements
- Streamlit dashboard
- Feedback-based matching
- Email notifications
- REST API support
- Cloud deployment

## EMERGENT VERSION OF THE APP
https://ui-builder-111.preview.emergentagent.com/?utm_source=share

### AI-Powered Mentor-Mentee Matching System using emergent

* Built an intelligent web application using **Emergent** to automate the mentor allocation process.
* Supports **Excel file uploads** for mentor and student datasets.
* Automatically **detects dataset schemas** and maps columns using AI.
* Matches students with mentors based on **skills, interests, career goals, CGPA, experience, availability, and semantic similarity**.
* Ensures **balanced mentor assignments** by respecting mentor capacity constraints.
* Displays **real-time matching statistics** and compatibility scores through an intuitive interface.
* Allows users to **download mentor assignment reports** in Excel format.
* Reduces manual effort, improves matching accuracy, and provides a scalable solution for educational institutions and mentoring programs.

