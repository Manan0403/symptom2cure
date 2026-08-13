# Symptom2Cure
## Design System & UI/UX Guidelines

**Version:** 1.0  
**Status:** Draft — Design Baseline  
**Date:** August 2026  
**Project:** Symptom2Cure  
**Audience:** Development Team, UI/UX Designers, AI Coding Agents

---

# 1. Purpose

This document defines the visual identity, UI/UX principles, design system, typography, colors, component standards, layouts, interaction patterns, and accessibility requirements for Symptom2Cure.

The design should communicate:

- Medical professionalism
- Trust
- Clarity
- Calmness
- Accuracy
- Technical reliability
- Ease of use

The application should feel like a **modern clinical/research software product**, not a generic dashboard or consumer health application.

---

# 2. Design Philosophy

The primary design principle is:

> **Clinical clarity over visual complexity.**

The interface should help users focus on:

1. Patient information
2. Symptoms
3. Case construction
4. Remedy analysis
5. Evidence/references
6. Clinical decision support

Visual elements should support these tasks rather than distract from them.

---

# 3. Design Principles

## 3.1 Clarity First

Important information must be immediately understandable.

Avoid:

- Dense paragraphs
- Excessive decoration
- Ambiguous icons
- Hidden actions
- Unnecessary visual effects

---

## 3.2 Progressive Disclosure

Do not display every available piece of information at once.

Example:

```text
Remedy Result
    ↓
Basic Score
    ↓
Matched Symptoms
    ↓
Score Explanation
    ↓
Detailed References
```

Users should be able to progressively explore more detail.

---

## 3.3 Consistency

The same action should look and behave the same throughout the application.

Examples:

- Search
- Add
- Edit
- Delete
- Save
- Analyze
- Back
- Cancel

---

## 3.4 Information Hierarchy

The interface should visually distinguish:

```text
Primary Information
        ↓
Secondary Information
        ↓
Supporting Information
        ↓
Metadata
```

Important clinical information must have stronger visual hierarchy than decorative content.

---

# 4. Brand Identity

## Product Name

**Symptom2Cure**

## Brand Positioning

A modern digital repertory and clinical decision-support platform.

## Suggested Brand Message

> **Structured Symptoms. Intelligent Search. Explainable Results.**

This is a product positioning statement and should not be interpreted as a claim of medical efficacy.

---

# 5. Visual Direction

The visual identity should combine:

### Medical

- Clean
- Trustworthy
- Calm
- Clinical

### Technology

- Structured
- Modern
- Precise
- Efficient

### Academic / Research

- Evidence-oriented
- Information-dense where necessary
- Organized
- Explainable

The final interface should sit between a **modern clinical application** and a **professional research platform**.

---

# 6. Color System

The primary palette should use cool medical tones.

## 6.1 Primary

### Deep Navy

```text
#0F2747
```

Use for:

- Primary navigation
- Headings where appropriate
- Strong visual anchors
- Important interface elements

---

## 6.2 Primary Blue

```text
#2563EB
```

Use for:

- Primary buttons
- Active states
- Links
- Selected controls
- Interactive elements

---

## 6.3 Medical Teal

```text
#0F766E
```

Use for:

- Positive clinical states
- Secondary actions
- Medical information
- Supporting accents

---

## 6.4 Success

```text
#16A34A
```

Use for:

- Successful operations
- Validated data
- Completed status
- Positive confirmation

---

## 6.5 Warning

```text
#D97706
```

Use for:

- Warnings
- Incomplete information
- Validation issues
- Attention-required states

---

## 6.6 Error

```text
#DC2626
```

Use for:

- Errors
- Destructive actions
- Validation failures
- Critical warnings

---

## 6.7 Neutral Colors

### Background

```text
#F8FAFC
```

### Surface

```text
#FFFFFF
```

### Border

```text
#E2E8F0
```

### Primary Text

```text
#0F172A
```

### Secondary Text

```text
#475569
```

### Muted Text

```text
#64748B
```

---

# 7. Color Usage Rules

Do not use colors purely for decoration.

Colors should communicate meaning.

Example:

```text
Green  → Success / Completed
Blue   → Active / Primary
Teal   → Supporting medical information
Amber  → Warning / Attention
Red    → Error / Destructive
Gray   → Disabled / Secondary
```

