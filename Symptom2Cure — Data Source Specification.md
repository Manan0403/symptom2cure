# Symptom2Cure
## Data Source Specification — homeoint.org repertories & materia medica

**Version:** 1.0  
**Date:** 29 October 2026  
**Audience:** Pipeline developers and AI coding agents writing parsers  
**Companion docs:** `AGENTS.md`, `Symptom2Cure — Expansion Implementation Plan v2.md`

Everything below was checked by fetching the live pages on 29 Oct 2026. If a page differs from
what is described here, **record it in the plan's Decisions & Discoveries log** and update this doc.

---

# 1. General facts about the site

| Fact | Detail |
|---|---|
| Base URL | `http://www.homeoint.org/` (HTTP only; HTTPS 302-redirects back to HTTP) |
| Library index | `http://www.homeoint.org/books/` is a frameset; the real list is `http://www.homeoint.org/books.htm` |
| Encoding | `windows-1252` (declared in `<meta>`). Decode bytes explicitly; do not rely on autodetect. |
| HTML quality | 1996–2000 FrontPage / Word 97 output. **Tags are routinely mis-nested** (`<b>` opened in one `<p>`, closed in the next; `<i>` spanning `<br>`). Never rely on a clean DOM tree. Use a **token-stream parser** that tracks open-tag state (bold, italic, current font colour/size, `<dir>` depth). |
| Rights | Underlying books are public domain (pre-1929). Pages carry "Copyright © Médi-T" (1998–2000) or "Presented by Dr Robert Séror". Store attribution per source; credit in UI; do not republish raw dumps. Consider emailing Médi-T for a courtesy permission for a non-commercial university project. |
| Crawling | Cache every page under `data/raw/homeoint/<same path>`. ≥1 s between requests. Never hit the network from parsers or tests. |

---

# 2. Kent's Repertory  — `code: KENT`, `grade_max: 3`

## 2.1 URLs

- Chapter index: `http://www.homeoint.org/books/kentrep/index.htm`
  (links to `kentmind.htm`, `kentvert.htm`, `kenthead.htm`, … `kentgene.htm` — 38 chapter links, Mind → Generalities)
- Remedy abbreviations: `http://www.homeoint.org/books/kentrep/kentreme.htm`
  (lines like `Acon.---------- Aconitum Napellus`)
- Each chapter page (e.g. `kenthear.htm`) is only a **table of contents** of page anchors:
  `Hearing, impaired, right (p. 322)` → `../kentrep1/kent0320.htm#P322`.
- **Content pages** hold 5 book pages each, named `kentNNNN.htm` where NNNN is the first page
  rounded down to a multiple of 5 (`kent0000.htm` = pp. 1–4, `kent0005.htm` = pp. 5–9, …,
  `kent1420.htm` = pp. 1420–1423). They live in **different folders**: Mind pages are in
  `books/kentrep/`, later ones in `books/kentrep1/`, … `books/kentrep3/`.
  ⇒ **Do not construct URLs.** Collect them by reading every chapter TOC page, resolving the
  relative `href`s, de-duplicating, and sorting by page number.

## 2.2 Content page structure (verified on `kentrep1/kent0320.htm`)

```html
<b><font COLOR="#ff0000"><p>---------- </b></font><a HREF="kent0315.htm#P320">&lt;&lt;&lt;&lt;&lt;</a></p>
<p><a HREF="../kentrep/kentear.htm">EAR</a><b><font COLOR="#ff0000"> <a NAME="P320">p. 320</a></p>
<p>ULCERATION, in front of ear</p>          ← running header: repeats the CURRENT rubric context
<p>----------</p><dir>                       ← end of page header
</b></font><p>in front of ear : Carb-v., merc.</p><dir>
...
<p>HEARING</p>
<p>ACUTE</b> : <b><font COLOR="#ff0000">Acon.</b></font>, agar., aloe., ...
   <i><font COLOR="#0000ff">anac.</font>, </i>ang., ...</p><dir>
<p>morning : <i><font COLOR="#0000ff">Fl-ac.</p>
</i></font><p>evening : Coca., rhod.</p><dir>
<p>bed, in : Kali-c.</p>
```

## 2.3 Parsing rules

1. **Treat all content pages, in page order, as one continuous token stream.** Rubrics continue
   across page and file boundaries.
2. **Page headers**: a block that begins with a red `----------` line and ends at the next
   `----------` line is a running header (chapter link, `p. NNN`, repeated context line). Skip it
   for content, but record `p. NNN` as `source_page` for the rubrics that follow.
