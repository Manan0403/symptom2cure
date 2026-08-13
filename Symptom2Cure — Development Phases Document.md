# Symptom2Cure
## Development Phases & Implementation Roadmap

**Version:** 1.0  
**Status:** Draft — Development Baseline  
**Date:** August 2026  
**Project:** Symptom2Cure

---

# 1. Purpose

This document defines the development roadmap for Symptom2Cure.

The project will be developed incrementally rather than attempting to implement the complete system simultaneously.

Each phase should produce a measurable outcome and should leave the project in a stable state before the next major phase begins.

The roadmap prioritizes:

1. Data correctness
2. Database foundation
3. Backend functionality
4. Search performance
5. Ranking correctness
6. Frontend integration
7. Testing
8. Optimization
9. Final deployment

---

# 2. Development Philosophy

Symptom2Cure follows an incremental development strategy.

```text
Requirements
     ↓
Data Foundation
     ↓
Database
     ↓
Backend Foundation
     ↓
Search
     ↓
Ranking
     ↓
Frontend
     ↓
Integration
     ↓
Testing
     ↓
Optimization
     ↓
Deployment
```

The team should avoid building advanced features before the underlying data and core search workflow are reliable.

---

# 3. Project Phase Overview

| Phase | Name | Priority | Status |
|---|---|---|---|
| 0 | Requirements & Project Foundation | Critical | Completed |
| 1 | Knowledge Base & Data Pipeline | Critical | In Progress |
| 2 | Database Finalization | Critical | In Progress |
| 3 | Backend Foundation | Critical | Upcoming |
| 4 | Symptom Search | Critical | Upcoming |
| 5 | Case Management | High | Upcoming |
| 6 | Remedy Retrieval & Ranking | Critical | Upcoming |
| 7 | Frontend Application | High | Upcoming |
| 8 | Full System Integration | Critical | Upcoming |
| 9 | Testing & Validation | Critical | Upcoming |
| 10 | Performance Optimization | High | Upcoming |
| 11 | Final UI/UX & Documentation | Medium | Upcoming |
| 12 | Deployment & Final Demonstration | Critical | Upcoming |

---

# 4. Phase 0 — Requirements & Project Foundation

## Objective

Establish a clear understanding of the product before significant implementation begins.

## Tasks

- Define project problem
- Define target users
- Define project scope
- Define Version 1 features
- Define non-functional requirements
- Establish technology direction
- Establish architecture
- Establish development rules
- Define development phases
- Define design direction

## Documents

- PRD.md
- Architecture.md
- Rules.md
- Phases.md
- Design.md
- Memory.md

## Deliverables

- Approved project requirements
- Architecture baseline
- Development rules
- Initial roadmap

## Status

**Completed**

---

# 5. Phase 1 — Knowledge Base & Data Pipeline

## Objective

Build a reliable and repeatable pipeline for converting Kent Repertory HTML pages into structured datasets.

## Input

Kent Repertory HTML pages.

## Pipeline

```text
Kent HTML
    ↓
Python Extraction
    ↓
Raw Structured Data
    ↓
Cleaning
    ↓
Normalization
    ↓
CSV Generation
    ↓
Validation
```

## Tasks

### 1. Source Analysis

Understand:

- HTML structure
- Repertory hierarchy
- Symptom/rubric structure
- Remedy mappings
- Grades
- Source references

### 2. Extractor

Develop Python scripts to extract required information.

### 3. Transformer

Implement:

- Text cleaning
- Normalization
- Field mapping
- Relationship preparation

### 4. CSV Generator

Generate structured CSV files.

### 5. Validation

Detect:

- Missing values
- Duplicate records
- Invalid relationships
- Unexpected values
- Extraction errors

### 6. Data Quality Report

Generate:

- Input record count
- Valid record count
- Invalid record count
- Duplicate count
- Warning count

## Deliverables

- Python extraction scripts
- Transformation scripts
- Validation scripts
- Structured CSV datasets
- Data-quality report

## Acceptance Criteria

- Extraction is repeatable
- Data is structurally valid
- Duplicate handling is defined
- Important source relationships are preserved
- CSV can be imported into the database

## Status

**In Progress**

---

# 6. Phase 2 — Database Finalization

## Objective

Create the production-ready Supabase PostgreSQL schema.

## Tasks