Avoid using red or orange extensively because the application should maintain a calm clinical appearance.

---

# 8. Typography

## Primary Font

Recommended:

**Inter**

Fallback:

```text
Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Inter should be used consistently throughout the application.

---

# 9. Typography Scale

## Display

```text
36–48 px
Font Weight: 700
```

Use sparingly.

---

## H1

```text
30–36 px
Font Weight: 700
```

For major page titles.

---

## H2

```text
24–30 px
Font Weight: 600–700
```

For major sections.

---

## H3

```text
18–22 px
Font Weight: 600
```

For cards and subsections.

---

## Body

```text
14–16 px
Font Weight: 400
Line Height: 1.5–1.6
```

---

## Small Text

```text
12–14 px
```

For:

- Metadata
- Secondary information
- Timestamps
- Helper text

---

# 10. Typography Rules

Do not use more than two font families.

Avoid:

- Excessive bold text
- ALL CAPS paragraphs
- Extremely small text
- Decorative fonts

Medical/reference information should prioritize readability.

---

# 11. Spacing System

Use a consistent spacing scale based on multiples of 4.

```text
4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
```

Common usage:

```text
4px  → Tight internal spacing
8px  → Icon/text spacing
12px → Form elements
16px → Card padding
24px → Section spacing
32px → Major layout spacing
48px → Page-level separation
```

---

# 12. Border Radius

Use restrained rounding.

Recommended:

```text
4px  → Small controls
6px  → Inputs
8px  → Cards
10px → Larger panels
12px → Major containers
```

Avoid excessive pill-shaped UI except where semantically appropriate, such as symptom tags.

---

# 13. Shadows

Use subtle shadows.

Preferred:

```text
Small shadow → Cards / dropdowns
Medium shadow → Modal / overlay
No shadow → Standard page sections
```

Avoid heavy shadows.

The design should primarily use:

- Spacing
- Borders
- Background contrast

to establish hierarchy.

---

# 14. Layout System

The application should use a responsive dashboard layout.

General structure:

```text
┌────────────────────────────────────────────────────┐
│                    Top Bar                         │
├───────────────┬────────────────────────────────────┤
│               │                                    │
│   Sidebar     │          Main Content              │
│               │                                    │
│ Navigation    │                                    │
│               │                                    │
│               │                                    │
└───────────────┴────────────────────────────────────┘
```

---

# 15. Application Navigation

Primary navigation should include:

- Dashboard
- Patients
- Cases
- Symptoms
- Remedies
- Search
- Settings

Administrative users may additionally see:

- Knowledge Base
- Data Import
- System Administration

Only authorized users should see administrative functions.

---

# 16. Sidebar

The sidebar should provide:

- Product identity
- Primary navigation
- Active page indicator
- User profile
- Role information
- Logout

The active navigation item should be visually obvious.

Recommended active state:

- Light blue/teal background
- Strong text
- Small accent indicator where appropriate

---

# 17. Top Navigation

The top bar may contain:

- Page title
- Global search where appropriate
- Notifications where required
- User profile
- Help/documentation

Do not overload the top bar.

---

# 18. Dashboard Design

The dashboard is the user's main landing page after authentication.

Suggested structure:

```text
┌─────────────────────────────────────────────────────┐
│ Good Morning, Doctor                               │
│ Review your cases and begin a new analysis.         │
├─────────────────────────────────────────────────────┤
│                                                     │
│ [ New Patient ] [ New Case ] [ Search Symptoms ]   │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Recent Cases                                        │
│                                                     │
│ Patient | Case | Symptoms | Status | Date | Action │
│                                                     │
├─────────────────────────────┬───────────────────────┤
│ Recent Activity             │ Knowledge Base        │
│                             │ Status                │
└─────────────────────────────┴───────────────────────┘
```

The dashboard should prioritize actions rather than decorative statistics.

---

# 19. Dashboard Cards

Dashboard cards may include:

### New Case

Primary call-to-action.

### Recent Cases

Quick access to recent patient cases.

### Symptom Search

Direct access to the search system.

### Knowledge Base Status

For authorized users where appropriate.

### Recent Activity

Useful application activity.

Avoid meaningless metrics such as:

> "AI Accuracy: 98%"

unless such a metric is genuinely defined and validated.

---

# 20. Patient List

The patient list should use a clean table or card-based responsive layout.

Recommended columns:

```text
Patient
Age / Basic Information
Last Case
Last Updated
Status
Actions
```

Avoid exposing unnecessary sensitive information in list views.

---

# 21. Patient Profile

Suggested structure:

```text
Patient Header
────────────────────────
Basic Information

