# Symptom2Cure
## Development Rules & AI Coding Guidelines

**Version:** 1.0  
**Status:** Draft — Development Baseline  
**Date:** August 2026  
**Project:** Symptom2Cure

---

# 1. Purpose

This document defines the rules that must be followed by:

- Human developers
- AI coding assistants
- Automated development tools
- Data-pipeline scripts
- Backend and frontend implementations

The purpose of these rules is to ensure that Symptom2Cure remains:

- Consistent
- Maintainable
- Secure
- Performant
- Testable
- Explainable
- Scalable
- Easy for the development team to understand

These rules take precedence over shortcuts that may produce faster initial code but damage the architecture or maintainability of the project.

---

# 2. Core Engineering Principles

## Rule 2.1 — Do Not Over-Engineer

Use the simplest architecture that satisfies the current requirement.

Do not introduce:

- Microservices
- Message brokers
- Kubernetes
- Complex distributed caching
- Unnecessary databases
- Complex AI infrastructure

unless an actual requirement or measured performance problem justifies them.

---

## Rule 2.2 — Do Not Under-Engineer

Do not use shortcuts that create long-term technical debt.

Avoid:

- Large monolithic files
- Duplicated business logic
- Hardcoded database data
- Raw SQL scattered throughout the frontend
- Unstructured global state
- Unvalidated imported data
- Copy-pasted components

---

## Rule 2.3 — Measure Before Optimizing

Do not assume that a particular implementation is faster.

For performance-related decisions:

1. Establish the requirement.
2. Implement a reasonable baseline.
3. Benchmark it.
4. Identify the bottleneck.
5. Optimize the bottleneck.
6. Benchmark again.

---

# 3. Technology Rules

## 3.1 Frontend

Required:

- React
- Vite
- TypeScript
- Tailwind CSS

The frontend should remain browser-based.

Do not introduce another frontend framework without explicit architectural review.

---

## 3.2 Backend

Required:

- Python
- FastAPI

Backend business logic must remain in Python.

Do not introduce Node.js solely for convenience if the existing Python/FastAPI architecture can handle the requirement.

---

## 3.3 Database

Required runtime database:

- PostgreSQL
- Supabase

The application must treat PostgreSQL as the runtime source of truth.

---

## 3.4 Data Pipeline

Required:

- Python

The data pipeline is responsible for:

```text
Kent HTML
→ Extraction
→ Transformation
→ Validation
→ CSV
→ Supabase
```

The ingestion pipeline must remain separate from the runtime web application.

---

# 4. Frontend Rules

## Rule 4.1 — TypeScript Only

New frontend code must use TypeScript.

Avoid creating new `.js` or `.jsx` files unless a specific technical reason exists.

---

## Rule 4.2 — Components Must Have Clear Responsibilities

A component should primarily handle:

- Presentation
- User interaction
- Local UI state

Complex business logic belongs in appropriate services/hooks rather than large UI components.

---

## Rule 4.3 — No Database Logic in React Components

Never do this:

```text
React Component
    ↓
Database Query
```

Use:

```text
React Component
    ↓
API Service
    ↓
FastAPI
    ↓
Database
```

---

## Rule 4.4 — Reusable Components

Repeated UI patterns should become reusable components.

Examples:

- SearchInput
- SymptomChip
- RemedyCard
- ScoreIndicator
- DataTable
- Modal
- FormField
- LoadingState
- ErrorState

Do not duplicate the same UI implementation across multiple pages.

---

## Rule 4.5 — Feature-Based Organization

Feature-specific logic should remain inside its feature.

Example:

```text
features/
├── patients/
├── cases/
├── symptoms/
├── remedies/
├── search/
└── authentication/
```

Avoid creating one enormous generic folder containing unrelated application logic.

---

# 5. UI/UX Rules

## Rule 5.1 — Medical Software Appearance

The interface should feel:

- Professional
- Calm
- Clean
- Trustworthy
- Information-oriented

Avoid:

- Excessive animations
- Gaming-style interfaces
- Excessive gradients
- Decorative clutter
- Unnecessary 3D effects

---

## Rule 5.2 — Consistent Design System

