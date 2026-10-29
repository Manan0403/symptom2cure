# Symptom2Cure
## Expansion Implementation Plan v2 — Multi-Repertory Analysis & Materia Medica Library

**Version:** 2.1  
**Status:** Approved, in implementation  
**Date:** 29 October 2026 (v2.1: MakerFest date fixed at first week of December 2026; a BHMS doctor is the domain reviewer; Kent scope approved and committed as `data/curated/*.yaml`)  
**Deadline:** feature freeze **Thu 26 Nov 2026**, demo-ready **Mon 30 Nov 2026**  
**Audience:** Development team, faculty advisor, and every AI coding agent working on the repo  
**Read first:** `AGENTS.md` (conventions), `Symptom2Cure — Data Source Specification.md` (source formats)

---

# 1. Goals and scope

## 1.1 What we are building for MakerFest

| # | Feature | Outcome |
|---|---|---|
| G1 | **Kent, scoped** | Kent's Repertory loaded for the chapters and rubrics the team selects: common conditions and body parts, plus 1–2 complex diseases. Loaded through a repeatable, tested pipeline. |
| G2 | **Second repertory** | Boericke's Repertory (1927, clinical, 2 grades), loaded for the matching sections. |
| G3 | **Combined analysis** ("Option C") | A repertorization that merges evidence from Kent and Boericke **only through human-verified rubric mappings**, shows how many repertories agree, and explains every score. |
| G4 | **Materia Medica library** | A library modelled on Similia's MM module: book library, remedy index, monograph reader, full-text search, side-by-side comparison, and two-way links between repertory and MM. Starts with Boericke's Pocket Manual, then adds Kent's Lectures and Allen's Keynotes. |

## 1.2 Explicitly out of scope (for now)

- Copyrighted modern repertories and MM (Synthesis, Complete, Murphy, Phatak, Vermeulen, Scholten).
- Patient management and case history beyond what already exists.
- Translations, live transcription, photo analysis.
- **Cut for the December deadline:** semantic (AI) search (P5.4) and auto-linking remedy names
  inside MM text (P3.11). Allen's Keynotes (P3.10) is a stretch goal, done only if Week 4 finishes
  early. All three stay in the plan for after MakerFest.

## 1.3 Principles that shape every task

1. **Correct before big.** It is better to have 10 chapters with correct, verified mappings than
   38 chapters with guessed ones. Scope lives in config, so it can grow later.
2. **Human judgement is data.** Rubric equivalence and ambiguous remedy abbreviations are decided by
   a person with homeopathy knowledge (a BHMS teammate or the faculty advisor). Those decisions are
   saved to committed CSVs in `data/curated/` and are never regenerated automatically.
3. **Reproducible pipeline.** `fetch → parse → normalize → validate → load` can be re-run from
   scratch at any time, with the same result.
4. **Explainable output.** Every number on the results screen can be traced back to a grade in a
   named book.

---

# 2. Sources

All sources are on homeoint.org. Exact structures are in the Data Source Specification.

| Code | Book | Kind | Grades | Size (approx.) | Phase |
|---|---|---|---|---|---|
| `KENT` | Kent, *Repertory of the Homoeopathic Materia Medica* | Repertory, symptom-oriented | 3 | 1,423 book pages; scoped | P1 |
| `BOERICKE_REP` | O.E. Boericke, *Repertory* (1927) | Repertory, clinical | 2 | 31 pages (25 sections), ≈8,000 headings | P2 |
| `BOERICKE_MM` | W. Boericke, *Pocket Manual of Homœopathic Materia Medica*, 9th ed. | MM with sections | – | 688 monographs | P3 |
| `KENT_LECT` | Kent, *Lectures on Homœopathic Materia Medica* | MM, prose lectures | – | ≈180 lectures | P3 |
| `ALLEN_KEY` | H.C. Allen, *Keynotes and Characteristics* | MM, keynotes | – | 185 entries | P3 |

**Rights note.** The texts are public domain. The HTML digitizations are © Médi-T, and Kent's
Lectures were put online by Dr Robert Séror. We store attribution for every source, show it in the
UI, and keep the raw HTML cache out of git. Decision D5 is whether to email Médi-T as a courtesy.

**Fetch everything early.** Week 1 includes task P0.5, which downloads all five sources into
`data/raw/` so the project does not depend on the site staying up.

---

# 3. Data model

New migration: `db/migrations/001_multi_repertory.sql`. It replaces the legacy `rubrics`,
`remedies` and `rubric_remedies` tables. The new table names are singular on purpose, so old and
new can live side by side during migration.