Case History
────────────────────────
Case 1
Case 2
Case 3

Actions
────────────────────────
[New Case]
[Edit]
```

The patient profile should provide quick access to case history.

---

# 22. Case Builder

The Case Builder is one of the most important interfaces.

Suggested layout:

```text
┌─────────────────────────────────────────────────────┐
│ Patient / Case Information                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│ Search Symptoms                                     │
│ [ Start typing a symptom... ]                      │
│                                                     │
├───────────────────────────┬─────────────────────────┤
│ Selected Symptoms         │ Case Information        │
│                           │                         │
│ Headache       [x]        │ Importance              │
│ Throbbing      [x]        │ Keynote                 │
│ Better Dark    [x]        │ Peculiar                │
│                           │                         │
├───────────────────────────┴─────────────────────────┤
│                                                     │
│                 [ Analyze Case ]                     │
└─────────────────────────────────────────────────────┘
```

---

# 23. Symptom Search Component

The search box should:

- Start searching as the user types
- Use debounce
- Display autocomplete
- Show relevant categories
- Allow keyboard navigation
- Highlight matching text
- Clearly distinguish selected symptoms

Example:

```text
Search symptoms...

┌─────────────────────────────────────┐
│ head                                │
├─────────────────────────────────────┤
│ Head — pain                         │
│ Head — throbbing                    │
│ Head — pressure                     │
│ Head — pain, frontal                │
└─────────────────────────────────────┘
```

---

# 24. Symptom Chips

Selected symptoms should appear as removable chips.

Example:

```text
[ Throbbing headache × ]
[ Worse from light × ]
[ Better in dark × ]
```

Important symptoms may use a visual indicator.

For example:

```text
★ Keynote
◆ Peculiar
```

Icons should have accessible labels.

---

# 25. Symptom Importance

Importance should be visually understandable.

Example:

```text
Normal
Important
Keynote
Peculiar
```

Avoid relying solely on color.

Use:

- Labels
- Icons
- Text
- Visual hierarchy

---

# 26. Analysis Button

The primary analysis action should be visually prominent.

Example:

```text
[ Analyze Case → ]
```

Before analysis:

- Validate required symptoms
- Confirm case state
- Provide meaningful feedback

During analysis:

```text
Analyzing case...
Retrieving candidate remedies...
Calculating rankings...
```

After analysis:

Navigate to the results view.

---

# 27. Results Page

The results page should prioritize explainability.

Suggested layout:

```text
┌──────────────────────────────────────────────────────┐
│ Case Analysis                                        │
│ 8 symptoms selected                                  │
├──────────────────────────────────────────────────────┤
│                                                      │
│ #1  Remedy A                         Score: 18        │
│     Coverage: 80%                                   │
│                                                      │
│     Matched Symptoms                                │
│     ✓ Symptom 1                                     │
│     ✓ Symptom 2                                     │
│     ✓ Symptom 3                                     │
│                                                      │
│     [ View Explanation ] [ View Remedy ]            │
│                                                      │
├──────────────────────────────────────────────────────┤
│                                                      │
│ #2  Remedy B                         Score: 15        │
│                                                      │
└──────────────────────────────────────────────────────┘
```

---

# 28. Remedy Ranking Visuals

The ranking UI should make relative ranking clear without implying medical certainty.

Recommended:

```text
#1
Remedy A
Score: 18
Coverage: 80%
```

Avoid:

```text
98% Cure Probability
```

unless a validated model actually provides that meaning.

---

# 29. Explanation Panel

Clicking "View Explanation" should reveal:

```text
Why this remedy ranked highly

Matched:
✓ Symptom A
✓ Symptom B
✓ Symptom C

Strong contributions:
★ Keynote symptom
◆ Peculiar symptom

Not matched:
○ Symptom D