Use the project's Design.md as the source of truth once it is finalized.

Do not introduce random:

- Colors
- Fonts
- Border radii
- Shadows
- Spacing values

---

## Rule 5.3 — Loading States

Every operation that can take noticeable time should provide feedback.

Examples:

```text
Searching...
Loading case...
Analyzing symptoms...
Loading remedy...
```

Never leave the user wondering whether the application is frozen.

---

## Rule 5.4 — Error States

Errors must be understandable to the user.

Bad:

```text
Internal Server Error 500
```

Better:

```text
We couldn't load the remedy results.
Please try again.
```

Technical details belong in logs, not user-facing messages.

---

# 6. Backend Rules

## Rule 6.1 — Layer Separation

Backend code must follow:

```text
API
 ↓
Schema
 ↓
Service
 ↓
Search / Ranking
 ↓
Repository
 ↓
Database
```

Do not bypass layers without a documented reason.

---

## Rule 6.2 — API Routes Must Remain Thin

Routes should:

1. Receive the request.
2. Validate it.
3. Call the appropriate service.
4. Return the response.

Routes should not contain hundreds of lines of business logic.

---

## Rule 6.3 — Business Logic Belongs in Services

Examples:

- Case processing
- Symptom analysis
- Remedy ranking
- Coverage calculation
- Search orchestration

must not be implemented directly inside API routes.

---

## Rule 6.4 — Database Access Belongs in Repositories

Database queries should be centralized within repository/data-access modules.

Do not scatter database queries throughout services and routes.

---

# 7. API Rules

## Rule 7.1 — Version the API

Use:

```text
/api/v1/
```

for the initial public API.

---

## Rule 7.2 — Validate All Input

Every API endpoint must validate:

- Required fields
- Data types
- Allowed values
- IDs
- String lengths
- Array sizes
- Authentication/authorization

Never trust frontend validation alone.

---

## Rule 7.3 — Consistent Responses

Responses should follow consistent structures.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message"
  }
}
```

---

## Rule 7.4 — Do Not Leak Internal Information

API responses must never expose:

- Passwords
- Secrets
- Database credentials
- Stack traces
- Internal SQL
- Private configuration
- Sensitive patient information unnecessarily

---

# 8. Database Rules

## Rule 8.1 — PostgreSQL Is the Runtime Source of Truth

The web application must query PostgreSQL.

CSV files are not runtime databases.

---

## Rule 8.2 — No Hardcoded Knowledge Base

Do not place remedy/symptom data directly into:

- React components
- Python source code
- API route files
- Configuration files

Knowledge data belongs in the database.

---

## Rule 8.3 — Use Relationships

Do not store large relationship lists as comma-separated strings.

Prefer normalized relational structures.

Example:

```text
Remedy
   ↓
RemedySymptom
   ↓