- Finalize entities
- Define primary keys
- Define foreign keys
- Define relationships
- Define constraints
- Define indexes
- Define database naming conventions
- Create migrations/schema scripts
- Import validated data
- Verify record counts

## Core Data Areas

```text
Users
Patients
Cases
Symptoms
Case Symptoms
Remedies
Remedy-Symptom Relationships
Repertory Entries
Sources
Materia Medica
```

The exact schema should follow the validated structure of the actual Kent dataset.

## Import Flow

```text
Validated CSV
      ↓
Import Preparation
      ↓
Supabase PostgreSQL
      ↓
Constraint Validation
      ↓
Index Creation
      ↓
Database Verification
```

## Deliverables

- Final database schema
- Database migrations
- Imported knowledge base
- Indexes
- Data verification report

## Acceptance Criteria

- Valid foreign-key relationships
- No unintended duplicate mappings
- Required constraints are active
- Search-critical columns are indexed
- Dataset imports successfully
- Record counts match the validated source dataset

## Status

**In Progress**

---

# 7. Phase 3 — Backend Foundation

## Objective

Build the FastAPI application and establish the backend architecture.

## Tasks

- Create FastAPI project
- Configure environments
- Establish project structure
- Configure Supabase/PostgreSQL connection
- Create database access layer
- Create schemas
- Create service layer
- Create API routing
- Configure error handling
- Configure logging
- Establish authentication foundation

## Initial API Areas

```text
/api/v1/auth
/api/v1/patients
/api/v1/cases
/api/v1/symptoms
/api/v1/remedies
/api/v1/search
```

## Deliverables

- Running FastAPI application
- Database connectivity
- Health-check endpoint
- Initial API structure
- Validation layer
- Error-handling system

## Acceptance Criteria

- Backend starts reliably
- Database connection works
- API validation works
- Errors follow the standard response format
- No credentials are hardcoded

## Status

**Upcoming**

---

# 8. Phase 4 — Symptom Search

## Objective

Implement fast and scalable symptom retrieval.

This is one of the highest-priority technical phases.

## User Flow

```text
User types symptom
       ↓
Frontend debounce
       ↓
API request
       ↓
Search service
       ↓
PostgreSQL indexed query
       ↓
Matching symptoms
       ↓
API response
       ↓
Autocomplete
```

## Tasks

- Exact search
- Prefix search
- Partial matching
- Category filtering
- Synonym handling
- Result limiting
- Search indexes
- Query optimization
- Search API

## Performance Target

Initial target:

**< 500 ms**

Actual performance must be benchmarked.

## Dataset Target

The search architecture must be tested against the expected large dataset, including the eventual 1M+ record scale where applicable.

## Acceptance Criteria

- Relevant symptoms are returned
- Search is responsive
- Results are bounded
- Queries use appropriate indexes
- No complete dataset is transferred to the browser
- Performance is measured

## Status

**Upcoming**

---

# 9. Phase 5 — Case Management

## Objective

Implement the user workflow for creating and managing patient cases.

## Tasks

### Patient

- Create
- View
- Edit
- Delete

### Case

- Create
- Save
- Edit
- View
- Delete/archive
- Add notes

### Case Symptoms

- Add symptom
- Remove symptom
- Assign importance
- Mark keynote
- Mark peculiar/characteristic
- Reorder where required

## Workflow

```text
Patient
   ↓
Create Case
   ↓
Search Symptoms
   ↓
Select Symptoms
   ↓
Assign Importance
   ↓
Review Case
   ↓
Analyze
```

## Acceptance Criteria

A user must be able to create a complete case and save it without interacting directly with the database.

## Status

**Upcoming**

---

# 10. Phase 6 — Remedy Retrieval & Ranking

## Objective

Implement the core analytical engine.

## Step 1 — Candidate Retrieval

```text
Selected Symptoms
      ↓
Indexed Relationship Search
      ↓
Candidate Remedies
```

## Step 2 — Scoring

```text
Candidate Remedies
      ↓
Symptom Matching
      ↓
Grade Contribution
      ↓
Importance Weight
      ↓
Keynote/Peculiar Contribution
      ↓
Coverage
      ↓
Final Score
```

## Step 3 — Ranking

```text
Score
 ↓
Sort
 ↓
Top Candidates
```

## Step 4 — Explanation

For every significant result:

```text
Remedy
 ↓
Matched Symptoms
 ↓
Missing Symptoms
 ↓
Score Contributions
 ↓
Coverage
 ↓
References
```

## Tasks

- Implement candidate retrieval
- Implement scoring engine
- Implement weighting configuration
- Implement coverage calculation
- Implement ranking
- Implement explanation generation
- Unit test ranking logic
- Validate results against expected examples

## Important Rule

The team must not invent clinical weighting rules without domain validation.

## Acceptance Criteria

- Same input produces deterministic output
- Ranking logic is independently testable
- Scores can be explained
- Candidate retrieval is separate from ranking
- Results are reproducible

## Status

**Upcoming**

---

# 11. Phase 7 — Frontend Application

## Objective

Build the browser-based user interface.

## Major Screens

### Authentication

- Login
- Session handling

### Dashboard

- Overview
- Recent cases
- Quick actions

### Patients

- Patient list
- Patient profile
- Case history

### Case Builder

- Symptom search
- Selected symptom list
- Importance controls
- Keynote/peculiar marking
- Case analysis

### Results

- Ranked remedies
- Score
- Coverage
- Matched symptoms
- Explanation

### Remedy Details

- Remedy information
- Repertory references
- Materia Medica

### Administration

- Data management
- Import status
- Knowledge-base management where required

## Acceptance Criteria

- UI follows Design.md
- Responsive layouts work
- Search interaction is smooth
- Loading states exist
- Error states exist
- Accessibility requirements are considered

## Status

**Upcoming**

---

# 12. Phase 8 — Full System Integration

## Objective

Connect the complete system.

## Integration

```text
React
 ↓
FastAPI
 ↓
Search
 ↓
Ranking
 ↓
Supabase
```

## Main End-to-End Flow

```text
Login
 ↓
Dashboard
 ↓
Patient
 ↓
Case
 ↓
Symptoms
 ↓
Search
 ↓
Selection
 ↓
Analysis
 ↓
Candidate Retrieval
 ↓
Ranking
 ↓
Explainable Results
 ↓
Remedy Details
 ↓
Save Case
```

## Tasks

- Connect frontend APIs
- Integrate authentication
- Integrate symptom search
- Integrate case management
- Integrate ranking
- Integrate remedy details
- Handle API errors
- Handle loading states
- Handle empty states

## Acceptance Criteria

A user can complete the primary workflow from login to remedy results without manual database intervention.

## Status

**Upcoming**

---

# 13. Phase 9 — Testing & Validation

## Objective

Verify correctness and reliability before optimization and deployment.

## Testing Layers

```text
Unit Testing
     ↓
Integration Testing
     ↓
API Testing
     ↓
Frontend Testing
     ↓
End-to-End Testing
     ↓
Data Validation
```

## Backend Testing

Test:

- Authentication
- Patient operations
- Case operations
- Symptom search
- Remedy retrieval
- Ranking
- Error handling

## Data Pipeline Testing

Test:

- HTML extraction
- Transformation
- CSV generation
- Validation
- Import
- Duplicate handling

## Frontend Testing

Test:

- Forms
- Search
- Case builder
- Results
- Navigation
- Error states

## End-to-End Testing

At minimum:

```text
Login
→ Create Patient
→ Create Case
→ Select Symptoms
→ Analyze Case
→ View Remedies
```

## Acceptance Criteria

- Critical workflows pass
- No known critical defects
- Data integrity checks pass
- Ranking tests pass
- API tests pass

## Status

**Upcoming**

---

# 14. Phase 10 — Performance Optimization

## Objective

Validate and optimize the system against realistic data volumes.

Optimization must be evidence-driven.

## Benchmarks

Measure:

- Symptom autocomplete latency
- Search query latency
- Candidate retrieval latency
- Ranking latency
- API response time
- Database query time
- Initial application load

## Dataset Sizes

Where practical, benchmark using progressively larger datasets:

```text
10K
↓
100K
↓
500K
↓
1M+
```

## Optimization Areas

### Database

- Query plans
- Indexes
- Joins
- Data types
- Query structure

### Backend

- Serialization
- Query count
- Response size
- Unnecessary processing

### Frontend

- Bundle size
- Lazy loading
- Rendering
- API request frequency

## Acceptance Criteria

Performance targets are measured and documented.

## Status

**Upcoming**

