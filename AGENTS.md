# AGENTS.md — Context for AI coding agents working on Symptom2Cure

Read this file completely before writing any code. It is the shared brief for every AI model
(Claude, GPT/Codex, Gemini, Cursor, Copilot, etc.) working on this repository.

## 1. What this project is

Symptom2Cure is a browser-based **homeopathic repertorization and reference tool** built as a
university semester project and now being expanded for a university MakerFest. Users (BHMS
students, interns, beginner homeopaths) pick symptoms ("rubrics") from classical repertories,
and the engine ranks remedies by how well they cover those symptoms. It is a **reference and
study tool, not a diagnostic or prescribing system**; that disclaimer must stay visible in the UI.

Product inspiration for the expansion: Similia (similia.io), especially its multi-repertory
search and its Materia Medica library (`/app/mm`).

**Hard deadline:** MakerFest, first week of December 2026. Feature freeze **Thu 26 Nov 2026**;
after that, bug fixes only. Domain decisions (remedy aliases, rubric mappings) are made by the
team's **BHMS doctor** — agents prepare review files, never decide these themselves.

## 2. Documents — read in this order

| Doc | Use it for |
|---|---|
| `AGENTS.md` (this file) | Current state, conventions, gotchas, how to work |
| `Symptom2Cure — Expansion Implementation Plan v2.md` | **The plan: phases, task IDs, acceptance criteria.** Pick tasks from here. |
| `Symptom2Cure — Data Source Specification.md` | Exact HTML structure of every homeoint.org source and how to parse it |
| `Symptom2Cure — Rules Document.md` | Engineering rules (layering, TypeScript, API versioning, validation) |
| `Symptom2Cure — Architecture Document.md` | Original architecture baseline |
| `Symptom2Cure — Product Requirements Document v1.1.md` | Original product scope |
| `Symptom2Cure — Design System & UI-UX Guidelines.md` | UX principles (see §6 below for which colour tokens win) |

If the plan and an older doc disagree, **the Expansion Plan v2 wins** for anything it covers.

## 3. Current state of the code (as of 29 Oct 2026)

```
server.py        FastAPI app — all routes in one file, no /api/v1 prefix yet
engine.py        HomeopathicEngine — pandas, CSV fallback or psycopg2 to Supabase
app.py           Streamlit prototype UI (legacy; do not extend)
*.csv            Kent extract (pushed 28 Oct 2026): 2,852 rubrics in 4 chapters (COUGH 1,455,
                 CHILL 707, FEVER 544, HEARING 146), 649 remedies, 23,149 rubric–remedy links.
                 Known bug: 7 links reference rubric_ids 2–8 (old MIND rubrics no longer in
                 rubrics_rows.csv) — the new pipeline replaces these files anyway.
frontend/        React 18 + Vite 6 + Tailwind 3, **JSX (not TS yet)**, no router
  src/App.jsx, src/components/{Header, ChapterNavigator, OmniSearchModal, SymptomBasket,
  RepertorizationResults, MateriaMedicaDrawer, DatabaseModal}.jsx
start.sh         Runs uvicorn :8000 and vite :5173
data/curated/    kent_scope.yaml, boericke_scope.yaml, concordance_scope.yaml (approved 29 Oct)
```

Known limitations that the plan fixes:
- Schema is Kent-only: no `repertory` column anywhere.
- **Grades are stored inverted** in the current CSV/DB: `1 = strongest (bold/red)`,
  `2 = italic/blue`, `3 = plain`. The new schema uses natural order (see §5).
- Materia Medica is a hardcoded Python dict of 8 remedies in `server.py` (`MATERIA_MEDICA_ARCHIVE`).
  Everything else gets placeholder text. This dict is to be deleted once Phase 3 lands.
- No ingestion pipeline is in the repo; the CSVs were produced elsewhere.
- Ranking iterates rows in Python and walks rubric paths one by one; will not scale to full chapters.

## 4. Target architecture (summary)

```
homeoint.org HTML ──► pipeline/ (fetch → parse → normalize → validate → load) ──► PostgreSQL (Supabase)
                                                                                   ▲
React + TS frontend ──► FastAPI /api/v1 ──► services ──► repositories ─────────────┘
```

Target repo layout (create folders as tasks need them; do not pre-create empty ones):

```
backend/app/{main.py, api/v1/, schemas/, services/, repositories/, core/config.py}
backend/tests/
pipeline/{fetch/, parsers/, normalize/, concordance/, load/, validate/, config/}
pipeline/tests/fixtures/          # saved HTML snapshots used by parser tests
db/migrations/NNN_name.sql        # plain SQL, applied in order
data/raw/                         # downloaded HTML cache — GITIGNORED
data/processed/                   # generated CSV/JSONL — reproducible, may be gitignored
data/curated/                     # HUMAN-REVIEWED files — COMMITTED, never auto-overwritten
frontend/src/features/{repertory, analysis, materia-medica, concordance-review}/
frontend/src/lib/api/             # typed API client; components never call fetch() directly
```

## 5. Data conventions (non-negotiable)

1. **Grades use natural order: higher = stronger, `1..grade_max` per repertory.**
   - Kent: `grade_max = 3` (3 = bold/red, 2 = italic/blue, 1 = plain).
   - Boericke Repertory: `grade_max = 2` (2 = italic, 1 = plain).
   - Converting the legacy CSV: `new_grade = 4 - old_grade`.
   - Normalized weight used in cross-repertory scoring: `grade / grade_max`.