```sql
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- ---------- Repertories ----------
CREATE TABLE repertory (
  repertory_id  smallint PRIMARY KEY,
  code          text UNIQUE NOT NULL,            -- 'KENT', 'BOERICKE_REP'
  title         text NOT NULL,
  author        text NOT NULL,
  year          smallint,
  grade_max     smallint NOT NULL CHECK (grade_max BETWEEN 1 AND 5),
  grade_labels  jsonb NOT NULL,                  -- {"3":"Bold","2":"Italic","1":"Plain"}
  source_url    text,
  attribution   text NOT NULL
);

-- ---------- Remedies (one canonical row per remedy, shared by all books) ----------
CREATE TABLE remedy (
  remedy_id        serial PRIMARY KEY,
  canonical_abbrev text UNIQUE NOT NULL,         -- Kent style: 'Nux-v.'
  full_name        text NOT NULL,                -- 'Nux Vomica'
  common_name      text,                         -- 'Poison Nut' (from MM where available)
  kingdom          text                          -- optional: plant | mineral | animal | nosode | other
);

CREATE TABLE remedy_alias (
  remedy_id   int  NOT NULL REFERENCES remedy ON DELETE CASCADE,
  source_code text NOT NULL,                     -- repertory.code, mm_book.code, or 'ANY'
  alias       text NOT NULL,                     -- as printed: 'Nux v.'
  alias_norm  text NOT NULL,                     -- normalized key: 'nux-v'
  PRIMARY KEY (source_code, alias_norm)
);

-- ---------- Rubrics ----------
CREATE TABLE rubric (
  rubric_id     serial PRIMARY KEY,
  repertory_id  smallint NOT NULL REFERENCES repertory,
  rubric_key    text UNIQUE NOT NULL,            -- 'KENT|EAR>PAIN>night' (stable across rebuilds)
  parent_id     int REFERENCES rubric,
  chapter       text NOT NULL,                   -- 'EAR'
  name          text NOT NULL,                   -- 'night'  (full printed text of this level)
  main_key      text NOT NULL,                   -- uppercase main-rubric key of the branch: 'PAIN'
  path          text NOT NULL,                   -- 'EAR > PAIN > night'
  depth         smallint NOT NULL,
  sort_order    int NOT NULL,                    -- order in the book
  see_also      text,
  source_page   text,                            -- Kent 'p. 321'
  source_anchor text,                            -- Boericke '#auricleeczema'
  remedy_count  int NOT NULL DEFAULT 0
);
CREATE INDEX rubric_parent_idx ON rubric (repertory_id, parent_id);
CREATE INDEX rubric_path_trgm  ON rubric USING gin (path gin_trgm_ops);

CREATE TABLE rubric_remedy (
  rubric_id int      NOT NULL REFERENCES rubric ON DELETE CASCADE,
  remedy_id int      NOT NULL REFERENCES remedy,
  grade     smallint NOT NULL CHECK (grade >= 1),  -- NATURAL order: higher = stronger
  PRIMARY KEY (rubric_id, remedy_id)
);
CREATE INDEX rubric_remedy_remedy_idx ON rubric_remedy (remedy_id);

-- ---------- Cross-repertory concordance ----------
CREATE TABLE rubric_link (
  link_id     serial PRIMARY KEY,
  rubric_a    int  NOT NULL REFERENCES rubric ON DELETE CASCADE,   -- convention: Kent side
  rubric_b    int  NOT NULL REFERENCES rubric ON DELETE CASCADE,   -- other repertory
  relation    text NOT NULL CHECK (relation IN ('equivalent','a_broader','a_narrower','related')),
  status      text NOT NULL CHECK (status IN ('candidate','verified','rejected')),
  confidence  real,                                -- candidate generator score 0..1
  method      text NOT NULL,                       -- 'auto-v1' | 'manual'
  reviewed_by text,
  reviewed_at timestamptz,
  note        text,
  UNIQUE (rubric_a, rubric_b),
  CHECK (rubric_a <> rubric_b)
);

-- ---------- Materia Medica ----------
CREATE TABLE mm_book (
  book_id      smallint PRIMARY KEY,
  code         text UNIQUE NOT NULL,             -- 'BOERICKE_MM', 'KENT_LECT', 'ALLEN_KEY'
  title        text NOT NULL,
  author       text NOT NULL,
  year         smallint,
  edition      text,
  source_url   text,
  attribution  text NOT NULL,
  has_sections boolean NOT NULL DEFAULT true
);

CREATE TABLE mm_monograph (
  monograph_id serial PRIMARY KEY,
  book_id      smallint NOT NULL REFERENCES mm_book,
  remedy_id    int REFERENCES remedy,            -- NULL only if unresolved (must be reported)
  title        text NOT NULL,                    -- 'ACONITUM NAPELLUS'
  common_name  text,                             -- 'Monkshood'
  source_url   text,
  sort_order   int NOT NULL,
  UNIQUE (book_id, title)
);
CREATE INDEX mm_monograph_remedy_idx ON mm_monograph (remedy_id);

CREATE TABLE mm_section (
  section_id    serial PRIMARY KEY,
  monograph_id  int NOT NULL REFERENCES mm_monograph ON DELETE CASCADE,
  section_key   text NOT NULL,                   -- canonical: 'mind','head',…,'modalities','relationship','dose','general','lecture','keynotes','other'
  section_title text NOT NULL,                   -- as printed: 'Mind.--' → 'Mind'
  ordinal       smallint NOT NULL,
  body_html     text NOT NULL,                   -- sanitized: <p>,<em>,<strong>,<br> only
  body_text     text NOT NULL,                   -- plain text for display snippets
  search_text   text NOT NULL,                   -- body_text with diacritics folded (æ→ae, œ→oe) by the pipeline
  tsv           tsvector GENERATED ALWAYS AS (to_tsvector('english', search_text)) STORED
);
CREATE INDEX mm_section_tsv_idx ON mm_section USING gin (tsv);
CREATE INDEX mm_section_key_idx ON mm_section (section_key);
```

**Legacy conversion.** Legacy `grade` maps to `4 - grade`. The legacy tables are dropped once
task P1.7 is complete.

**Curated files** (committed; see `AGENTS.md` §5):

| File | Columns | Written by |
|---|---|---|
| `data/curated/kent_scope.yaml` | chapters / main rubrics to load | ✅ committed 2026-10-29 |
| `data/curated/boericke_scope.yaml` | sections (by page file stem) to load | ✅ committed 2026-10-29 |
| `data/curated/concordance_scope.yaml` | per condition: Kent main rubrics + depth to map, and the Boericke sections/headings to search (this **replaces** `chapter_alignment.csv`) | ✅ committed 2026-10-29; doctor to confirm |
| `data/curated/remedy_aliases.csv` | `source_code, alias, canonical_abbrev, decided_by, note` | Reviewer, after the P2.2 report |
| `data/curated/rubric_links.csv` | `rubric_key_a, rubric_key_b, relation, status, reviewed_by, reviewed_at, note` | Export from the review UI (P4.4) |
| `data/curated/mm_section_map.csv` | `book_code, printed_heading, section_key` | Agent drafts it, reviewer confirms |

The loader resolves `rubric_key` values to IDs. **An unresolved key is a hard error**: it means a
parser change renamed a rubric that a human had already mapped.

---

# 4. Combined analysis (Option C): algorithm specification

## 4.1 Inputs

```jsonc
POST /api/v1/analysis
{
  "rubrics": [ { "rubric_id": 812, "importance": 2, "eliminative": false }, ... ],  // any repertory
  "mode": "combined",                 // "single" | "combined"
  "repertories": ["KENT", "BOERICKE_REP"],
  "repertory_weights": { "KENT": 1.0, "BOERICKE_REP": 1.0 },   // ρ_k, decision D3
  "agreement_bonus": 0.25,            // β, decision D3
  "sort": "coverage_then_score"       // or "score"
}
```

## 4.2 Steps

For each basket rubric `r`:

1. **Expand.** `E(r) = {r} ∪ { r' | rubric_link(r, r') has status='verified' and relation='equivalent' }`,
   restricted to the enabled repertories. Links work in both directions. `K_r` is the set of
   repertories represented in `E(r)`.
2. **Grade per repertory.** For remedy `m` and repertory `k ∈ K_r`:
   `g_k(m,r)` = the highest grade of `m` among the rubrics of `E(r)` that belong to `k`
   (0 if `m` is absent).
   `n_k(m,r) = ρ_k · g_k(m,r) / grade_max_k`.