Symptom
```

---

## Rule 8.4 — Foreign Keys

Relationships between core entities should use appropriate foreign-key constraints.

Do not rely solely on application code to maintain referential integrity.

---

## Rule 8.5 — Index Deliberately

Indexes should be created based on actual query patterns.

Before adding an index:

1. Identify the query.
2. Determine whether the index helps.
3. Benchmark if necessary.
4. Consider write/storage overhead.

Do not create indexes on every column automatically.

---

# 9. Search Rules

Search is a core subsystem and must receive special treatment.

## Rule 9.1 — Never Download the Full Dataset

The browser must never download the entire repertory database to perform searches.

---

## Rule 9.2 — Avoid Unnecessary Full-Table Scans

Search should use:

- Indexed lookup
- Appropriate PostgreSQL search capabilities
- Candidate reduction

where applicable.

---

## Rule 9.3 — Debounce Autocomplete

Symptom autocomplete should use a debounce target of:

**≤ 200 ms**

The implementation must avoid sending an API request for every raw keystroke.

---

## Rule 9.4 — Limit Search Results

Autocomplete should return a bounded number of results.

Do not return thousands of suggestions to the browser.

---

## Rule 9.5 — Search and Ranking Are Separate

Search answers:

> Which candidates match the user's criteria?

Ranking answers:

> How should those candidates be ordered?

Do not combine both responsibilities into one unmaintainable function.

---

# 10. Ranking Engine Rules

## Rule 10.1 — Ranking Must Be Deterministic

Given the same:

- Case
- Symptoms
- Grades
- Dataset
- Configuration

the ranking engine should produce the same result.

---

## Rule 10.2 — Explain Every Score

The ranking engine must retain the information required to explain:

- Matched symptoms
- Missing symptoms
- Grade contribution
- Coverage
- Other weighting factors

A score without an explanation is insufficient for Symptom2Cure.

---

## Rule 10.3 — Do Not Invent Clinical Logic

AI coding tools must not invent:

- Medical weighting systems
- Remedy relationships
- Clinical rules
- Symptom grades

If the required domain rule is not defined, flag it for human/domain-expert validation.

---

## Rule 10.4 — Keep Ranking Logic Independent

Ranking logic should be independently testable without requiring the React frontend.

---

# 11. Data Pipeline Rules

## Rule 11.1 — Source Data Must Be Traceable

Every extracted dataset should retain enough metadata to identify its source.

Where appropriate, record:

- Source
- Source URL/reference
- Extraction date
- Dataset version
- Processing version

---

## Rule 11.2 — Never Modify Raw Source Data Destructively

Maintain a distinction between:

```text
Raw
Processed
Validated
Imported
```

Do not overwrite the original source representation unnecessarily.

---

## Rule 11.3 — Validate Before Import

Never directly import an unvalidated dataset into the primary knowledge base.

Pipeline:

```text
Extract
 ↓
Transform
 ↓
Validate
 ↓
Review
 ↓
Import
```

---

## Rule 11.4 — Duplicate Detection

The ingestion pipeline should detect duplicate records before import.

Duplicates must be:

- Removed
- Merged
- Or explicitly reported

according to defined rules.

Do not silently discard potentially meaningful records.

---

## Rule 11.5 — Import Must Be Repeatable

Running the ingestion process multiple times should not create uncontrolled duplicate data.

The import process should be designed to be repeatable/idempotent where practical.

---

# 12. CSV Rules

CSV is an intermediate format.

CSV files must:

- Have defined column names
- Use consistent encoding
- Have consistent delimiters
- Preserve required source information
- Be validated before import

Generated CSV files should not be treated as manually maintained production data unless explicitly required.

---

# 13. Kent Repertory Data Rules

Kent Repertory HTML is the project's primary initial data source.

The extraction system must:

- Parse the actual source structure
- Preserve relevant hierarchy
- Preserve remedy relationships
- Preserve grades where available
- Preserve source references where appropriate
- Report extraction failures

Do not assume that all HTML pages have identical structures without verification.

---

# 14. Data Licensing Rule

The project team must verify the legal/licensing status of the source material before external redistribution or commercial use.

The system should maintain source attribution where appropriate.

Do not claim that extracted material is freely redistributable unless that has been verified.

---

# 15. Patient Data Rules

Patient data is sensitive.

The application must:

- Collect only necessary information
- Restrict unauthorized access
- Avoid exposing patient information in logs
- Avoid putting patient information in URLs unnecessarily
- Validate user permissions
- Protect data in transit

Development/test datasets should preferably use synthetic patient information.

---

# 16. Authentication Rules

Authentication must be handled securely.

Never:

- Store plaintext passwords
- Hardcode credentials
- Put secrets in frontend source code
- Store tokens insecurely without consideration of the deployment model

Authentication implementation must follow the final Supabase/backend security architecture.

---

# 17. Environment & Secrets Rules

Sensitive configuration must use environment variables or a secure secret-management mechanism.

Example:

```text
DATABASE_URL
SUPABASE_URL
SUPABASE_KEY
JWT_SECRET
```

Never commit real credentials to Git.

`.env` must be included in `.gitignore`.

`.env.example` may contain variable names and safe placeholders.

---

# 18. Error Handling Rules

Every layer must handle errors appropriately.

## Frontend

Display understandable messages.

## API

Return standardized errors.

## Services

Raise meaningful application exceptions.

## Repository

Log/propagate database failures appropriately.

## Data Pipeline

Record failed records and continue where safe rather than silently corrupting the dataset.

---

# 19. Logging Rules

Logs must contain useful diagnostic information.

Log:

- Errors
- Important application events
- Data import summaries
- Performance measurements
- Authentication/security events where appropriate

Do not log:

- Passwords
- Authentication secrets
- API keys
- Sensitive patient information
- Complete private medical notes

---

# 20. Testing Rules

New functionality should include appropriate tests.

## Minimum expectations

### Backend

- Unit tests
- Service tests
- Repository/integration tests where appropriate
- API tests

### Frontend

- Component tests for important interactive components
- Feature tests

### Data Pipeline

- Extraction tests
- Transformation tests
- Validation tests
- Import tests

### End-to-End

Critical user workflows should be tested.

---

# 21. Test Data Rules

Use synthetic data during development wherever possible.

Do not commit real patient information to:

- Git
- Test fixtures
- Screenshots
- Logs
- Public repositories

---

# 22. Performance Rules

The project has the following initial targets:

```text
Symptom search:       < 500 ms
Remedy ranking:       < 1 second
Application load:     < 3 seconds
Dataset:              1M+ indexed records
```

These are targets, not guaranteed results.

AI coding tools must not claim that a target has been achieved without actual measurement.

---

# 23. Performance Investigation

When performance is poor:

```text
Measure
 ↓