Coverage:
80%
```

The explanation should derive directly from the backend ranking result.

---

# 30. Remedy Detail Page

Suggested layout:

```text
┌───────────────────────────────────────────────┐
│ Remedy Name                                   │
│ Common Name                                   │
├───────────────────────────────────────────────┤
│ Overview                                      │
├───────────────────────────────────────────────┤
│ Keynotes                                      │
├───────────────────────────────────────────────┤
│ Characteristic Symptoms                       │
├───────────────────────────────────────────────┤
│ Repertory References                          │
├───────────────────────────────────────────────┤
│ Materia Medica                                │
└───────────────────────────────────────────────┘
```

Long-form information should use clear sections and headings.

---

# 31. Tables

Tables should be used for structured information.

Recommended for:

- Patient lists
- Case lists
- Administrative data
- Knowledge-base records
- Import history

Tables should provide:

- Clear headers
- Row spacing
- Hover state
- Pagination where necessary
- Responsive behavior

---

# 32. Cards

Cards should be used for:

- Summary information
- Remedy results
- Recent cases
- Quick actions
- Status information

Do not place every element inside a card.

Cards should represent meaningful groups of information.

---

# 33. Buttons

## Primary Button

Use for the most important action.

Example:

```text
Analyze Case
Create Patient
Save Case
```

---

## Secondary Button

Use for supporting actions.

Example:

```text
Cancel
Back
View Details
```

---

## Destructive Button

Use for:

```text
Delete
Remove
Archive
```

Destructive actions must require appropriate confirmation.

---

# 34. Button States

Buttons should support:

```text
Default
Hover
Focus
Active
Disabled
Loading
```

Loading state example:

```text
[ Analyzing... ]
```

The user should not accidentally trigger the same action repeatedly during processing.

---

# 35. Form Design

Forms should use:

- Clear labels
- Helpful placeholders
- Validation messages
- Logical grouping
- Consistent spacing

Do not use placeholder text as the only field label.

---

# 36. Form Validation

Validation messages should appear close to the relevant field.

Bad:

```text
Invalid form.
```

Better:

```text
Symptom selection is required.
```

Errors should explain what the user needs to correct.

---

# 37. Modal Design

Modals should be reserved for:

- Confirmations
- Important forms
- Focused details

Avoid using modals for complete application pages.

Destructive confirmation example:

```text
Delete this case?

This action cannot be undone.

[ Cancel ] [ Delete Case ]
```

---

# 38. Toast Notifications

Use toast notifications for short-lived feedback.

Examples:

```text
Case saved successfully.
Patient updated.
Data import completed.
```

Do not use toasts for critical information that users need to read carefully.

---

# 39. Empty States

Empty states should explain what the user can do.

Example:

```text
No cases yet.

Create your first patient case to begin symptom analysis.

[ Create New Case ]
```

Avoid:

```text
No Data
```

without guidance.

---

# 40. Loading States

Use skeletons for larger content areas where appropriate.

For operations:

```text
Searching symptoms...
Loading remedies...
Analyzing case...
```

Avoid unnecessary full-page loading screens.

---

# 41. Error States

Error pages should provide:

- What happened
- Whether the user's data was affected
- What action they can take

Example:

```text
We couldn't load the analysis results.

Your case has been saved.