3. **Evidence for the rubric.**
   - `base(m,r) = max_k n_k(m,r)`: the strongest evidence in any book.
   - `agree(m,r)` = the number of repertories `k ∈ K_r` with `g_k > 0`.
   - `s(m,r) = base(m,r) + β · max(0, agree(m,r) − 1)`.
   - `m` **covers** `r` when `agree(m,r) ≥ 1`.
4. **Remedy total.** `score(m) = Σ_r importance_r · s(m,r)`, and `coverage(m)` = the number of
   rubrics covered.
5. **Eliminative rubrics.** Drop any `m` that does not cover every rubric flagged `eliminative`.
6. **Sort.** By default, `coverage` descending, then `score` descending, then `canonical_abbrev`.
   This matches the current engine's behaviour.

**Why this design.** Boericke lists far fewer remedies per heading than Kent. Taking the **maximum**
means a remedy is never penalized because the shorter book left it out. The **agreement bonus**
rewards remedies that both books confirm, which is the "recommendation backed by more repertories"
the team asked for. With one repertory enabled, `β` never applies and
`score ∝ Σ importance · grade/grade_max`. That is the classic Kent sum-of-grades, so the old ranking
is preserved as a special case (and tested in P4.8).

`mode = "single"` uses one repertory with no expansion, and keeps the existing user-adjustable grade
weights (3/2/1 by default).

## 4.3 Output (per remedy)

```jsonc
{
  "remedy": { "remedy_id": 10, "abbrev": "Acon.", "full_name": "Aconitum Napellus" },
  "coverage": 4, "coverage_total": 5, "score": 4.75, "agreement_avg": 1.6,
  "per_rubric": [
    { "rubric_id": 812, "path": "EAR > PAIN > night", "importance": 2,
      "evidence": { "KENT": { "rubric_id": 812, "grade": 3, "grade_max": 3 },
                    "BOERICKE_REP": { "rubric_id": 40211, "grade": 2, "grade_max": 2 } },
      "base": 1.0, "agree": 2, "s": 1.25 }
  ],
  "has_mm": ["BOERICKE_MM", "KENT_LECT"]
}
```

## 4.4 Worked example (invented numbers, for understanding only)

Take one Kent rubric with grades Bell 3, Cham 3, Puls 2, Merc 1. Its verified Boericke equivalent
lists Cham (italic), Puls (italic), Bell (plain). With β = 0.25:

| Remedy | Kent n | Boericke n | base | agree | s |
|---|---|---|---|---|---|
| Cham | 1.00 | 1.00 | 1.00 | 2 | 1.25 |
| Puls | 0.67 | 1.00 | 1.00 | 2 | 1.25 |
| Bell | 1.00 | 0.50 | 1.00 | 2 | 1.25 |
| Merc | 0.33 | 0 | 0.33 | 1 | 0.33 |

Puls rises because Boericke rates it more highly. Merc gets no bonus because only Kent lists it.

---

# 5. Concordance: how mappings are kept correct

Mappings are the hardest part of Option C and the part most likely to be questioned at MakerFest.
The workflow is **machine proposes, human decides**:

1. **Concordance scope and alignment (P4.1, done).** `data/curated/concordance_scope.yaml` lists
   nine conditions (headache, cold and cough, ear infection, indigestion, diarrhoea/constipation,
   eczema, asthma, rheumatism, common Mind). For each one it gives the Kent main rubrics and depth
   to map, and the Boericke sections or headings where candidates may come from. Candidates are
   only proposed within a condition's Boericke block. This is much smaller than the load scope on
   purpose: everything loaded still works for repertorization, but only this subset gets
   cross-repertory mappings before MakerFest.
2. **Candidate generation (P4.2).** For every Kent rubric in the concordance scope, the top 5
   Boericke rubrics are ranked by
   `0.4 · embedding cosine + 0.3 · lexical similarity + 0.3 · remedy-set overlap`.
   - *Embedding*: `sentence-transformers/all-MiniLM-L6-v2`, run locally on full paths. It is free
     and needs no API key.
   - *Lexical*: token Jaccard on normalized paths, with a small synonym list (`agg.`→aggravation,
     `amel.`→amelioration, `pain`↔`ache`, and so on) kept in `pipeline/concordance/synonyms.yaml`.
   - *Remedy overlap*: weighted Jaccard of the two remedy lists. This is a strong signal, because
     equivalent rubrics share their top remedies.
   - The weights are a starting point and get tuned on the gold set.
3. **Gold set (P4.3).** The reviewer maps 50 Kent rubrics by hand before seeing the candidates.
   The generator should reach **recall@5 ≥ 80%** on this set; if it doesn't, tune the weights.
4. **Review (P4.4–P4.5).** In the review UI, the reviewer sees both full paths, both remedy lists
   with grades, and the scores. They choose *equivalent / a broader / a narrower / related / reject*.
   Only `verified + equivalent` links affect scoring. The other relations appear as "see also".
5. **Persist.** Verified decisions are exported to `data/curated/rubric_links.csv`, committed, and
   reloaded on every rebuild.

A Kent rubric with no verified equivalent simply contributes Kent evidence alone. The UI labels
such rubrics "Kent only" so nobody reads the missing mapping as a disagreement.

**Reviewer budget (BHMS doctor).** About 30–40 decisions per hour. The concordance scope is capped
at **about 400 Kent rubrics**, which is roughly 10–12 hours of mapping review between 16 and
25 November. The doctor's total time is about 15–16 hours over four weeks:

| When | What | Hours |
|---|---|---|
| by Wed 4 Nov | Read the scope files; confirm or adjust `concordance_scope.yaml` | 1 |
| 6–11 Nov | Remedy alias review (`alias_review.csv` → `remedy_aliases.csv`) | 2 |
| 9–13 Nov | Gold set: hand-map 50 Kent rubrics | 2 |
| 16–25 Nov | Mapping review sprint in the review UI | 10–12 |
| 26–28 Nov | Validate 3 demo cases (P4.8) | 1–2 |

This is the schedule's critical path (see §9).

---

# 6. API (v1)

All routes are under `/api/v1`. They follow the Rules doc: thin routes, then services, then
repositories, with validated input.