Identify bottleneck
 ↓
Form hypothesis
 ↓
Change implementation
 ↓
Benchmark
 ↓
Compare
```

Do not randomly add:

- Caching
- Threads
- Async code
- Database indexes
- Complex algorithms

without understanding the bottleneck.

---

# 24. Async Programming Rules

Asynchronous programming should be used where it provides a genuine benefit.

Appropriate examples may include:

- I/O-bound API operations
- External network requests
- Long-running data-processing tasks

Do not make every function asynchronous simply because FastAPI supports async.

---

# 25. AI Coding Assistant Rules

AI coding agents must:

1. Read the relevant project documentation before making architectural changes.
2. Follow `PRD.md`.
3. Follow `Architecture.md`.
4. Follow this `Rules.md`.
5. Inspect existing code before modifying it.
6. Avoid rewriting working modules unnecessarily.
7. Ask for clarification when requirements conflict.
8. Clearly identify assumptions.
9. Never fabricate completed functionality.
10. Never silently change architectural decisions.

---

# 26. AI Must Not Invent Requirements

If the documentation does not specify:

- A feature
- A database field
- A business rule
- A ranking weight
- An API behavior
- A security requirement

the AI must not assume one without justification.

Instead:

```text
Requirement missing
        ↓
Identify ambiguity
        ↓
Ask / document assumption
        ↓