[ Try Again ]
```

---

# 42. Medical Disclaimer Design

A persistent medical disclaimer should be visible without overwhelming the interface.

Example:

> Symptom2Cure provides repertory-based decision support and does not diagnose disease or replace professional clinical judgment.

It may appear:

- In the application footer
- During analysis
- On results pages
- In relevant help/context sections

---

# 43. Data Source Attribution

Where source-derived repertory information is displayed, appropriate attribution/reference information should be available.

The UI should distinguish:

```text
Source Information
System Analysis
User Input
```

when necessary.

---

# 44. Status Indicators

Use a consistent status system.

```text
✓ Completed
● Active
◐ In Progress
! Attention Required
× Error
```

Color should supplement the status icon/text rather than being the only indicator.

---

# 45. Accessibility

The application should target:

**WCAG 2.2 Level AA**

Requirements include:

- Keyboard navigation
- Visible focus states
- Semantic HTML
- Accessible labels
- Sufficient contrast
- Screen-reader support
- Accessible forms
- Accessible dialogs
- Accessible error messages
- Non-color-only status indicators

---

# 46. Keyboard Navigation

Important workflows should support keyboard interaction.

Examples:

```text
Tab
Shift + Tab
Enter
Escape
Arrow Keys
```

Autocomplete should support:

```text
↑ / ↓  → Navigate
Enter  → Select
Esc    → Close
```

---

# 47. Responsive Design

The application should adapt to:

### Desktop

Primary target for clinical/research workflows.

### Laptop

Fully supported.

### Tablet

Supported with responsive layouts.

### Mobile

Important workflows should remain usable, but the initial design priority is desktop/tablet productivity.

---

# 48. Responsive Layout Strategy

Desktop:

```text
Sidebar + Main Content
```

Tablet:

```text
Compact Sidebar + Main Content
```

Mobile:

```text
Top Bar
↓
Content
↓
Bottom/Drawer Navigation
```

The exact navigation implementation can be finalized during frontend development.

---

# 49. Dashboard Visual Hierarchy

Priority order:

```text
1. Current user/context
2. Primary actions
3. Recent cases
4. Relevant system information
5. Secondary statistics
```

Do not prioritize decorative statistics over clinical workflows.

---

# 50. Data Visualization

Charts should only be used when they provide meaningful information.

Potential future uses:

- Case history trends
- Search usage
- Knowledge-base statistics
- System performance metrics

Do not add charts simply to make the dashboard appear more sophisticated.

---

# 51. Icons

Use one consistent icon library.

Recommended options:

- Lucide
- Heroicons

The final implementation should select one library and use it consistently.

Do not mix unrelated icon styles.

---

# 52. Icon Rules

Icons should:

- Have clear meaning
- Be paired with labels when ambiguous
- Have accessible labels
- Not replace important text unnecessarily

Example:

Good:

```text
[🔍 Search Symptoms]
```

Not:

```text
[🔍]
```

for an unfamiliar action.

---

# 53. Animation

Animations should be subtle and purposeful.

Allowed:

- Dropdown transitions
- Modal transitions
- Loading indicators
- Button feedback
- Page transitions where appropriate

Avoid:

- Excessive motion
- Continuous animations
- Decorative movement
- Distracting effects

Respect reduced-motion accessibility preferences.

---

# 54. Search UX

Search is one of the most important interactions.

It should feel:

- Immediate
- Predictable
- Forgiving
- Clear

The interface should handle:

```text
No results
Partial terms
Synonyms
Multiple matches
Slow responses
Network errors
```

---

# 55. Case Analysis UX

The user should always know:

```text
What has been selected?
What will be analyzed?
What is happening?
What was returned?
Why was it returned?
```

The workflow should never feel like a black box.

---

# 56. Results Information Hierarchy

Recommended hierarchy:

```text
Remedy Name
    ↓
Ranking / Score
    ↓
Coverage
    ↓
Key matched symptoms
    ↓
Explanation
    ↓
References
    ↓
Detailed information
```

---

# 57. Clinical Information Density

The interface may contain significant information, but information should be organized through:

- Tabs
- Accordions
- Sections
- Cards
- Tables
- Expandable explanations

Avoid presenting everything in one continuous block of text.

---

# 58. Dark Mode

Dark mode is **not a Version 1 priority**.

If implemented later, it must preserve:

- Accessibility
- Contrast
- Medical professionalism
- Semantic color meaning

Do not create a dark theme by simply inverting colors.

---

# 59. Design Tokens

Frontend implementation should centralize design values.

Conceptually:

```text
colors
typography
spacing
radius
shadows
breakpoints
```

Tailwind configuration should reflect the project's design system rather than scattering arbitrary values throughout components.

---

# 60. Component Architecture

Reusable components should be organized approximately as:

```text
components/
├── ui/
│   ├── Button
│   ├── Input
│   ├── Select
│   ├── Modal
│   ├── Badge
│   ├── Card
│   ├── Table
│   └── Toast
│
├── layout/
│   ├── Sidebar
│   ├── Header
│   └── PageContainer
│
└── domain/
    ├── SymptomSearch
    ├── SymptomChip
    ├── RemedyCard
    ├── RankingResult
    └── CaseSummary
