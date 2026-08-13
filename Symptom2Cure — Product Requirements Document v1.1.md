# PRODUCT REQUIREMENTS DOCUMENT

# Symptom2Cure
## Intelligent Homeopathic Repertory Assistant

**Version:** 1.1  
**Status:** Draft — Revised  
**Date:** August 2026  
**Document Type:** Product Requirements Document  
**Audience:** Development Team, Faculty Advisors, Project Reviewers, Stakeholders

---

# IMPORTANT NOTICE

Symptom2Cure is a **clinical decision-support and educational research web application** designed to assist qualified homeopathic practitioners and students in analysing repertory-based cases.

The system does **not** provide medical diagnosis, prescribe medicines, recommend dosage, or replace professional clinical judgment.

All clinical decisions remain the responsibility of the qualified practitioner.

---

# 01 — PRODUCT OVERVIEW

## 1.1 Product Name

**Symptom2Cure**

## 1.2 Product Vision

Symptom2Cure is a browser-based web application designed to simplify and accelerate homeopathic case analysis by combining:

- Structured symptom search
- Repertory-based retrieval
- Weighted remedy ranking
- Explainable results
- Materia Medica references
- Patient and case management

The system aims to reduce the manual effort involved in searching large repertory datasets and comparing remedies across multiple symptoms.

The primary goal is to provide a **fast, structured, searchable, and explainable workflow** for homeopathic practitioners and students.

---

# 02 — PLATFORM PRINCIPLE

## 2.1 The System IS

- A browser-based homeopathic repertory assistant
- A symptom search and retrieval system
- A weighted remedy ranking engine
- An explainable recommendation interface
- A Materia Medica reference tool
- A structured patient-case management system
- A research-oriented homeopathic knowledge platform

## 2.2 The System IS NOT

- A medical diagnosis system
- A prescription generator
- A dosage recommendation system
- An autonomous treatment planner
- A replacement for professional clinical judgment
- An autonomous AI medical advisor

---

# 03 — PROBLEM STATEMENT

Homeopathic case analysis requires practitioners to search through large numbers of symptoms, rubrics, remedies, and repertory references.

For beginner practitioners and students, this process can become:

### Time Consuming

Manual searching across repertory references requires significant time.

### Difficult to Learn

Beginners may have difficulty identifying important symptoms and connecting them with relevant remedies.

### Error Prone

Manual lookup can result in missed symptoms, incorrect interpretation, or inconsistent comparison.

### Inconsistent

Results may vary depending on the practitioner's familiarity with repertory terminology, synonyms, and remedy relationships.

### Mentally Overwhelming

Large numbers of symptoms and remedy relationships make manual comparison difficult.

---

# 04 — PROPOSED SOLUTION

Symptom2Cure converts the traditional manual workflow into a structured browser-based workflow.

## Existing Workflow

Patient Case  
↓  
Manual Symptom Identification  
↓  
Repertory Lookup  
↓  
Multiple References  
↓  
Manual Remedy Comparison  
↓  
Candidate Remedies

## Symptom2Cure Workflow

Patient Case  
↓  
Symptom Selection  
↓  
Symptom Normalization  
↓  
Indexed Database Search  
↓  
Candidate Remedy Retrieval  
↓  
Weighted Remedy Ranking  
↓  
Explainable Results  
↓  
Remedy / Materia Medica Reference

The objective is to make the process significantly faster while keeping the reasoning visible to the practitioner.

---

# 05 — DATA SOURCE & KNOWLEDGE BASE

## 5.1 Primary Data Source

The primary source for the initial repertory knowledge base is **Kent Repertory HTML pages**.

The project uses Python scripts to extract structured information from these HTML pages.

The extracted information is transformed into structured CSV files containing separate fields/columns required by the application.

## 5.2 Data Processing Pipeline

The knowledge-base preparation pipeline is:

Kent Repertory HTML Pages  
↓  
Python Extraction Scripts  
↓  
Data Cleaning  
↓  
Data Transformation / Structuring  
↓  
CSV Dataset Generation  
↓  
Data Validation  
↓  
Supabase Import  
↓  
PostgreSQL Knowledge Base