---

# 15. Phase 11 — Final UI/UX & Documentation

## Objective

Polish the application and complete project documentation.

## Tasks

- UI consistency review
- Accessibility review
- Responsive testing
- Error-message review
- Loading-state review
- Medical disclaimer review
- Documentation updates
- API documentation
- Database documentation
- Installation guide
- User guide

## Deliverables

- Final UI
- Updated documentation
- Installation instructions
- User instructions
- Technical documentation

## Status

**Upcoming**

---

# 16. Phase 12 — Deployment & Final Demonstration

## Objective

Deploy and demonstrate the completed system.

## Tasks

- Configure production environment
- Configure frontend deployment
- Configure backend deployment
- Configure Supabase production settings
- Configure environment variables
- Verify authentication
- Verify database access
- Run smoke tests
- Perform final backup
- Prepare demonstration

## Final Demonstration Workflow

```text
Login
 ↓
Create Patient
 ↓
Create Case
 ↓
Search Symptom
 ↓
Select Multiple Symptoms
 ↓
Mark Importance
 ↓
Analyze
 ↓
Retrieve Candidates
 ↓
Rank Remedies
 ↓
Explain Results
 ↓
Open Remedy
 ↓
Save Case
```

## Status

**Upcoming**

---

# 17. Parallel Workstreams

Some development activities can happen in parallel.

```text
                    ┌── Data Pipeline
                    │
Requirements ───────┼── Database
                    │
                    ├── Backend
                    │
                    └── UI/UX
```

However, the following dependencies must be respected:

```text
Data Structure
      ↓
Database
      ↓
Search
      ↓
Ranking
      ↓
Integration
```

Frontend development can begin before the backend is complete using mock data, but final integration depends on stable API contracts.

---

# 18. Suggested Team Distribution

For a group project, work can be divided into parallel responsibilities.

## Member/Team A — Data Engineering

Responsible for:

- Kent HTML analysis
- Python extraction
- Transformation
- Validation
- CSV generation
- Database imports

## Member/Team B — Backend

Responsible for:

- FastAPI
- API design
- Services
- Repository layer
- Authentication
- Database integration

## Member/Team C — Search & Ranking

Responsible for:

- Search queries
- Indexing
- Candidate retrieval
- Ranking algorithm
- Explainability
- Performance benchmarking

## Member/Team D — Frontend

Responsible for:

- React
- Dashboard
- Case builder
- Symptom search UI
- Results UI
- Remedy details

The actual allocation should depend on team size and individual skills.

---

# 19. Phase Dependencies

```text
Phase 0
Requirements
    │
    ├───────────────┐
    ▼               ▼
Phase 1          Phase 7
Data Pipeline    Frontend Foundation
    │               │
    ▼               │
Phase 2             │
Database            │
    │               │
    ▼               │
Phase 3             │
Backend             │
    │               │
    ▼               │
Phase 4             │
Search              │
    │               │
    ▼               │
Phase 5             │
Cases               │
    │               │
    ▼               │
Phase 6             │
Ranking             │
    │               │
    └───────┬───────┘
            ▼
        Phase 8
       Integration
            │
            ▼
        Phase 9
        Testing
            │
            ▼
        Phase 10
      Optimization
            │
            ▼
        Phase 11
      Finalization
            │
            ▼
        Phase 12
       Deployment
```

---

# 20. Milestone Strategy

## Milestone 1 — Foundation

Requirements and architecture complete.

**Result:**

Team knows exactly what is being built.

---

## Milestone 2 — Data Ready

Kent data successfully transformed, validated and imported.

**Result:**

Searchable knowledge base exists.

---

## Milestone 3 — Backend Ready

FastAPI can communicate with PostgreSQL.

**Result:**

Core APIs available.

---

## Milestone 4 — Search Ready

Symptoms can be searched efficiently.

**Result:**

Core retrieval capability works.

---

## Milestone 5 — Analysis Ready

Candidate remedies can be ranked and explained.

**Result:**

Core Symptom2Cure intelligence workflow exists.

---

## Milestone 6 — UI Ready

Browser interface is connected to the backend.

**Result:**

Complete user-facing workflow exists.

---

## Milestone 7 — Tested

Core workflows and data pipeline are validated.

**Result:**

System is stable enough for optimization.

---

## Milestone 8 — Final System