3. **Line = one `<p>` (or `<br>`-separated) entry.** Format: `rubric text : remedy, remedy, ...`.
   A line with no ` : ` is a heading-only node (has children but no remedies of its own) or a
   chapter title (`HEARING` repeated) — chapter titles are skipped.
4. **Hierarchy = `<dir>` nesting depth** relative to the depth at the start of the content. Main
   rubrics are depth 0 under the chapter. Only their **leading word(s) are uppercase**: the main
   rubric name is that uppercase prefix, and the rest of the line is qualifying text, e.g.
   `PAIN, headache in general : …` → main `PAIN`, `OILY forehead : …` → main `OILY`,
   `ACUTE : …` → `ACUTE`. Store the full printed text as `name` and the prefix as `main_key`
   (used by the scope files). **Bold is not a level signal**: Kent bolds location sub-rubrics
   such as `<b><p>Temples</b> : …`. In the VERTIGO chapter the main rubrics are modalities
   (MORNING, RISING, STOOPING…). Each `<dir>` opens one level;
   `</dir>` closes one. The parent of a line is the most recent line at depth-1.
   *Known quirk:* the source sometimes omits a `<dir>` (e.g. `night : Atro.` followed by
   `bed, in : Kali-c.` at the same depth). Reproduce the source literally; do not "fix" it.
5. **Grades** come from the formatting of each remedy token:
   - bold + `#ff0000` (red) → **3**
   - italic + `#0000ff` (blue) → **2**
   - plain → **1**
   Capitalisation is *not* a grade signal (the first remedy on a line is capitalised regardless).
6. **Remedy tokens**: split the remedy list on commas; strip whitespace and trailing punctuation
   other than the abbreviation's own final `.`. Normalize case to the Kent list form (`acon.` →
   `Acon.`) using `kentreme.htm`.
7. **Cross references** like `(See Concussion)` or `(<a href="kent0185.htm#OPENING">See Pain</a>)`
   are stored in `rubric.see_also` text, not as remedies.
8. **Character references**: the HTML contains windows-1252 numeric references such as
   `&#140;DEMA` (= `ŒDEMA`). Decode entities with HTML5 rules (Python `html.unescape` maps
   `&#128;`–`&#159;` to their windows-1252 characters); never turn them into U+008C-style control
   characters.
9. Store per rubric: `chapter`, `name`, `main_key`, `parent`, `depth`, `full path`, `source_page`,
   `rubric_key`.

## 2.4 Regression test (mandatory)

The legacy CSVs in the repo (`rubrics_rows.csv`, `rubric_remedies_rows-v2.csv`, updated 28 Oct
2026) were produced from this source with **inverted grades** (1 = strongest). They cover
HEARING, COUGH, CHILL and FEVER (2,852 rubrics, 23,149 links). The new parser, restricted to those
four chapters, must reproduce them after conversion `new = 4 - old` (compare by full rubric path
+ remedy abbreviation, not by ID). Ignore the 7 legacy links to rubric_ids 2–8, which point to
MIND rubrics that are no longer in the legacy rubrics file. Any difference
must be explained (legacy bug vs. new-parser bug) in the Decisions & Discoveries log before the
task is closed.
Spot checks: `HEARING > ACUTE`: `Acon.` = 3, `Agar.` = 1, `Anac.` = 2, `Bell.` = 3.

## 2.5 Scope control

Only the chapters / main rubrics listed in `data/curated/kent_scope.yaml` are loaded (approved
29 Oct 2026: 20 chapters, with MIND, EXTREMITIES and GENERALITIES limited to listed main rubrics).
The parser always parses everything; **the loader filters by scope**, so widening scope later is a
config change, not a code change.

---

# 3. Boericke's Repertory (1927)  — `code: BOERICKE_REP`, `grade_max: 2`

## 3.1 URLs

- Index: `http://www.homeoint.org/books4/boerirep/index.htm`
- Prefatory note (explains grading): `.../boerirep/note.htm`
- **31 content pages** (25 sections; 5 sections are split into continuation pages):
  `mind, head, eyes, ears, nose, face, mouth, tongue, taste, gums, teeth, throat, stomach,
  abdomen, abdomen2, urinary, male, female, female2, circulatory, locomotor, locomotor2,
  respiratory, respiratory2, respiratory3, skin, fever, nervous, nervous2, general, modalities`
  + `.htm` (~2.5 MB total). Continuation pages are only reachable through the section TOC links
  (e.g. `respiratory2.htm#cough`), so **crawl links from every page** until no new `.htm` appears;
  do not hard-code this list. Treat `section.htm` + `section2.htm` + `section3.htm` as one stream.

## 3.2 Nature of this repertory