## 5.3 Data Ingestion Responsibilities

The Python ingestion scripts are responsible for:

- Reading source HTML pages
- Extracting relevant repertory information
- Structuring extracted information into defined fields
- Cleaning extracted values
- Preparing CSV datasets
- Supporting repeatable data processing
- Preparing data for database import

The exact fields and transformations will follow the actual structure of the source data and the finalized database schema.

## 5.4 Runtime Database

CSV files are an **intermediate data-exchange format** and are not the application's runtime database.

The application's runtime knowledge base will be maintained in:

**Supabase PostgreSQL**

The web application will query the database through the application's backend/API layer.

---

# 06 — TARGET USERS

## 6.1 Primary Users

### BHMS Students

Needs:

- Easy symptom searching
- Guided case analysis
- Understandable remedy comparisons
- Repertory references
- Learning-oriented explanations

### Homeopathic Interns

Needs:

- Faster case analysis
- Structured symptom selection
- Remedy comparison
- Case history
- Reference material

### Beginner Homeopathic Doctors

Needs:

- Fast repertory lookup
- Multiple symptom analysis
- Explainable remedy ranking
- Remedy references
- Case management

## 6.2 Secondary Users

- Senior Homeopathic Practitioners
- Researchers
- Medical/Homeopathic Colleges
- Faculty and educators

## 6.3 Administrative Users

Administrators are responsible for:

- Knowledge-base management
- Data import
- Data validation
- Remedy/symptom data maintenance
- System administration

---

# 07 — PROJECT SCOPE

## 7.1 Version 1 Scope

The first version will focus on:

### Patient Management

- Create patient
- Edit patient
- Delete patient
- View patient history
- Maintain consultation/case notes

### Symptom Search

- Instant symptom search
- Autocomplete
- Partial matching
- Synonym recognition
- Category filtering
- Structured symptom selection

### Case Builder

- Add multiple symptoms
- Remove symptoms
- Change symptom importance
- Mark keynote symptoms
- Mark peculiar/characteristic symptoms
- Organize selected symptoms

### Remedy Search & Ranking

- Search remedy-symptom relationships
- Retrieve candidate remedies
- Calculate weighted scores
- Calculate symptom coverage
- Rank candidate remedies
- Display explainable results

### Remedy Details

- Remedy name
- Common name
- Kingdom
- Keynotes
- Characteristic symptoms
- Materia Medica information
- Repertory references
- Relationships
- Clinical-use information where available in the source dataset

### Case History

- Save cases
- Retrieve previous cases
- View case details
- Export individual cases

### Knowledge Base Administration

- Import structured data
- Maintain symptom data
- Maintain remedy data
- Update repertory information without modifying application source code

---

# 08 — CORE FEATURES

## 8.1 Patient Management

The system shall allow users to:

- Create patient records
- Edit patient information
- Delete patient records with confirmation
- View patient history
- Create structured consultation/case notes

---

## 8.2 Symptom Search Engine

The symptom search engine shall support:

- Instant search
- Autocomplete
- Partial matching
- Synonym recognition
- Category filtering

Potential categories include:

- Mental
- Physical
- General
- Modalities
- Sensations
- Locations
- Clinical

The search interface should provide results while the user is typing.

Target debounce:

**≤ 200 ms**

---

# 09 — CASE BUILDER

The Case Builder shall allow the practitioner to construct a structured case.

Users shall be able to:

- Add multiple symptoms
- Remove symptoms
- Reorder symptoms
- Assign importance/grade
- Mark keynote symptoms
- Mark peculiar/characteristic symptoms
- Review all selected symptoms before analysis

The initial grading approach should support the project's defined repertory grading methodology.

The final grading scale must be validated against the source data and domain-expert guidance before being treated as final.

---

# 10 — REMEDY RECOMMENDATION ENGINE

The recommendation engine shall compare selected case symptoms against the structured remedy-symptom database.

The conceptual process is:

Selected Case Symptoms  
↓  
Symptom IDs / Canonical Representation  
↓  
Indexed Database Retrieval  
↓  
Candidate Remedy Set  
↓  
Weighted Score Calculation  
↓  
Coverage Calculation  
↓  
Ranking  
↓  
Explanation