Performance optimized and documentation completed.

**Result:**

Project ready for final demonstration.

---

# 21. Review Gates

Each major phase should have a review gate.

## Gate 1 — Data Review

Questions:

- Is extraction correct?
- Are important relationships preserved?
- Is data quality acceptable?

## Gate 2 — Database Review

Questions:

- Is schema normalized appropriately?
- Are relationships correct?
- Are indexes appropriate?

## Gate 3 — Search Review

Questions:

- Are results relevant?
- Is search fast?
- Are queries scalable?

## Gate 4 — Ranking Review

Questions:

- Is scoring deterministic?
- Is the methodology documented?
- Can results be explained?

## Gate 5 — Integration Review

Questions:

- Does the complete workflow work?
- Are errors handled?

## Gate 6 — Performance Review

Questions:

- Does the system meet target latency?
- What are the bottlenecks?
- Are optimizations measurable?

---

# 22. Definition of Phase Completion

A phase is complete only when:

- Planned implementation is finished
- Required tests are passed
- Known critical issues are resolved
- Deliverables exist
- Documentation is updated where necessary
- The next phase can begin without unresolved blocking dependencies

"Code exists" does not mean "phase complete."

---

# 23. Current Project Status

As of the current development stage:

### Completed

- Project concept
- Product requirements
- Scope definition
- Architecture baseline
- Development rules
- Initial roadmap
- Design direction
- Initial Supabase database foundation

### In Progress

- Kent Repertory data extraction
- CSV dataset preparation
- Database structure refinement
- Knowledge-base preparation

### Upcoming

- Final database validation
- Backend
- Search engine
- Ranking engine
- Frontend implementation
- Integration
- Testing
- Performance benchmarking

---

# 24. Priority Matrix

| Feature | Priority |
|---|---|
| Data extraction | P0 |
| Data validation | P0 |
| Database | P0 |
| Symptom search | P0 |
| Candidate retrieval | P0 |
| Remedy ranking | P0 |
| Explainability | P0 |
| Case management | P0 |
| Frontend integration | P0 |
| Authentication | P1 |
| Remedy detail pages | P1 |
| Export | P1 |
| Advanced filtering | P1 |
| Analytics | P2 |
| AI assistance | P3 |
| Voice input | P3 |
| OCR | P3 |
| Mobile application | P3 |

### Priority Definitions

**P0:** Required for Version 1  
**P1:** Important but can follow core functionality  
**P2:** Optional enhancement  
**P3:** Future scope

---

# 25. Critical Path

The project's critical technical path is:

```text
Kent Data
   ↓
Extraction
   ↓
Validation
   ↓
Database
   ↓
Indexed Search
   ↓
Candidate Retrieval
   ↓
Ranking
   ↓
API
   ↓
Frontend
   ↓
Integration
   ↓
Testing
   ↓
Benchmarking
```

The team should prioritize this path over secondary features.

---

# 26. What Should Not Delay the MVP

The following should not block the core Version 1 system:

- AI integration
- Voice input
- OCR
- Mobile application
- Advanced analytics
- Complex animations
- Multi-clinic features
- Large-scale cloud infrastructure

The core product must work first.

---

# 27. MVP Completion Criteria

The MVP is complete when a user can:

```text
1. Log in
2. Create a patient
3. Create a case
4. Search symptoms
5. Select multiple symptoms
6. Assign symptom importance
7. Submit the case
8. Retrieve candidate remedies
9. View ranked remedies
10. Understand why remedies were ranked
11. Open remedy details
12. Save the case
```

And technically:

```text
React
   ↓
FastAPI
   ↓
Search
   ↓
Ranking
   ↓
Supabase PostgreSQL
```

works as one integrated system.

---

# 28. Final Development Principle

Symptom2Cure should be developed from the **data foundation outward**.

The team should not attempt to make the application visually complete while the knowledge base and search logic remain undefined.

The correct progression is:

> **Reliable Data → Reliable Search → Reliable Ranking → Reliable API → Reliable UI → Reliable Product**

The objective is not simply to complete as many features as possible.

The objective is to produce a system whose **core workflow is correct, measurable, explainable, and technically defensible.**

---

**Symptom2Cure Phases.md v1.0**  
**Draft — August 2026**  
**Subject to revision as implementation progress, testing results, and project constraints become clearer.**