| Method | Path | Purpose |
|---|---|---|
| GET | `/status` | DB mode, counts per repertory and per book |
| GET | `/repertories` | List with grade_max, labels, attribution |
| GET | `/repertories/{code}/chapters` | Top-level chapters |
| GET | `/rubrics/{id}` | Rubric with remedies (grades), parent path, verified links |
| GET | `/rubrics/{id}/children` | Child rubrics, each with `has_children` and `remedy_count` |
| GET | `/rubrics/search?q=&repertories=KENT,BOERICKE_REP&limit=50` | Token + trigram search on paths |
| GET | `/rubrics/{id}/equivalents` | Verified and related links in other repertories |
| POST | `/analysis` | §4 algorithm (`single` / `combined`) |
| GET | `/remedies?q=` | Remedy index: abbrev, full name, common name, all aliases, fuzzy matching |
| GET | `/remedies/{id}` | Remedy card, plus which MM books have it |
| GET | `/remedies/{id}/rubrics?repertory=&min_grade=` | Reverse lookup: where this remedy appears, sorted by grade |
| GET | `/mm/books` | Library: books, counts, attribution |
| GET | `/mm/books/{code}/index?letter=` | A–Z monograph list for one book |
| GET | `/mm/remedies/{remedy_id}?books=` | All monographs for a remedy, with sections |
| GET | `/mm/search?q=&books=&sections=&page=` | Full-text search, `ts_headline` snippets, grouped by remedy |
| GET | `/mm/compare?remedies=1,2,3&book=BOERICKE_MM&sections=mind,stomach` | Sections aligned by `section_key` |
| GET | `/mm/compare?remedy=10&books=BOERICKE_MM,KENT_LECT,ALLEN_KEY` | Same remedy across authors |
| GET | `/admin/concordance/candidates?chapter=&status=candidate&page=` | Review queue (admin) |
| PATCH | `/admin/concordance/links/{id}` | Set relation and status, plus a note (admin) |

Admin routes require the `X-Admin-Token` header, matched against the `ADMIN_TOKEN` env var. That
is sufficient for a single-reviewer academic project.

**Search query syntax** (MM and rubrics): plain words are combined with AND, `"quoted phrase"`
searches the exact phrase, and `-word` excludes a word. MM search uses Postgres
`websearch_to_tsquery('english', q)`, which supports exactly this syntax.

---

# 7. Frontend specification

Pages are added with `react-router-dom`. New code is TypeScript and existing Tailwind tokens are
used (`AGENTS.md` §6). All data goes through `src/lib/api/` (typed client).

| Route | Screen |
|---|---|
| `/` | **Repertorize** workspace (existing). Adds a repertory selector, a mode toggle (Single/Combined), and per-rubric importance (1–4) and eliminative flag in the basket. |
| `/mm` | **Library home**: book cards (title, author, year, monograph count, attribution) and a global remedy search box |
| `/mm/:abbrev` | **Monograph reader** |
| `/mm/search?q=` | **MM search results** |
| `/mm/compare?…` | **Compare** view |
| `/admin/concordance` | Mapping **review** screen (hidden unless an admin token is set) |

## 7.1 Materia Medica module (modelled on Similia `/app/mm`)

The Similia app screens require a login and could not be inspected for this plan. The features
below come from Similia's public description (book library, full remedy profiles, keyword search
across books, comparing authors side by side, and one-click repertory↔MM linking). **Task P3.0:**
a team member logs into Similia and saves screenshots of the MM screens to
`docs/reference/similia/` (library, remedy view, search, compare). UI agents follow their layout and
interaction pattern, using our own design tokens and text and **none of Similia's branding or assets**.

**Monograph reader `/mm/:abbrev`**
- Left rail, collapsible on mobile: remedy index with a filter box (matches abbreviation, Latin
  name, common name, or any alias) and an A–Z jump bar. The book filter is a set of checkboxes.
- Header: Latin name, canonical abbreviation, common name, kingdom (if known), and the list of
  books that contain this remedy as tabs (`Boericke · Kent Lectures · Allen Keynotes`).
- Body: a section table of contents (sticky) next to the section text. Boericke's emphasis is
  rendered as `<em>`. The "Mind" section is visually first-class.
- Right panel, **"In the repertory"**: the rubrics where this remedy has the top grade, grouped by
  repertory and chapter, with grade badges and an "Add to case" button. Sourced from
  `/remedies/{id}/rubrics`.
- Actions: **Compare with…** (pick 1–2 more remedies), **Compare authors** (opens the same remedy
  across all books), and **Copy citation** (book, author, year, section).

**Search `/mm/search`**
- A query box using the §6 syntax. Filters: books (multi-select) and sections (multi-select
  canonical keys, e.g. only `stomach`).
- Results are grouped by remedy: remedy name, a hit count, and 1–3 highlighted snippets showing
  book and section. Clicking a result opens the reader scrolled to the section with the terms
  highlighted.
- An empty state suggests checking spelling and trying a body-system filter.

**Compare `/mm/compare`**
- Up to 3 columns, with rows aligned by `section_key` (Mind next to Mind, Stomach next to Stomach).
  A missing section shows "Not described in this book".
- Two modes: *remedies × one book*, or *one remedy × several authors*.
- Section toggles allow comparing only selected body systems.

**Repertory → MM links** (replaces `MATERIA_MEDICA_ARCHIVE` and the placeholder text)
- In results and the basket, clicking a remedy opens the existing `MateriaMedicaDrawer`, now backed
  by `/mm/remedies/{id}`. It shows the Boericke summary, the sections relevant to the current basket
  (for example, the Ear section if the basket has ear rubrics), and an "Open full monograph" link.

**Stretch (P3.11):** remedy names mentioned inside MM text (such as "(Ambra)" or "Compare: Bell.")
are turned into links using the alias table.

## 7.2 Combined results view (P4.7)

- Remedy table columns: rank, remedy, coverage `x/n`, score, and an **agreement** indicator (one
  dot per repertory that supports it).
- The repertorization grid has one cell per rubric showing stacked mini-badges per repertory
  (`K3 · B2`). Hovering explains the calculation (`base 1.00 + bonus 0.25`).
- The basket shows each rubric's equivalents ("+ Boericke: EARS > PAIN > night"), or a "Kent only"
  tag.
- A methodology popover states the §4 formula in plain words.

---

# 8. Phases and tasks

**Status legend:** ⬜ todo · 🔄 in progress (agent, date) · ✅ done · ⛔ blocked · ✂️ cut for December  
**Size:** S ≈ half a day, M ≈ 1–2 days, L ≈ 3–5 days  
**Owner:** 🤖 = an AI agent can do it alone; 👤 = needs a human decision or review; 🤖👤 = agent builds, human checks

## Phase 0 — Foundation (W1: 29 Oct – 4 Nov)