## 10.1 Ranking

The ranking engine shall consider factors such as:

- Matched symptoms
- Symptom grades
- Symptom importance
- Keynote status
- Peculiar/characteristic status
- Case coverage

The exact scoring formula and weights will be finalized during implementation and domain validation.

## 10.2 Search Logic

The system should support:

- AND
- OR
- NOT

operations across selected symptom criteria where technically applicable.

---

# 11 — EXPLAINABLE RESULTS

Symptom2Cure shall not simply return a list of remedy names.

For every significant recommendation, the system should explain:

### Matched Symptoms

Which case symptoms were matched.

### Missing Symptoms

Which selected case symptoms were not covered by the remedy.

### Grade Contribution

How matched symptom grades contributed to the ranking.

### Coverage

How much of the selected case is represented by the remedy.

### References

Relevant repertory/source references where available.

The objective is to make the ranking understandable rather than presenting an unexplained score.

---

# 12 — REMEDY DETAIL VIEW

A remedy detail page should provide available structured information such as:

- Remedy name
- Common name
- Kingdom
- Description
- Essence
- Keynotes
- Characteristic symptoms
- Relationships
- Materia Medica narrative
- Repertory references
- Modalities
- Clinical-use information where present in the approved dataset

The displayed information must be traceable to the project's approved knowledge sources.

---

# 13 — SYSTEM ACCESS MODEL

Symptom2Cure is a **browser-based web application**.

The primary runtime flow is:

Web Browser  
↓  
React Frontend  
↓  
Backend API  
↓  
Supabase PostgreSQL  
↓  
Response  
↓  
React Interface

The application requires network connectivity to communicate with the deployed backend and Supabase services.

**Offline-first operation is not a Version 1 requirement.**

---

# 14 — FUNCTIONAL REQUIREMENTS

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Allow users to create, edit and delete patient cases | Must |
| FR-002 | Allow multiple symptoms to be added to a case | Must |
| FR-003 | Provide symptom suggestions while typing | Must |
| FR-004 | Return ranked candidate remedies | Must |
| FR-005 | Display weighted scores and symptom coverage | Must |
| FR-006 | Allow filtering of remedy results | Should |
| FR-007 | Store and retrieve previous cases | Must |
| FR-008 | Allow individual cases to be exported | Should |
| FR-009 | Explain each significant remedy recommendation | Must |
| FR-010 | Allow administrators to update knowledge-base data without application-code changes | Must |
| FR-011 | Support AND, OR and NOT search logic | Should |
| FR-012 | Display remedy and Materia Medica information | Must |
| FR-013 | Allow keynote/peculiar symptom marking | Must |
| FR-014 | Display a persistent medical disclaimer | Must |
| FR-015 | Search the centralized PostgreSQL knowledge base through the application backend | Must |
| FR-016 | Import validated structured datasets into Supabase | Must |
| FR-017 | Support repeatable Python-based data ingestion from source HTML | Must |

---

# 15 — NON-FUNCTIONAL REQUIREMENTS

## 15.1 Performance

| Requirement | Target |
|---|---|
| Symptom search response | < 500 ms target |
| Remedy ranking | < 1 second target |
| Application initial load | < 3 seconds target |
| Dataset scale | 1M+ indexed records target |

These are **engineering targets**, not currently validated performance results.

Actual performance will be measured through benchmarking during implementation.

---

## 15.2 Scalability

The architecture should support:

- 1M+ indexed repertory/symptom relationship records
- Increasing numbers of symptoms
- Increasing remedy-symptom mappings
- Additional repertory sources
- Future knowledge-base expansion

Database indexes and query optimization should be used to avoid unnecessary full-table scans.

---

# 16 — RELIABILITY

The application should provide:

- Graceful error handling
- Clear user-facing error messages
- Database integrity
- Transaction-safe database operations
- Validation of imported datasets
- Protection against malformed data
- Backup/recovery mechanisms appropriate to the deployment environment

---

# 17 — SECURITY

Security requirements include:

- Secure authentication
- Role-based access where required
- Server-side validation
- Parameterized/database-safe queries
- Secure API communication
- Protection of patient information
- Appropriate database access controls
- Audit logging for sensitive operations where required