```

---

# 61. Page Layout Standards

Each major page should generally follow:

```text
Page
 ├── Page Header
 │    ├── Title
 │    ├── Description
 │    └── Primary Action
 │
 ├── Main Content
 │
 └── Secondary Content
```

This creates predictable navigation and reduces cognitive load.

---

# 62. Dashboard Design Rule

The dashboard should not become a generic analytics dashboard.

It is primarily a **clinical workflow launch point**.

The most important action should remain:

> Start or continue a case.

---

# 63. Search Results Rule

Search results should never overwhelm users with thousands of records.

Use:

- Relevance
- Pagination
- Limits
- Categories
- Filters

to keep the interface manageable.

---

# 64. Remedy Ranking Rule

Ranking visuals must communicate:

> **"This remedy ranked higher according to the system's defined matching logic."**

They must not communicate:

> **"This remedy is medically guaranteed to work."**

This distinction is mandatory.

---

# 65. Data Import UI

Administrative data-import screens should communicate the pipeline status clearly.

Example:

```text
Knowledge Base Import

Dataset: kent_repertory_v1.csv

Records
──────────────
Total:       1,025,430
Valid:       1,020,210
Warnings:        4,800
Invalid:         420

Status
──────────────
✓ Validation Complete

[ View Report ] [ Import ]
```

Actual values must come from the real import process.

---

# 66. Import Progress

For large imports:

```text
Preparing...
Validating...
Importing...
Verifying...
Completed
```

Do not show fake progress percentages.

Progress values must correspond to actual processing when displayed.

---

# 67. Security UX

Security-sensitive actions should be explicit.

Examples:

- Logout
- Delete patient
- Delete case
- Administrative data import
- Account changes

Use confirmations where data loss or privilege changes are possible.

---

# 68. Privacy UX

Do not display sensitive patient information unnecessarily.

Examples:

Avoid:

```text
Full patient details
```

in:

- Dashboard cards
- Toast messages
- Browser URLs
- Logs
- Public screenshots

Use minimal identifiers where practical.

---

# 69. Browser-Based Application Rule

Symptom2Cure is a browser-based application.

The design must not assume:

- Offline-first operation
- Local database runtime
- Full dataset stored in the browser
- Service-worker-based database replication

The application communicates with the backend/database through the network.

---

# 70. Performance UX

Technical performance should be reflected in the interface.

For fast operations:

```text
Immediate result
```

For longer operations:

```text
Clear progress/loading state
```

The user should never experience unexplained blank screens.

---

# 71. Design Review Checklist

Before accepting a page/component:

### Visual

- [ ] Correct colors
- [ ] Correct typography
- [ ] Consistent spacing
- [ ] Consistent radius
- [ ] Consistent buttons
- [ ] Consistent icons

### UX

- [ ] Clear primary action
- [ ] Clear navigation
- [ ] Loading state
- [ ] Empty state
- [ ] Error state
- [ ] Confirmation for destructive actions

### Accessibility

- [ ] Keyboard accessible
- [ ] Labels present
- [ ] Focus visible
- [ ] Contrast acceptable
- [ ] Color is not the only status indicator

### Medical Context

- [ ] No unsupported medical claims
- [ ] Ranking is not presented as certainty
- [ ] Disclaimer available
- [ ] Source attribution where required

---

# 72. Final Design Direction

Symptom2Cure should visually communicate:

```text
                    TRUST
                      │
                      ▼
             ┌─────────────────┐
             │   Symptom2Cure  │
             └────────┬────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
       CLARITY     SEARCH      EXPLAINABILITY
          │           │           │
          └───────────┼───────────┘
                      ▼
              CLINICAL WORKFLOW
```

The interface should feel:

**Professional + Medical + Modern + Calm + Data-driven**

rather than:

**Decorative + Over-animated + Consumer-oriented + AI-gimmicky.**

---

# 73. Final Design Principle

> **Every visual decision must help the user understand the case, find relevant information, or interpret the system's results.**

If a design element does not improve usability, clarity, accessibility, or information hierarchy, it should be questioned before being added.

---

**Symptom2Cure Design.md v1.0**  
**Draft — August 2026**  
**Subject to refinement during frontend implementation and usability testing.**