Implement only after decision
```

---

# 27. AI Change Management

Before making a significant architectural change, the AI should explain:

- Current approach
- Proposed approach
- Reason for change
- Benefits
- Risks
- Files affected

Small implementation changes do not require lengthy explanations.

Major architecture changes do.

---

# 28. No Unnecessary Rewrites

If an existing implementation works, do not rewrite it simply to make it stylistically different.

Prefer:

```text
Small controlled improvement
```

over:

```text
Complete rewrite
```

unless the existing implementation fundamentally violates the architecture.

---

# 29. Dependency Rules

Before introducing a new dependency, evaluate:

- Why it is required
- Whether existing dependencies can solve the problem
- Maintenance status
- Bundle/runtime impact
- Security implications
- Compatibility
- License

Do not install libraries for trivial functionality that can be implemented cleanly with existing tools.

---

# 30. Version Control Rules

Git must be used.

Commit messages should describe the change.

Examples:

```text
feat: add symptom autocomplete
fix: correct remedy ranking calculation
refactor: separate search service
test: add ranking engine tests
docs: update architecture
```

Avoid:

```text
update
changes
final
new
test
```

---

# 31. Branching Rules

Use feature branches for significant work.

Example:

```text
main
│
├── feature/symptom-search
├── feature/case-builder
├── feature/remedy-ranking
└── feature/data-import
```

Do not directly experiment on the stable branch when the change is substantial.

---

# 32. Commit Scope

A commit should ideally represent one logical change.

Avoid combining:

```text
Frontend redesign
Database migration
Ranking algorithm
Bug fixes
```

into a single unrelated commit.

---

# 33. Documentation Rules

Whenever a significant architectural decision changes:

Update the relevant documentation.

Examples:

Architecture change  
→ `Architecture.md`

Development milestone  
→ `Phases.md`

Coding rule  
→ `Rules.md`

Design-system change  
→ `Design.md`

Development state/context  
→ `Memory.md`

Product requirement  
→ `PRD.md`

Documentation must not intentionally contradict the implementation.

---

# 34. Medical Domain Rules

Symptom2Cure is a decision-support system.

The application must not represent its output as:

- Definitive diagnosis
- Guaranteed treatment
- Guaranteed cure
- Mandatory prescription
- Autonomous clinical decision

Use appropriate language such as:

- Candidate remedies
- Matching remedies
- Repertory-based result
- Ranking
- Coverage
- Supporting reference

---

# 35. Explainability Rules

The application should avoid unexplained claims such as:

```text
"Remedy X is 94% correct."
```

Prefer:

```text
"Remedy X ranked highest because it matched
8 of 10 selected symptoms, including 3 high-weight symptoms."
```

The exact wording must reflect actual implemented scoring.

---

# 36. No False Precision

Do not display a confidence percentage unless the underlying system actually defines what that percentage means.

A ranking score is not automatically a medical probability.

If the system uses:

```text
Score = 18
```

do not label it:

```text
18% medical confidence
```

unless formally defined and validated.

---

# 37. Data Source Integrity

The application should distinguish between:

- Source-derived information
- System-calculated scores
- User-entered information
- Future AI-generated information

These categories should not be presented as equivalent.

---

# 38. AI Future Integration Rules

When AI is eventually introduced:

- AI must not silently replace deterministic search
- AI-generated information must be clearly identified
- AI output must remain subject to application rules
- AI must have access only to approved data
- AI output should be traceable where possible
- AI must not generate unsupported clinical claims

The Version 1 application must remain functional without AI.

---

# 39. Database Migration Rules

Schema changes must be handled through controlled migrations.

Do not manually modify production schema without documenting the change.

Every schema change should consider:

- Existing data
- Foreign keys
- Indexes
- Backward compatibility
- Migration rollback/recovery

---

# 40. Data Import Safety

Never run a large database import against the primary dataset without:

1. Validating the CSV.
2. Checking record counts.
3. Checking duplicates.
4. Checking relationships.
5. Testing the import process.
6. Verifying the resulting data.

---

# 41. Search Query Safety

Search queries must:

- Be parameterized
- Validate user input
- Limit returned data
- Avoid uncontrolled wildcard queries where they can become expensive
- Use appropriate indexes
- Be benchmarked on realistic dataset sizes

User input must never be concatenated directly into unsafe SQL.

---

# 42. Pagination Rules

Any endpoint that can return a large collection must support bounded responses.

Examples:

- Patients
- Cases
- Symptoms
- Remedies
- Search results

Do not return an unbounded database result set.

---

# 43. API Rate & Abuse Protection

Publicly accessible endpoints should have appropriate protection against excessive requests where necessary.

Particularly:

- Authentication
- Search
- Autocomplete
- Administrative endpoints

The exact rate-limiting strategy will depend on deployment requirements.

---

# 44. Accessibility Rules

The frontend should target WCAG Level AA.

Important requirements:

- Keyboard navigation
- Visible focus states
- Accessible labels
- Semantic HTML
- Sufficient contrast
- Screen-reader compatibility
- Accessible error messages

---

# 45. Responsive Design Rules

The application should work across common browser screen sizes.

Important clinical workflows should remain usable on:

- Desktop
- Laptop
- Tablet
- Smaller screens where practical

Responsive design must not compromise the usability of complex symptom-selection interfaces.

---

# 46. Browser Compatibility

The application should target modern browsers.

Primary development/testing targets should include current versions of:

- Google Chrome
- Microsoft Edge
- Mozilla Firefox

Safari compatibility should be considered where deployment requirements justify it.

---

# 47. Definition of Done

A feature is not considered complete merely because its code exists.

A feature should satisfy:

```text
Requirement understood
        ↓