| ID | Task | Deps | Size | Owner | Status | Acceptance criteria |
|---|---|---|---|---|---|---|
| P0.1 | Restructure the backend into `backend/app/` (api/v1, schemas, services, repositories, core/config). Move the existing endpoints to `/api/v1/...` and keep the old paths as thin aliases. | – | M | 🤖 | ⬜ | App starts; old and new routes return identical JSON for chapters, children, search, and repertorize; `start.sh` and README are updated. |
| P0.2 | Write `db/migrations/001_multi_repertory.sql` (§3), plus `db/apply.py` to apply migrations in order. | – | S | 🤖 | ⬜ | Applies cleanly to an empty local Postgres and to Supabase; re-running is a no-op (tracked in a `schema_migrations` table). |
| P0.3 | Set up local Postgres for development and the demo: `docker-compose.yml` (postgres:16), plus a README section (with a Postgres.app alternative for Mac). | – | S | 🤖 | ⬜ | `docker compose up` followed by `python db/apply.py` gives an empty schema; `SUPABASE_DB_URL` can point at local or cloud. |
| P0.4 | Frontend: add TypeScript (`tsconfig`, Vite TS), `react-router-dom`, a typed API client in `src/lib/api/`, and move the current workspace to route `/`. | – | M | 🤖 | ⬜ | `npm run build` passes; existing UI works unchanged at `/`; no component calls `fetch` directly. |
| P0.5 | Pipeline skeleton plus a polite fetcher (`pipeline/fetch/homeoint.py`): cache, ≥1 s delay, windows-1252 decoding, crawl lists for all 5 sources. **Run it and cache everything.** | – | M | 🤖 | ⬜ | `data/raw/homeoint/` holds every Kent content page (pp. 1–1423), all 31 Boericke Repertory pages (found by crawling, including the `*2.htm`/`*3.htm` continuations), 688 Boericke MM pages, Kent Lectures, and Allen Keynotes. A manifest CSV lists URL, path, bytes, and fetched_at. |
| P0.6 | Remove the Streamlit `app.py` from the run path (archive to `legacy/`), subject to decision D7. | – | S | 🤖 | ⬜ | The repo runs without Streamlit; `requirements.txt` is trimmed. |

## Phase 1 — Kent, scoped and complete (W1–W3: 29 Oct – 18 Nov)

| ID | Task | Deps | Size | Owner | Status | Acceptance criteria |
|---|---|---|---|---|---|---|
| P1.1 | Fill in `data/curated/kent_scope.yaml`: the chapters and main rubrics for common conditions plus 1–2 complex diseases (see §11). | – | S | 👤 | ✅ 2026-10-29 | Committed from the team-approved §11 proposal; main-rubric names checked on the live pages. Doctor may still adjust it by 4 Nov. |
| P1.2 | Kent remedy list parser (`kentreme.htm`) creates canonical `remedy` rows and `KENT` aliases. | P0.5 | S | 🤖 | ⬜ | Row count equals the number of entries on the page; aliases normalize correctly (`Nux-v.`→`nux-v`); diacritics are kept in `full_name`. |
| P1.3 | Kent repertory parser (`pipeline/parsers/kent_repertory.py`): a token-stream parser per Data Spec §2.3. | P0.5 | L | 🤖 | ⬜ | Fixture tests pass (`kent0320.htm`, one Mind page, one page-boundary case); `HEARING > ACUTE` grades match the spec; **the regression test against the legacy CSVs passes**, with any differences logged; 0 unresolved remedy tokens in scope. |
| P1.4 | Normalize, validate, and load Kent (`pipeline/load/`), with a validation report in `data/processed/reports/kent.md`. | P0.2, P1.1–P1.3 | M | 🤖 | ⬜ | The loader **fails on any chapter or main-rubric name in `kent_scope.yaml` that is not found**. Report shows rubrics per chapter, remedies, links, grade distribution, rubrics with 0 remedies, duplicate keys (must be 0), and unresolved tokens (must be 0). The load is idempotent. |
| P1.5 | Ranking service in SQL plus Python: a single query per analysis, no per-row path walking; path comes from `rubric.path`. | P0.1, P1.4 | M | 🤖 | ⬜ | Same results as the legacy engine on the legacy sample; a 20-rubric analysis takes under 300 ms on the dev laptop (benchmark script committed). |
| P1.6 | Rubric search v2: trigram plus token matching on `path`, ranked (exact > prefix > contains > fuzzy), with a repertory filter. | P1.4 | M | 🤖 | ⬜ | Under 150 ms p95 over the scoped Kent set; tests cover typos ("hedache" finds HEAD > PAIN). |
| P1.7 | Frontend switches to the v1 API and new schema; grade badges use natural grades; drop the legacy tables and `MATERIA_MEDICA_ARCHIVE` placeholder logic. | P0.4, P1.5, P1.6 | M | 🤖 | ⬜ | Chapter navigator, search, basket, and results work on the full scoped Kent; no references to legacy tables remain. |

## Phase 2 — Boericke Repertory and single-repertory mode (W1–W3: 29 Oct – 18 Nov)

| ID | Task | Deps | Size | Owner | Status | Acceptance criteria |
|---|---|---|---|---|---|---|
| P2.1 | Fill in `data/curated/boericke_scope.yaml`: the sections and headings matching the Kent scope. | P1.1 | S | 👤 | ✅ 2026-10-29 | Committed (12 sections, keyed by page file stem). |
| P2.2 | **Remedy alias resolution** for Boericke Repertory and Boericke MM abbreviations. Match by (1) normalized alias, (2) full name from `boericmm/remedies.htm` against Kent full names, (3) `rapidfuzz` suggestions. Produce a review CSV. New remedies not in Kent get canonical rows. | P1.2, P0.5 | M | 🤖👤 | ⬜ | `data/processed/alias_review.csv` lists every unresolved or fuzzy match with its top 3 suggestions. After the reviewer fills `data/curated/remedy_aliases.csv`, **0 unresolved tokens** in scope. Known cases are covered by tests: `Calc. c.`→`Calc.`, `Cal. c.`→`Calc.`, `Rhus t.`→`Rhus-t.`, `Nux v.`→`Nux-v.`. |
| P2.3 | Boericke repertory parser per Data Spec §3.4 (heading level by colour, ` -- ` separator, italic = grade 2). | P0.5 | M | 🤖 | ⬜ | Fixture tests on `ears.htm` and the `head.htm` Modalities block (5 levels deep); heading counts per level are within ±5% of the spec's sanity bounds; continuation pages (`respiratory2/3.htm` etc.) parse as part of their section. |
| P2.4 | Load Boericke plus a validation report (as P1.4). | P2.1–P2.3 | S | 🤖 | ⬜ | Report shows 0 duplicate keys and 0 unresolved remedies in scope. |
| P2.5 | **Single-repertory mode in the UI**: a repertory switcher in the navigator and search; the basket can hold rubrics from both books; analysis `mode=single` per repertory. | P1.7, P2.4 | M | 🤖 | ⬜ | The user can repertorize fully in Boericke; grade labels show correctly (Italic/Plain). |