The exact authentication and authorization model remains subject to final architecture decisions.

---

# 18 — DATA INGESTION & QUALITY REQUIREMENTS

Because the project's knowledge base originates from HTML source material, data quality is a core requirement.

The ingestion pipeline should include:

### Extraction

Retrieve structured information from Kent Repertory HTML pages.

### Cleaning

Remove unwanted HTML artifacts and normalize extracted values.

### Transformation

Convert extracted content into the project's defined data fields.

### Validation

Check for:

- Missing required fields
- Duplicate records
- Invalid relationships
- Invalid grades
- Unexpected values
- Broken references

### Loading

Import validated data into Supabase PostgreSQL.

The ingestion process should be repeatable so that the knowledge base can be regenerated or updated without manually editing thousands of records.

---

# 19 — DATA ARCHITECTURE REQUIREMENT

The runtime application should use structured relational data rather than storing the entire repertory as unstructured text.

Conceptually, the knowledge base will contain entities such as:

- Symptoms
- Remedies
- Remedy-Symptom Relationships
- Repertory Entries
- Materia Medica Information
- Patients
- Cases

The exact schema will be defined in the architecture/database design stage.

---

# 20 — SEARCH PERFORMANCE STRATEGY

The system should avoid a naive approach where every remedy-symptom record is scanned for every user search.

### Inefficient Approach

User Symptoms  
↓  
Scan 1M+ records  
↓  
Compare every record  
↓  
Calculate scores

### Proposed Approach

User Symptoms  
↓  
Normalize / identify canonical symptoms  
↓  
Indexed database lookup  
↓  
Retrieve relevant remedy candidates  
↓  
Calculate ranking only for candidates  
↓  
Return top results

This approach reduces unnecessary computation and provides a foundation for scaling the search system.

---

# 21 — USER EXPERIENCE REQUIREMENTS

The application should provide:

- Clean clinical interface
- Minimal learning curve
- Clear navigation
- Fast search feedback
- Responsive design
- Keyboard-friendly navigation
- Clear symptom chips/tags
- Clear remedy ranking
- Explainable result presentation
- Persistent medical disclaimer

The application is intended to feel like a professional clinical/research software product rather than a generic CRUD application.

---

# 22 — ACCESSIBILITY

The application should target:

**WCAG Level AA**

Where practical, this includes:

- Keyboard navigation
- Sufficient contrast
- Screen-reader-friendly structure
- Meaningful labels
- Accessible form controls
- Clear error messages
- Responsive layouts

---

# 23 — OUT OF SCOPE — VERSION 1

The following are explicitly excluded from Version 1:

| Feature | Reason |
|---|---|
| Automatic prescription generation | Outside decision-support scope |
| Dosage recommendation | Requires clinical oversight |
| Autonomous treatment recommendation | Outside project scope |
| Disease diagnosis | Not a diagnostic platform |
| Telemedicine | Separate product capability |
| Native mobile application | Separate future product track |
| AI-generated medical advice | Future capability requiring appropriate validation |
| Cloud collaboration between clinics | Future version |
| Voice symptom entry | Future version |
| OCR prescription processing | Future version |

---

# 24 — FUTURE ROADMAP

## Version 1

- Browser-based web application
- Symptom search
- Autocomplete
- Case builder
- Weighted remedy ranking
- Explainable results
- Remedy details
- Materia Medica references
- Patient management
- Supabase/PostgreSQL knowledge base
- Python data-ingestion pipeline
- Knowledge-base administration

## Future Versions

Potential future capabilities include:

- AI-assisted case analysis
- AI differential remedy analysis
- Case similarity search
- Voice symptom entry
- OCR-based data extraction
- Cloud synchronization improvements
- Multi-clinic functionality
- Mobile application
- Advanced analytics
- Telemedicine integration

These features are not part of the current implementation scope.

---

# 25 — CURRENT DEVELOPMENT FOUNDATION

The project has already established the initial foundation for implementation.

### Completed / Established

