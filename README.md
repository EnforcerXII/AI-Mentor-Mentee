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