## Phase 3 — Materia Medica library (W1–W4: 29 Oct – 25 Nov, parallel track)

| ID | Task | Deps | Size | Owner | Status | Acceptance criteria |
|---|---|---|---|---|---|---|
| P3.0 | Capture Similia MM reference screenshots into `docs/reference/similia/`. | – | S | 👤 | ⬜ | At least 4 screenshots: library, remedy view, search, and compare. |
| P3.1 | Boericke MM parser per Data Spec §4.3: title, common name, abbreviation, sections, emphasis converted to `<em>`, sanitized HTML. | P0.5 | M | 🤖 | ⬜ | Fixture tests on `a/acon.htm` plus 3 other remedies, including one with *Back and extremities* and one with minor remedies in *Relationship*; all 688 pages parse without exceptions. |
| P3.2 | Draft `mm_section_map.csv` (printed heading to `section_key`) from all parsed headings; reviewer confirms it. | P3.1 | S | 🤖👤 | ⬜ | Every printed heading is mapped; the share of headings mapped to `other` is below 2%. |
| P3.3 | Load MM: link `mm_monograph.remedy_id` through the alias table (P2.2), build `search_text` (diacritics folded), and the FTS index. | P0.2, P2.2, P3.2 | M | 🤖 | ⬜ | At least 98% of monographs are linked to a remedy, with the rest listed in the report; `SELECT … @@ websearch_to_tsquery('english','burning stomach')` returns hits in Stomach sections, including Ars. |
| P3.4 | MM API endpoints (§6, the `/mm/*` and `/remedies/*` rows). | P0.1, P3.3 | M | 🤖 | ⬜ | Pydantic schemas, tests per endpoint; search p95 under 300 ms. |
| P3.5 | **Library home and monograph reader** UI (§7.1). | P0.4, P3.4, P3.0 | L | 🤖 | ⬜ | Reader renders every Boericke monograph; TOC jumps work; mobile layout works at 375 px; loading and error states per Rules §5. |
| P3.6 | **MM search UI** (filters, grouped results, highlighting, deep link into the reader). | P3.5 | M | 🤖 | ⬜ | Query syntax works (phrase, exclusion); section filter works; empty state shown. |
| P3.7 | **Compare UI** (both modes, aligned sections). | P3.5 | M | 🤖 | ⬜ | 3 remedies × Boericke aligned correctly; missing sections labelled. |
| P3.8 | **Repertory↔MM linking**: drawer backed by the API; "In the repertory" panel; "Add to case" from the MM page. | P1.7, P3.5 | M | 🤖 | ⬜ | `MATERIA_MEDICA_ARCHIVE` deleted from the code; every remedy in results opens a real monograph or shows "No monograph in loaded books". |
| P3.9 | Kent's Lectures parser and load (`section_key='lecture'`, split on red sub-headings). | P3.3 | M | 🤖 | ⬜ | At least 95% of lectures linked to remedies; author comparison works for Acon. |
| P3.10 | *Stretch (only if Week 4 is ahead):* Allen's Keynotes parser and load (multiple entries per file, anchors, two emphasis levels). | P3.3 | M | 🤖 | ⬜ | 185 entries loaded; at least 98% linked. |
| P3.11 | *Cut for December:* auto-link remedy mentions inside MM text. | P3.8 | M | 🤖 | ✂️ | No false links in a 30-paragraph manual sample. |

## Phase 4 — Concordance and combined analysis (W3–W5: 12 – 28 Nov)

| ID | Task | Deps | Size | Owner | Status | Acceptance criteria |
|---|---|---|---|---|---|---|
| P4.1 | Concordance scope and alignment (`concordance_scope.yaml`). | – | S | 👤 | ✅ 2026-10-29 | Committed; doctor confirms by 4 Nov. |
| P4.2 | Candidate generator (`pipeline/concordance/generate_candidates.py`) per §5, reading `concordance_scope.yaml` and writing `rubric_link` rows with `status='candidate'`. | P1.4, P2.4 | L | 🤖 | ⬜ | Prints Kent rubric count per condition and **fails if the total exceeds 400** (until scope is trimmed); deterministic output; runs in under 10 minutes on CPU; never overwrites verified or rejected links. |
| P4.3 | Gold set: the reviewer hand-maps 50 Kent rubrics (`data/curated/concordance_gold.csv`); an evaluation script reports recall@1 and recall@5. | P4.1 | M | 👤🤖 | ⬜ | recall@5 ≥ 80% (tune the weights in P4.2 until it is). |
| P4.4 | Review UI `/admin/concordance` plus PATCH API, and the `export_links.py` / `import_links.py` round-trip to `rubric_links.csv`. | P0.4, P4.2 | M | 🤖 | ⬜ | Keyboard-driven review (1–5 for the relation, R to reject, N for next); export → rebuild → import reproduces identical links. |
| P4.5 | **Review sprint (BHMS doctor, 16–25 Nov)**: verify mappings for every Kent rubric in the concordance scope. | P4.4 | L | 👤 | ⬜ | Every concordance-scope Kent rubric is either linked or marked "no counterpart"; progress is shown in the review UI. |
| P4.6 | Combined analysis service (§4) plus unit tests. | P1.5, P4.2 | M | 🤖 | ⬜ | Tests: (a) Kent-only combined ordering (all importance = 1) equals classic single-mode ordering with default grade weights 3/2/1; (b) the §4.4 example reproduces exactly; (c) eliminative filter; (d) unverified links are ignored. |
| P4.7 | Combined results UI (§7.2). | P4.6, P2.5 | M | 🤖 | ⬜ | Per-repertory badges, agreement dots, explanation popover; "Kent only" tags. |
| P4.8 | Doctor/faculty validation: run the 3 demo cases in Kent-only and combined mode and record how the BHMS doctor (and faculty advisor, if available) judges the rankings. | P4.5, P4.7 | S | 👤 | ⬜ | Written notes saved in `docs/validation/`. |

## Phase 5 — Polish and demo (W5: 26 – 30 Nov)