Implementation complete
        ↓
Validation added
        ↓
Error handling added
        ↓
Tests added where appropriate
        ↓
UI integrated
        ↓
Documentation updated where required
        ↓
Reviewed
```

---

# 48. Code Quality Rules

Code should prioritize:

- Readability
- Small functions
- Clear naming
- Low coupling
- High cohesion
- Reusability
- Testability

Avoid clever code that is difficult for the team to understand.

---

# 49. Naming Rules

Use descriptive names.

Good:

```text
searchSymptoms()
calculateRemedyScore()
getCaseSymptoms()
validateImportedRecord()
```

Avoid:

```text
doStuff()
process()
x()
temp()
data2()
```

Variables should communicate meaning.

---

# 50. Function Size

Functions should generally perform one logical operation.

If a function begins handling:

- Validation
- Database access
- Ranking
- Formatting
- Logging
- HTTP responses

all at once, it should be split into appropriate layers.

---

# 51. Comments

Comments should explain **why**, not simply repeat **what** the code does.

Bad:

```python
# Loop through remedies
for remedy in remedies:
```

Useful:

```python
# Candidate remedies are retrieved first so the ranking engine
# does not evaluate the complete knowledge base for every case.
```

---

# 52. Configuration Over Hardcoding

Values that may change should be configurable.

Examples:

- Search result limit
- Ranking weights
- API URL
- Database URL
- Environment settings

Do not scatter magic numbers throughout the code.

---

# 53. Ranking Configuration

Ranking weights should be centralized.

For example:

```text
symptom_weight
keynote_weight
peculiar_weight
coverage_weight
```

The exact values must be validated by the project/domain team.

Do not hide scoring constants inside arbitrary functions.

---

# 54. Feature Flags

Feature flags may be used for incomplete or experimental functionality.

Example:

```text
ENABLE_AI_ANALYSIS=false
```

Experimental features should not accidentally appear as production functionality.

---

# 55. Experimental Code

Experimental code must be clearly identified.

Do not allow prototypes to become permanent production architecture without review.

---

# 56. Current Project Boundary

The following are currently established:

```text
Browser-based application
React + Vite frontend
Python + FastAPI backend
Supabase PostgreSQL
Kent Repertory HTML source
Python extraction pipeline
CSV intermediate datasets
Indexed search
Weighted remedy ranking
Explainable results
```

Any change to these core architectural decisions requires deliberate review.

---

# 57. Priority When Rules Conflict

When multiple considerations conflict, use this priority:

```text
1. Data integrity
2. Security
3. Correctness
4. Project requirements
5. Architecture
6. Performance
7. Maintainability
8. Convenience
```

Never sacrifice correctness or data integrity merely to make implementation easier.

---

# 58. AI Agent Working Procedure

Before implementing a task, an AI coding agent should follow:

```text
1. Read PRD.md
        ↓
2. Read Architecture.md
        ↓
3. Read Rules.md
        ↓
4. Inspect existing implementation
        ↓
5. Identify affected modules
        ↓
6. Plan minimal change
        ↓
7. Implement
        ↓
8. Test
        ↓
9. Review for architectural violations
        ↓
10. Report changes
```

---

# 59. AI Agent Reporting Format

After completing a significant task, the AI should report:

### Changed

Files/modules modified.

### Implemented

What functionality was added.

### Tested

What tests/checks were performed.

### Known Issues

Anything still incomplete.

### Next Step

The recommended next development task.

The AI must not claim success without actually verifying the implementation.

---

# 60. Final Rule

The most important rule of Symptom2Cure development is:

> **Build the system as an engineered product, not as a collection of generated code snippets.**

Every implementation decision should preserve:

**Correctness → Security → Data Integrity → Performance → Maintainability → Scalability**

The project should remain understandable to the entire team even when individual modules are developed with AI assistance.

---

**Symptom2Cure Rules.md v1.0**  
**Draft — August 2026**  
**Development rules are subject to revision as implementation reveals new technical requirements.**