2. **Stable keys survive re-ingestion.** Database integer IDs may change on every rebuild, so
   curated data never references them. Use:
   - `rubric_key` = `<REPERTORY_CODE>|<normalized full path>`, e.g. `KENT|HEARING>ACUTE>music, to`
     (normalize: NFC Unicode, collapse whitespace, trim; keep original case and punctuation).
   - `remedy.canonical_abbrev` (Kent-style abbreviation, e.g. `Nux-v.`) as the remedy key.
3. **Curated files are the source of truth for human judgement** and live in `data/curated/`:
   `remedy_aliases.csv`, `rubric_links.csv` (verified cross-repertory mappings),
   `mm_section_map.csv`, `kent_scope.yaml`, `boericke_scope.yaml`, `concordance_scope.yaml`. Pipeline scripts may *read* them and may write
   *candidate* files to `data/processed/`, but must never overwrite a curated file.
4. **Only `status = verified` rubric links are used in scoring.** Candidates are shown in the
   review UI only.
5. Source text is public-domain (pre-1929), but the HTML digitizations are © Médi-T and hosted on
   homeoint.org. Every repertory and book row stores an `attribution` string, and the UI shows it.
   Do not publish raw scraped dumps; the repo commits code + curated files, not `data/raw/`.
6. Text encoding: homeoint.org pages are **windows-1252**. Decode explicitly. Keep ligatures and
   diacritics (Æ, œ, ä) in display text; strip/fold them only in search/normalization keys.

## 6. Coding conventions

- Backend: Python 3.10+, FastAPI, Pydantic v2, psycopg (v3) or psycopg2, plain SQL in
  repository modules. Routes thin → services → repositories (Rules doc §6). New routes under
  `/api/v1/`. Keep old unversioned routes working until the frontend has switched, then delete.
- Frontend: **new files in TypeScript (`.tsx`/`.ts`)**. Existing `.jsx` files may stay until
  touched; when you substantially edit one, convert it. Add `react-router-dom` for pages.
- Styling: the implemented Tailwind tokens in `frontend/tailwind.config.js` (`paper`, `ink`,
  `sage`, `terracotta`, `cobalt`; Newsreader / Plus Jakarta Sans / JetBrains Mono) are the
  **source of truth** for the existing UI. Do not introduce new colours or fonts; the navy/teal
  palette in the Design System doc is superseded unless the team says otherwise.
- Grade badge colours everywhere: top grade → terracotta, middle → cobalt, plain → ink-muted.
- Pipeline: Python, stdlib `html.parser` or BeautifulSoup + `lxml`. Every parser has pytest
  tests against saved fixture HTML in `pipeline/tests/fixtures/`. No network in tests.
- Fetching: one polite downloader (`pipeline/fetch/`) with on-disk cache in `data/raw/`,
  ≥1 s between requests, custom User-Agent naming the project. Parsers read only from the cache.
- No secrets in code. DB URL comes from `SUPABASE_DB_URL` (see `.env.example`).
- Keep the demo working offline: the MakerFest laptop runs a local PostgreSQL loaded from the
  same pipeline output. Do not add new features to the legacy CSV/pandas fallback path.

## 7. How to work on a task

1. Pick an unclaimed task ID from the Expansion Plan (e.g. `P1.3`). Check its dependencies are done.
2. Mark it in the plan's task table: `🔄 <agent/model name> <date>`. One task per agent at a time.
3. Work on a branch named `feat/<task-id>-short-name` (e.g. `feat/P1.3-kent-parser`).
4. Meet **every** acceptance criterion listed for the task; add tests; run them.
5. Update the task row to `✅` with a one-line note, and update §3 of this file if you changed
   the "current state" (new folders, removed legacy code, new commands).
6. If you discover something the next agent must know (a source quirk, a decision), add it to
   the **Decisions & Discoveries log** at the bottom of the Expansion Plan. Do not bury it in a
   commit message.
7. If a task needs a domain decision (homeopathy judgement, e.g. "is this rubric equivalent?"),
   do not guess: write a candidate file and flag it for the human reviewer.

## 8. Commands

```bash
# backend (current)
source .venv/bin/activate && uvicorn server:app --reload --port 8000
# frontend
cd frontend && npm install && npm run dev
# both
./start.sh
# tests (once created)
pytest pipeline/tests backend/tests
```
Update this section when commands change (e.g. when `server.py` moves to `backend/app/main.py`).

## 9. Glossary (for agents without homeopathy background)

- **Repertory**: an index of symptoms. Each entry (**rubric**) lists remedies, each with a
  **grade** (typographic emphasis = strength of evidence). Rubrics are hierarchical:
  `EAR > PAIN > night`.
- **Repertorization**: choosing several rubrics for a patient and ranking the remedies that
  cover the most rubrics with the highest grades.
- **Materia Medica (MM)**: a book describing each remedy, usually organised by body section
  (Mind, Head, Eyes, … Modalities, Relationship, Dose). A remedy's entry is a **monograph**.
- **Modalities**: what makes symptoms worse ("agg.", "<") or better ("amel.", ">").
- **Abbreviation**: remedies are cited by short forms (`Acon.`, `Nux-v.`, `Calc. c.`); the same
  remedy is abbreviated differently in different books — hence `remedy_aliases.csv`.
- **Kent**: J.T. Kent's Repertory (symptom-oriented, 3 grades). **Boericke Repertory**: O.E.
  Boericke's clinical repertory, 1927 (disease-oriented headings, 2 grades). **Boericke MM**:
  W. Boericke's Pocket Manual of Materia Medica, 9th ed. 1927.