| ID | Task | Deps | Size | Owner | Status | Acceptance criteria |
|---|---|---|---|---|---|---|
| P5.1 | Symptom importance (1–4) and eliminative flag in the basket UI (if not already done in P2.5). | P4.7 | S | 🤖 | ⬜ | Both persist in the case and affect results. |
| P5.2 | About/Sources page: book list, attribution, Médi-T and Séror credits, methodology, disclaimer. | P3.5 | S | 🤖 | ⬜ | Linked from the footer; disclaimer also shown on the results page. |
| P5.3 | Demo pack: 3 prepared cases (one per showcased disease), a one-command demo start, and an offline rehearsal on the demo laptop with Wi-Fi off. | all | S | 👤🤖 | ⬜ | The demo runs fully offline from local Postgres. |
| P5.4 | *Cut for December:* semantic search for rubrics and MM (`pgvector` plus the same MiniLM model, embeddings computed in the pipeline). | P4.2, P3.3 | L | 🤖 | ⬜ | Queries in plain patient language ("ringing in ears at night") find the right rubric in the top 5 for 15 of 20 test phrases. |
| P5.5 | Docs: update README, Architecture doc §5, and `AGENTS.md` §3/§8 to the final state. | all | S | 🤖 | ⬜ | A new contributor can run the project from the README alone. |

---

# 9. Schedule to MakerFest (first week of December 2026)

About 4½ weeks. Weeks run Thursday to Wednesday so that each week ends with a check-in.

| Week | Dates | Track A — Kent & engine | Track B — Boericke Rep | Track C — Materia Medica | Track E — Concordance & combined | BHMS doctor (Track D) | End-of-week checkpoint |
|---|---|---|---|---|---|---|---|
| **W1** | Thu 29 Oct – Wed 4 Nov | P0.1, P0.2, P0.3, P0.6, P1.2, start P1.3 | **P0.5 fetch everything**, start P2.3 | P0.4, start P3.1 | – | Confirm the scope files (1 h) | All sources cached; schema applied locally; app runs on `/api/v1` |
| **W2** | Thu 5 – Wed 11 Nov | P1.3 finish (legacy regression passes), P1.4 | P2.2 alias resolution, P2.3, P2.4 | P3.1, P3.2, P3.3 | – | Alias review (2 h); gold set of 50 (2 h, by 13 Nov) | Scoped Kent and Boericke in the DB; 0 unresolved remedies; Boericke MM loaded |
| **W3** | Thu 12 – Wed 18 Nov | P1.5, P1.6, P1.7 | P2.5 single-repertory UI | P3.4, P3.0 screenshots in, start P3.5 | P4.2 generator, P4.3 evaluation, P4.4 review UI | **Review sprint starts Mon 16 Nov** | Review UI live with candidates; recall@5 ≥ 80%; frontend fully on the new schema |
| **W4** | Thu 19 – Wed 25 Nov | Bug fixes, performance checks | Help Track E | P3.5, P3.6, P3.7, P3.8, P3.9 (Kent's Lectures) | P4.6 combined service, P4.7 combined UI | **Review sprint ends Wed 25 Nov** | All features complete; every concordance-scope rubric decided |
| **W5** | Thu 26 – Mon 30 Nov | **Feature freeze Thu 26 Nov.** Fixes only; P5.1, P5.2, P5.3, P5.5 | – | – | Import final `rubric_links.csv` | Validate 3 demo cases (P4.8) | **Offline rehearsal Mon 30 Nov** on the demo laptop |

Rules for keeping the date:
- Tracks A, B and C run in parallel from day 1. Each agent owns one track at a time.
- Shared dependency: **P2.2 (remedy aliases)** feeds both the Boericke Repertory and MM linking.
  It must finish in W2.
- **Critical path: the doctor's review.** Agents never wait on it. Build and test with candidate
  data, then switch to verified data as it arrives. Export `rubric_links.csv` every evening of the
  sprint so no review work is lost.
- **If a week slips,** cut in this order: P3.10 (already a stretch) → P3.9 Kent's Lectures (MM then
  ships with Boericke only) → P3.7 author-comparison mode (keep remedy comparison) → lower the
  concordance `max_depth` to 1 everywhere. Never cut tests, the 0-unresolved gates, or the offline
  rehearsal.
- Plan around any Diwali or exam break: if a teammate or the doctor is away in W2, move the alias
  review earlier into W1 rather than later.

---

# 10. Quality gates and Definition of Done

**Every pipeline task:** fixture-based tests, a validation report, an idempotent load, and no
network access in tests.  
**Every API task:** Pydantic request and response models, tests (happy path plus invalid input), and
no business logic in routes.  
**Every UI task:** TypeScript, loading, empty and error states, works at 375 px and 1440 px, keyboard
accessible, existing tokens only.