Boericke's is a **clinical** repertory: main headings are often disease names (Eczema, Otitis,
Asthma) with symptom sub-headings, and under extensive headings a fixed order of captions:
*Cause, Type, Location, Character of pain, Concomitants, Modalities*. Per the author's note:
"the italics indicate the more frequently verified clinical remedy" → **2 grades**.

This makes it a good partner to Kent for a "common diseases" scope, but it means rubric names
rarely match Kent's wording one-to-one (see Plan §Concordance).

## 3.3 Structure (verified on `ears.htm`, `head.htm`)

```html
<b><font size="5" color="#ff0000"><p align="CENTER">EARS</p></font></b>          ← section title
<b><font size="4" color="#ff0000"><p>AURICLE (external ear)</p><dir>             ← level 1
</font><font size="4" color="#0000ff"><p>Eruptions</font></b> -- <i><font color="#0000ff">Ant c.</font></i>, Bar. c., ...  ← level 2 with remedies
<dir><b><font size="4" color="#008000"><p>Acne</font></b> -- Calc. s.<br>         ← level 3
     <b><font size="4" color="#800000">Drugging, after</font></b> -- Nux v.<br>   ← level 4
     <b><font size="4" color="#000080">Backward</font></b> -- Glon.<br>           ← level 5
```

## 3.4 Parsing rules

1. **Heading level comes from the heading's font colour** (all `size="4"`, bold):
   `#ff0000` → L1, `#0000ff` → L2, `#008000` → L3, `#800000` → L4, `#000080` → L5.
   (Occurrences of each heading font tag across all 31 pages: L1 449, L2 2210, L3 2831,
   L4 1871, L5 598 — roughly 8,000 headings; a heading can occasionally re-open its font tag, so
   use these as ±5% sanity bounds, not exact counts.) `size="5"` red = section
   title. `size="3"` grey and `size="2"` are page chrome; ignore.
   Use colour as the primary signal and `<dir>` depth only as a sanity check.
2. **Separator**: heading text, then ` -- `, then the remedy list. No ` -- ` ⇒ heading-only node.
3. **Grades**: remedy inside `<i>` (rendered `<i><font color="#0000ff">`) → **2**; plain → **1**.
   Note the remedy-italic font has **no `size` attribute** — that is how you tell it apart from an
   L2 heading, which is also `#0000ff`.
4. `<i>` frequently stays open across `<br>` and into the next heading — reset italic state at
   every heading start.
5. Abbreviations are Boericke's own and inconsistent: `Calc. c.`, `Cal. c.` (typo), `Rhus t.`,
   `Nux v.`, `Sul iod.`, `Zinc. v.`, `Lob. infl.`. Resolve through `remedy_aliases.csv`
   (Plan task P2.2). Unresolved tokens go to `data/processed/unresolved_remedies_BOERICKE_REP.csv`.
6. Bracketed disease names inside headings (e.g. `[Otitis media]`) are kept in the rubric name.
7. Anchors (`<a name="auricleeczema">`) can be stored as `source_anchor` for deep links.
8. **Levels can skip**: e.g. `INTERNAL NOSE` (L1) > `Inflammation (rhinitis)` (L2) > *(no L3)* >
   `CORYZA` (L4). Attach a heading to the nearest existing ancestor above its level; do not create
   empty placeholder nodes. Record skips in the validation report.
9. **Section key = page file stem** (`respiratory`, `general`), not the printed title, which varies
   ("RESPIRATORY SYSTEM", "GENERALITIES"). `boericke_scope.yaml` uses these stems.

---

# 4. Boericke's Pocket Manual of Materia Medica, 9th ed. (1927) — `code: BOERICKE_MM`

## 4.1 URLs

- Index: `http://www.homeoint.org/books/boericmm/index.htm`
- Letter pages: `.../boericmm/a.htm` … `z.htm` → list of monograph links `a/acon.htm`
- **688 monograph pages** (unique links across all letter pages)
- Abbreviations & full names: `.../boericmm/remedies.htm`
  (lines like `ACON ------> ACONITUM NAPELLUS`, `ABR ------> ABRUS PRECATORIUS - JEQUIRITY ...`)
- Preface: `.../boericmm/preface.htm`

## 4.2 Monograph structure (verified on `a/acon.htm`)

```html
<p align="CENTER"><a name="ACON"></a> ... <b><font size="5" color="#800000">ACONITUM NAPELLUS<br></font>Monkshood</b></p>
<p align="justify">A state of fear, anxiety; ... <font color="#0000ff"><i>Physical and mental restlessness</i></font> ...</p>   ← intro (no heading)
<font color="#ff0000"><b><p align="justify">Mind.--</b></font> <font color="#0000ff"><i>Great fear, anxiety</i></font>, ...</p>
<font color="#ff0000"><b><p align="justify">Head.--</b></font> Fullness; ...</p>
...
<p>Relationship.-- ... Aconitum Lycotonum.--Great yellow wolfsbane.--(...)</p>
<p>Dose.--Sixth potency for sensory affections; ...</p>
<p align="center"> Copyright © Médi-T 1999</p>
```