- Product requirements defined
- Project scope defined
- Architecture direction established
- Project documentation structure established
- Kent Repertory identified as the primary initial data source
- Python-based extraction approach established
- Structured CSV generation approach established
- Supabase/PostgreSQL selected for the application database
- Initial draft database established in Supabase

### Current Focus

The project is transitioning from requirements and database preparation into application implementation.

The next major development areas are:

1. Finalize and validate the database structure
2. Complete the data-ingestion pipeline
3. Import validated datasets into Supabase
4. Develop backend APIs
5. Implement symptom search
6. Implement remedy retrieval and ranking
7. Build the React frontend
8. Integrate frontend, backend and database
9. Benchmark search performance
10. Test the complete workflow

---

# 26 — SUCCESS CRITERIA

The project will be considered technically successful when it demonstrates:

### Functionality

- Users can create cases
- Users can search and select symptoms
- The system retrieves relevant remedies
- Remedies are ranked
- Results are explainable
- Remedy information can be inspected

### Data

- Kent-derived data is successfully transformed into structured datasets
- Validated datasets can be imported into Supabase
- Database relationships are consistent
- Search data is properly indexed

### Performance

Target:

- Symptom search < 500 ms
- Remedy ranking < 1 second
- 1M+ indexed records supported by the database/search architecture

These targets must be verified through actual benchmarking.

### Usability

- New users can understand the workflow quickly
- Symptom selection is intuitive
- Results are easy to interpret
- Interface works across common browser screen sizes

---

# 27 — RISKS & OPEN QUESTIONS

| # | Question / Risk | Impact |
|---|---|---|
| 1 | Who validates the remedy-symptom mappings and grades? | High — data accuracy |
| 2 | What licensing/usage restrictions apply to Kent Repertory and other source material? | High — legal/data usage |
| 3 | What exact database schema best represents the extracted repertory structure? | High — architecture |
| 4 | What grading scale should be consistently used across imported sources? | Medium — ranking accuracy |
| 5 | What exact fields should be retained from the HTML source? | Medium — data completeness |
| 6 | How should synonyms and canonical symptom names be normalized? | High — search quality |
| 7 | What authentication and user-role model is required for Version 1? | Medium — security |
| 8 | What export formats are required? | Low — feature scope |
| 9 | What indexes provide the best search performance for the final dataset? | High — performance |
| 10 | How should imported data be versioned and updated? | Medium — maintainability |

---

# 28 — KEY PRODUCT PRINCIPLES

Symptom2Cure development shall follow these principles:

### 1. Explainability First

The system should show why a remedy was ranked.

### 2. Data Quality First

The recommendation engine is only as reliable as the underlying structured data.

### 3. Performance by Design

Large datasets must be handled through appropriate indexing and query strategies rather than brute-force scanning.

### 4. Browser-Based Architecture

The primary user experience is delivered through a web browser.

### 5. Separation of Concerns

Data extraction, backend logic, database operations, search, ranking and frontend presentation should remain modular.

### 6. Human-in-the-Loop

The practitioner remains responsible for interpreting results and making clinical decisions.

### 7. Incremental Development

The project will be developed in clearly defined phases rather than attempting to implement the complete system simultaneously.

---

# 29 — FINAL PRODUCT DEFINITION

Symptom2Cure is a **browser-based, database-backed homeopathic repertory decision-support application** that converts structured repertory data into a searchable and explainable remedy-analysis workflow.

Its core technical pipeline consists of:

**Data Layer**

Kent Repertory HTML  
→ Python Extraction  
→ Structured CSV  
→ Validation  
→ Supabase PostgreSQL

**Application Layer**

React Web Application  
→ FastAPI Backend  
→ Search & Ranking Engine  
→ Supabase PostgreSQL

**User Workflow**

Patient  
→ Case  
→ Symptoms  
→ Search  
→ Candidate Remedies  
→ Weighted Ranking  
→ Explainable Results  
→ Reference Information

The Version 1 objective is to establish a reliable, scalable foundation for fast repertory search and explainable remedy comparison through a modern browser-based application.

---

**Symptom2Cure PRD v1.1**  
**Draft — August 2026**  
**Subject to revision based on implementation findings, database validation, and faculty/domain-expert feedback.**