**MakerFest Definition of Done**
1. Scoped Kent and Boericke loaded, with 0 unresolved remedies and 0 duplicate keys.
2. Every scored cross-repertory link is human-verified (`rubric_links.csv` committed).
3. Combined analysis passes the P4.6 tests and the doctor's validation in P4.8.
4. MM library: Boericke complete (Kent's Lectures as second book if W4 holds); search under
   300 ms; compare and repertory↔MM links working.
5. The demo runs offline on the presentation laptop.
6. Attribution and disclaimer are visible.

---

# 11. Approved scope (decision D2)

**Approved by the team on 29 Oct 2026** and committed as `data/curated/kent_scope.yaml`,
`boericke_scope.yaml` and `concordance_scope.yaml`. Those files are authoritative; this table is
the human-readable summary. For Option C to show well, the conditions were chosen where **both**
Kent and Boericke have substantial material:

| Condition | Kent chapters (examples) | Boericke sections |
|---|---|---|
| Headache / migraine | HEAD (PAIN and sub-rubrics), VERTIGO, GENERALITIES (modalities) | HEAD (HEADACHE, VERTIGO), MODALITIES |
| Common cold / cough | NOSE (CORYZA, DISCHARGE), THROAT, COUGH, EXPECTORATION | NOSE (incl. CORYZA), THROAT, RESPIRATORY (COUGH) |
| Ear infection | EAR (PAIN, DISCHARGES, INFLAMMATION), HEARING | EARS (incl. otitis headings) |
| Indigestion / acidity | STOMACH (ERUCTATIONS, NAUSEA, PAIN, VOMITING), ABDOMEN | STOMACH (INDIGESTION - DYSPEPSIA, HYPERACIDITY, INFLAMMATION (gastritis), NAUSEA, VOMITING) |
| Diarrhoea / constipation | RECTUM, STOOL | ABDOMEN (ANUS - RECTUM, CONSTIPATION, diarrhoea headings) |
| Eczema / skin eruptions | SKIN (ERUPTIONS), EXTREMITIES (eruptions) | SKIN (ECZEMA, ERUPTIONS, URTICARIA, …) |
| Complex disease 1: **Asthma** | RESPIRATION (ASTHMATIC, DIFFICULT), COUGH, CHEST | RESPIRATORY (BRONCHIAL TUBES > ASTHMA, LUNGS, RESPIRATION) |
| Complex disease 2: **Rheumatism / joint pain** | EXTREMITIES (PAIN, rheumatic; SWELLING), GENERALITIES | LOCOMOTOR (rheumatic headings), GENERAL |

(Boericke heading names and Kent main-rubric names were checked on the live pages on 29 Oct.
Note that Kent has no main rubric "RHEUMATISM", since rheumatic pains sit under
EXTREMITIES > PAIN, and no "WEATHER" in GENERALITIES, since weather modalities sit under COLD,
WET, CHANGE, WIND and the seasons.)

Keep the MIND chapter (at least the commonly used rubrics). It matters to every case and appears in
both books. CHILL and FEVER are loaded too, since the team had already extracted them; they are
not in the concordance scope for December, but a "fever" condition can be added there if the
doctor has time.

---

# 12. Risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Messy HTML breaks parsers | High | Medium | Token-stream parsing, fixture tests, per-page error report rather than crash |
| Abbreviation mismatches give wrong remedy links | High | High | P2.2 review CSV, 0-unresolved gate, tests for known cases |
| Review time underestimated | Medium | High | Concordance scope capped at ~400 rubrics (generator enforces it), keyboard-driven review UI, nightly export of decisions |
| Only ~4½ weeks to MakerFest | High | High | Dated schedule (§9), cut order defined, feature freeze 26 Nov |
| homeoint.org down or changed | Low | High | Fetch everything in week 1 (P0.5); parsers use only the cache |
| Venue Wi-Fi fails | Medium | High | Offline local Postgres demo (P0.3, P5.3) |
| Agents diverge in style or decisions | Medium | Medium | `AGENTS.md`, task protocol, Decisions log below |
| Rights question from judges | Low | Medium | Public-domain texts, attribution, raw HTML not redistributed, optional Médi-T email |

---

# 13. Open decisions (team to answer; record the answer here)

| ID | Decision | Default if undecided |
|---|---|---|
| D1 | MakerFest date | ✅ **Decided 29 Oct:** first week of December 2026 → freeze 26 Nov, rehearsal 30 Nov (§9) |
| D2 | Final Kent and Boericke scope | ✅ **Decided 29 Oct:** §11 proposal, committed as `data/curated/*.yaml` |
| D3 | Repertory weights ρ and agreement bonus β | ρ = 1.0 for both, β = 0.25, adjustable in the UI; doctor may revise after P4.8 |
| D4 | Who is the domain reviewer? | ✅ **Decided 29 Oct:** a BHMS doctor (schedule in §5) |
| D5 | Email Médi-T for courtesy permission? | Yes, short note, non-commercial academic use |
| D6 | Colour tokens: current editorial palette vs the Design System doc's navy/teal | Keep the current `tailwind.config.js` palette |
| D7 | Remove the Streamlit prototype? | Yes, archive to `legacy/` |
| D8 | MM books beyond Boericke | Kent's Lectures for December; Allen's Keynotes only as a stretch |

---

# 14. Decisions & Discoveries log

Append-only. Format: `YYYY-MM-DD · who · finding/decision · impact`.

- 2026-10-29 · Claude (planning) · homeoint.org serves HTTP only, in windows-1252; Kent content
  pages span `books/kentrep/` and `books/kentrep1..3/`, so URLs must be collected from the chapter
  TOCs, not constructed · P0.5, P1.3
- 2026-10-29 · Claude (planning) · Legacy CSV grades are inverted (1 = strongest); the new schema
  uses natural order (`new = 4 − old`) · P1.3 regression test, P1.7
- 2026-10-29 · Claude (planning) · Boericke Repertory has 2 grades (italic = "more frequently
  verified clinical remedy", per the author's note) and encodes heading depth by font colour
  (red/blue/green/maroon/navy = L1–L5) · P2.3
- 2026-10-29 · Claude (planning) · Boericke Repertory has 31 pages, not 25: abdomen, female,
  locomotor and nervous continue in `*2.htm`, and respiratory in `respiratory2.htm` and
  `respiratory3.htm` (COUGH, LARYNX, LUNGS…), reachable only through TOC links · P0.5, P2.3
- 2026-10-29 · Claude (planning) · Kent main rubrics are NOT fully uppercase lines: only the
  leading word(s) are uppercase, e.g. `PAIN, headache in general : …`, `OILY forehead : …`. Bold
  is not a level signal either (locations such as `Temples` are bold sub-rubrics) · P1.3
- 2026-10-29 · Claude (planning) · Kent HTML uses windows-1252 numeric character references such as
  `&#140;DEMA` (= ŒDEMA). Decode with HTML5 rules (Python `html.unescape` does this), not as
  Unicode code points · P1.3
- 2026-10-29 · Claude (planning) · In Kent's VERTIGO chapter the main rubrics are the modalities
  themselves (MORNING, RISING, STOOPING…); there is no "VERTIGO" main rubric under it · scope files
- 2026-10-29 · Claude (planning) · Boericke headings can skip a level, e.g.
  `INTERNAL NOSE > Inflammation (rhinitis) > [no L3] > CORYZA (L4)`. Attach to the nearest
  existing ancestor and do not invent an empty node · P2.3
- 2026-10-29 · Claude (planning) · Boericke section titles vary ("RESPIRATORY SYSTEM",
  "GENERALITIES"), so the scope files key sections by page file stem (`respiratory`, `general`) · P2.1, P2.4
- 2026-10-29 · Claude (planning) · The GitHub repo is ahead of the ZIP copy the plan was first
  based on: commits of 28 Oct replaced the sample with 2,852 rubrics (HEARING, COUGH, CHILL, FEVER;
  MIND removed), still with inverted grades; 7 orphan links to rubric_ids 2–8. CHILL and FEVER
  were added to `kent_scope.yaml`, and `fever` to `boericke_scope.yaml`. P1.3's regression test
  now targets these four chapters · P1.3, scope files
- 2026-10-29 · Team · MakerFest is in the first week of December 2026; a BHMS doctor reviews;
  Kent scope as proposed → schedule compressed (§9), P3.11 and P5.4 cut, P3.10 stretch
- 2026-10-29 · Claude (planning) · The Similia `/app/mm` screens need a login and could not be
  inspected; UI spec is from Similia's public pages; screenshots requested (P3.0) · P3.5–P3.7
- 2026-10-29 · Claude (planning) · No Boenninghausen Therapeutic Pocket Book on homeoint.org;
  Boger's Card Index exists but is ungraded · possible future 3rd repertory