## 4.3 Parsing rules

1. Title = `size="5" #800000` bold text before `<br>` (Latin name); text after `<br>` inside the
   same `<b>` = common name ("Monkshood"). The `<a name="…">` value is the Boericke abbreviation.
2. Text before the first section heading = section `general` (intro / characteristics).
3. **Section headings** = red (`#ff0000`) bold text ending with `.--`. Observed headings:
   Mind, Head, Eyes, Ears, Nose, Face, Mouth, Throat, Stomach, Abdomen, Rectum, Stool, Urinary,
   Urine, Male, Female, Respiratory, Chest, Heart, Back, Extremities, Back and extremities, Sleep,
   Fever, Skin, Modalities, Relationship, Dose. Map each to a canonical `section_key` with
   `data/curated/mm_section_map.csv` (unknown headings → `other` + log them).
4. **Emphasis**: `<font color="#0000ff"><i>…</i></font>` marks Boericke's emphasised symptoms.
   Keep it: store `body_html` sanitised to only `<p>`, `<em>`, `<strong>`, `<br>` (convert this
   pattern to `<em>`), plus `body_text` plain for search.
5. Many monographs embed **minor remedies** in *Relationship* (e.g. `Aconitum Lycotonum.--…`).
   Keep them inside the parent monograph's text; optionally (stretch) extract them as
   `mm_monographs` rows with `parent_monograph_id`.
6. Drop the footer (`Copyright © Médi-T …`) and the navigation (`Home`, letter bar).

---

# 5. Kent's Lectures on Homoeopathic Materia Medica — `code: KENT_LECT`

- Index: `http://www.homeoint.org/books3/kentmm/index.htm` (≈180 remedy pages, e.g. `acon.htm`,
  plus `intro.htm`, `preface.htm`). Presented by **Dr Robert Séror**.
- Structure: title `size="5" #000080` (e.g. "Aconitum Napellus"), then prose paragraphs. Some
  lectures have red sub-headings such as `Introduction`. **No body-system sections** → store as a
  single section `lecture` (split on red sub-headings if present, keeping their titles).
- Inline emphasis uses red/blue font changes for remedy names; keep as plain text.

# 6. H.C. Allen's Keynotes and Characteristics — `code: ALLEN_KEY`

- Index: `http://www.homeoint.org/books/allkeyn/index.htm` (185 remedy entries in 12 files:
  `allkeyaa.htm, allkeyab.htm, allkeycc.htm, allkeyce.htm, allkeyfi.htm, allkeykl.htm,
  allkeym.htm, allkeyno.htm, allkeyp.htm, allkeyrs.htm, allkeyss.htm, allkeytz.htm`).
- **Several remedies per file**, each starting at an anchor (`<a name="Aco">`) followed by a centered
  `#004080` title ("Aconitum Napellus." + `<br>` + "Monkshood (Ranunculacea.)").
- Two emphasis levels: `#ff0000` bold (strongest) and `#800000` italic. Map to `<strong>` and `<em>`.
- Paragraphs starting with `Relations.--`, `Aggravation.--`, `Amelioration.--` → sections
  `relationship`, `modalities` (store agg./amel. sub-titles in the text); the rest → `keynotes`.

# 7. Other sources on the site (not in current scope)

| Source | URL | Why not now |
|---|---|---|
| Boger, General Analysis & Card Index | `seror/boggaic/indxcard.htm` | Flat, **ungraded** card list (e.g. `ANXIETY (Carte N°11): Aco., arg-n., …`). Could be a 3rd repertory later with `grade_max = 1`. |
| Boger, Synoptic Key | `books2/bogersyn/index.htm` | Has its own repertory part; check structure before planning. |
| Woods' Repertory | `seror/woodsrep/index.htm` | Small; not checked. |
| Clarke's Dictionary | `clarke/index.htm` | Very large; index page is a frameset shell, needs separate investigation. |
| Hering's Guiding Symptoms | `hering/index.htm` | Very large. |
| Nash's Leaders, Guernsey's Keynotes, Lippe's Keynotes | `books2/nashtherap/`, `books4/guernsey/`, `books2/lippkeyn/` | Good later MM additions. |

No Boenninghausen Therapeutic Pocket Book was found on homeoint.org (only "Boenninghausen's
Characteristics Materia Medica").
