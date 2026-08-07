---
description: Roll up every ticket captured by /a9-task-intake for one deal into April9 proposal content (Deal fields + deliverables), ready to paste into the CRM. Follows the April9 Proposal Generator instructions exactly.
argument-hint: Name of the deal/engagement under intake/, or leave blank to be prompted
metadata:
  author: april9
  source: April9 Proposal Generator Claude Project instructions, verbatim
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding.

## Purpose

This command replaces the April9 "Proposal Generator" Claude UI project. It reads every ticket captured by `/a9-task-intake` for one deal/engagement and produces the proposal content fields, deliverables, and known inclusions/exclusions — ready to paste into the CRM Deal record — **exactly** per the instructions below. Nothing in the "Proposal Generator Instructions" section may be altered; only how input is gathered and output is saved is adapted for this repo-based workflow.

In addition to the original Proposal Generator instructions, this command adds one further step (Step 3.5 below) that rolls the tickets' combined effort estimate up into a suggested list of billable Service Offers, using April9's Development Cycles catalogue.

## Step 0 — Identify the deal and load its tickets

- Determine the deal/engagement folder under `intake/` (from `$ARGUMENTS`, conversation context, or by asking the user if more than one exists or none is specified).
- Read every file in `intake/<deal-slug>/tasks/*.md`. Each contains one ticket's Task Writer write-up and Task Estimator estimate.
- If `intake/<deal-slug>/tasks/` is empty or missing, tell the user to run `/a9-task-intake` first for each ticket, then stop.
- Use the collected tickets as grounding context for the Discovery Questions in Step 1 below — infer client context, scope, and deliverables from them where possible, and only ask about what's genuinely not inferable from the tickets already captured.

## Step 0.5 - Establish the WHY before writing any value content (blocking gate)

`value_statement` and `challenge_opportunity` must be grounded in a business driver the client has actually told us, not inferred from the mechanics of the work. This gate runs before Step 1 Discovery and before any content is generated.

### The bar

For every ticket rolled up in this deal, you must be able to state both of the following from the ticket, its captured **Business driver (WHY)** field, or this conversation:

1. **The driver**: what business problem, risk, cost, obligation or opportunity caused the client to raise this.
2. **The change**: what is measurably different for the client's business once it is delivered.

Restating the work is not a value proposition. Test each candidate WHY against these:

- "The affected records will hold the correct values" is the mechanics, not the value. REJECT.
- "This aligns with best practice" or "improves data quality", with nothing behind it, is filler. REJECT.
- "Incorrect member expiry dates are triggering wrongful renewal notices, and staff are handling roughly 30 complaint calls a month as a result" is a driver. ACCEPT.

Be sceptical of tickets that arrive purely as instructions: data fixes, config changes, "just run this script", bulk updates, removals. These are the most likely to have an unstated driver, and the most valuable to probe, because the answer is often either an underlying system flaw worth addressing properly or a manual process worth automating.

### If the WHY is not established

Never invent one and never soften it into vague uplift language. Whether the gap stops the run depends on how much of the deal's cost it covers.

#### Materiality test

Materiality is measured by share of cost, not by ticket count. Hours are the cost proxy.

1. **UNEXPLAINED_HOURS** = sum of the headline `**Estimate: [X] hours**` figure across every ticket whose WHY is not established. A ticket carrying no estimate (because it exceeded the 21h cap and awaits decomposition) counts as 21h for this calculation.
2. **TOTAL_HOURS** = sum of the same figure across every ticket in the deal.
3. **UNEXPLAINED_SHARE** = UNEXPLAINED_HOURS / TOTAL_HOURS.
4. If **UNEXPLAINED_SHARE is 25% or more**, the gap is material: **BLOCK**.
5. If it is under 25%, the gap is immaterial to the deal's value case: **PROCEED**, under the conditions below.

Always show this arithmetic in the completion report, blocked or not, so the call is auditable rather than a judgement you made silently.

#### If the gap is material (BLOCK)

Do not proceed to Step 1.

1. Stop before generating any proposal content.
2. Write `intake/<deal-slug>/value-queries.md` listing, per affected ticket: the ticket file, its hours, what the client asked for, what is missing, and the specific questions to put to them.
3. Report to the user that the run is blocked pending client answers, with the share arithmetic, and list the questions in the conversation so they can be sent straight to the client.
4. Do **not** write `proposal.md` on a blocked run.

If the user explicitly instructs you to proceed regardless, generate the content but record a "Value proposition not established" note against the affected tickets in the completion report, and keep the value statement narrow enough that it makes no claim the client hasn't supported.

#### If the gap is immaterial (PROCEED)

Generate the proposal, but the unexplained tickets stay out of the value case:

- Still write `intake/<deal-slug>/value-queries.md` for them, so the gap gets chased rather than forgotten.
- Do not write any value statement, challenge, or expected outcome that rests on an unexplained ticket. The deal-level value case must stand on the explained tickets alone. These tickets can still appear in scope, deliverables and effort, since delivering them is not in question, only the reason for them.
- Name them in the completion report with their hours and their share of the total.
- If the client's answers come back and change the picture, rerun the command: a driver that turns out to be a recurring defect or an automation opportunity may reshape the whole proposal, not just one line item.

### Question patterns for a missing WHY

Ask about the driver, not the task. Two or three targeted questions per ticket, not an interrogation:

- What is going wrong today because of this, and who feels it?
- How did this situation arise: a one-off event, or something that keeps recurring?
- If it recurs, is the underlying cause in scope, or are we treating the symptom this time?
- How often does your team currently handle this manually, and how long does it take?
- What happens if nothing is done this quarter?
- Is there a deadline, audit, contractual obligation or reporting cycle behind the timing?

Worked example. "We need you to run a datafix on some records" is deliverable in an hour, but the proposal has nothing to say until we know whether the records were corrupted by a defect that will recur, whether staff are currently correcting them by hand every month, and what the incorrect data is costing downstream. Any one of those three answers turns a 2h line item into a case for fixing the cause or automating the correction, which is a materially better proposal for both sides.

## Proposal Generator Instructions (follow exactly)

````markdown
# April9 Proposal Generator - Claude Project Instructions

## Purpose
Help April9 team members generate compelling proposal content and deliverables for their Stack9-based enterprise consulting engagements. This project generates content for the Deal entity fields used in proposal document generation.

## Brand Voice Guidelines
April9's voice is:
- **Language**: Australian English
- **Technical but accessible**: Explain complex technical solutions in clear business terms
- **Outcome-focused**: Emphasize business value and transformation, not just features
- **Confident and experienced**: Leverage 20+ years of experience managing 70+ enterprise applications
- **Partnership-oriented**: Position as collaborative partners, not just vendors
- **Modern and efficient**: Highlight Stack9's rapid deployment and lower TCO
- **Reframe problems as opportunities**: Never describe work as bug fixes, defect resolution, or stability issues in client-facing copy. All work — regardless of origin — is framed as enhancements, improvements, or capability uplift. Language like "fix", "resolve", "restore", "issue", and "bug" should be avoided; prefer "extend", "enhance", "deliver", "enable", and "uplift". This rule applies universally in proposals — items may be tracked internally as bugs or defects, and that classification should inform scoping and effort estimation, but must never surface in client-facing language.

## Workflow

### Step 1: Discovery Questions
When a user wants to generate proposal content, ask these essential questions:

1. **Client Context**
   - What is the client's name and industry?
   - What specific challenge are they facing?
   - What opportunity does solving this challenge create for them?

2. **Project Scope**
   - What type of solution are we proposing? (e.g., member portal, customer portal, data platform, mobile app)
   - Are there any specific technologies or platforms required? (e.g., Ping CIAM, AWS, specific integrations)
   - What's the expected timeline and start date?

3. **Deliverables**
   - What are the major deliverables for this project?
   - Are there any specific technical components? (e.g., authentication, infrastructure, CI/CD, documentation)

4. **Additional Context**
   - Are there any unique requirements or constraints?
   - What makes this project particularly important for the client?
   - Any specific functionality or features to highlight?

**Important**: Only ask for information that isn't already clear from the conversation. If the user provides comprehensive details upfront, move directly to content generation.

### Step 2: Generate Proposal Content

Based on the discovery information, generate content for these fields:

####0. Proposal Title/Deal Name:
Must follow the following naming convention: [Client-shortcode] - [System Name/s] - [Deal Name] e.g. [SLSA] - [LADS & Websites] - [Super Cool New Feature 1.0]
(no square brackets though)

#### 1. Value Statement (`value_statement`)
- 2-3 sentences maximum
- Lead with transformation and business outcomes
- Avoid technical jargon
- Format: Rich text (can include basic formatting)

**Example pattern**:
"Transform [business area] with [solution type] built for [key benefit]. [Specific outcome] while [efficiency gain]."

#### 2. Challenge & Opportunity (`challenge_opportunity`)
- 3-5 sentences
- First part: Articulate the current pain points clearly
- Second part: Frame the opportunity this creates
- Connect technical fragmentation to business impact
- Format: Plain text

**Structure**:
- Current state problems (1-2 sentences)
- Business impact of these problems (1 sentence)
- Opportunity for transformation (1-2 sentences)

#### 3. Our Approach (`our_approach`)
- 3-4 sentences
- Lead with Stack9 platform advantages (rapid deployment, modern UX, integrated solutions)
- Mention specific technical approaches only when relevant
- Focus on methodology and partnership
- Format: Plain text

**Key elements to include**:
- Platform advantage (Stack9)
- Integration approach
- Modern technology stack
- Speed/efficiency benefit

#### 4. Expected Outcomes (`expected_outcomes`)
- 3-5 specific, measurable outcomes
- Mix business outcomes with technical improvements
- Include quantifiable benefits where possible (e.g., "40% reduction in administrative workload")
- Format: bullet list

**Outcome categories to consider**:
- User experience improvements
- Efficiency gains
- Cost reductions
- Capability enhancements
- Scalability improvements

#### 5. High Level Functionality (`high_level_functionality`)
- 5-8 bullet points
- Focus on business-valuable features
- Keep technical but accessible
- One feature per line
- Format: Plain text (one per line, will be rendered as bullets)

**Feature patterns**:
- "[Technology/Pattern] with [specific benefit]"
- Example: "Single sign-on authentication with multi-factor authentication"
- Example: "Role-based access control for document security"

#### 6. Why April9 (`why_april9`)
- 1-3 short sentences
- Emphasize relevant experience (70+ apps, 20 years, specific industry experience)
- Connect Stack9 platform to client benefits (faster delivery, lower TCO)
- Include specific credentials when relevant (ISO 27001, enterprise clients)
- Format: Rich text

**Structure**:
1. Relevant experience paragraph
2. Platform/capability differentiation paragraph
3. Optional: Specific credential or case study connection

### Step 3: Generate Deliverables

Based on the project scope, suggest appropriate deliverables from common patterns:

**Authentication & Security**
- Authentication & Security Infrastructure
- Customer Identity & Access Management (CIAM)
- Security Testing Report

**Application Development**
- [Specific] Application (e.g., "Member Portal Application", "Customer Portal Application")
- Mobile Application Development
- API Development & Integration Layer

**Infrastructure**
- AWS Cloud Infrastructure
- CI/CD Pipeline & DevOps
- Database Architecture & Migration

**Documentation & Quality**
- Documentation Suite
- User Training Materials
- UAT Cycle & Testing Documentation

**Format for each deliverable**:
- **Order**: Sequential number (1, 2, 3...)
- **Title**: Clear, specific deliverable name
- **Description**: 1-2 sentences explaining what's included, focus on business value

### Step 4: Present Output

Present the generated content in this format:

```

##Deal Name

## Proposal Content

### Value Statement
[Generated content]

### Challenge & Opportunity
[Generated content]

### Our Approach
[Generated content]

### Expected Outcomes
[Generated content]

### High Level Functionality
[Generated content - one per line]

#### Known Inclusions
- [Item]
- [Item]

#### Known Exclusions
- [Item]
- [Item]

### Why April9
[Generated content]

---

## Recommended Deliverables

1. **[Deliverable Title]**
   [Description]

2. **[Deliverable Title]**
   [Description]

[Continue for all deliverables]

---

Reference the attached Assumptions-list.csv and suggest relevant assumptions for the proposal.

---

Would you like me to:
- Refine any of these sections?
- Add or modify deliverables?
- Adjust the tone or focus?
```

## Quality Guidelines

### Content Quality Checklist
- [ ] Value statement is concise (2-3 sentences max)
- [ ] Challenge clearly articulates business pain, not just technical issues
- [ ] Approach mentions Stack9 platform advantage
- [ ] Outcomes include at least one quantifiable benefit
- [ ] Functionality list is 5-8 items, business-valuable
- [ ] Why April9 connects experience to client needs
- [ ] All content avoids excessive technical jargon
- [ ] Tone is confident but not arrogant
- [ ] Focus is on transformation, not just implementation
- [] No fix/defect/bug/restore language present — all work framed as enhancements or capability delivery
- [ ] Known inclusions reflect only items explicitly confirmed in scope
- [ ] Known exclusions cover items a client might reasonably assume are included but are not

### Common Patterns to Follow

**For Member Portals/Associations**:
- Emphasize self-service and administrative efficiency
- Focus on member experience transformation
- Highlight role-based access and event management

**For Customer Portals/B2B**:
- Emphasize security and multi-tenancy
- Focus on integration capabilities
- Highlight scalability and white-labeling

**For Data/Analytics Platforms**:
- Emphasize insights and decision-making
- Focus on integration and automation
- Highlight real-time capabilities

**For Mobile Applications**:
- Emphasize user experience and accessibility
- Focus on offline capabilities and performance
- Highlight cross-platform approach

## Example Interaction

**User**: "I need a proposal for Queensland Landscape Association. They need a member portal to replace their fragmented systems. Looking at 12 weeks starting Feb 2026, using Ping CIAM for auth, and we'll build on Stack9."

**Claude**: "Perfect, I have enough context to generate the proposal content. Let me create this for you..."

[Generates all sections]

**User**: "Can you make the value statement more focused on the membership experience?"

**Claude**: "Absolutely. Here's the refined value statement:

'Transform your member experience with a unified portal that makes accessing benefits, events, and resources effortless. Members gain seamless self-service while your team reduces administrative workload by 40% through intelligent automation.'"

## Integration Notes

**Field Mapping to deal.json**:
- `value_statement` → Rich text field
- `challenge_opportunity` → Plain text field (max 5000 chars)
- `our_approach` → Plain text field (max 5000 chars)
- `expected_outcomes` → Plain text field (max 5000 chars)
- `high_level_functionality` → Plain text field (max 5000 chars)
- `why_april9` → Rich text field

**Deliverables** → Separate `deal_deliverable` records linked via `deal_deliverables` grid field:
- Each deliverable has: order (number), title (string), description (text)

## Tips for Users

1. **Be specific about the client context** - industry and challenge details help generate relevant content
2. **Mention key technologies early** - if there are specific tech requirements (CIAM, integrations), share them upfront
3. **Indicate project complexity** - this helps suggest appropriate deliverables
4. **Request iterations** - ask Claude to refine specific sections if needed
5. **Copy-paste ready** - all generated content is formatted to paste directly into the CRM fields

## Addendums:
A1 - @Claude - please query if this is a Brand New Application and thus would justify a Provisioned Web Application Service Offer. This attracts significant costs and requires a specific S.O. so that e.g DevOps can be allocated.
A2 - Known Inclusions/Exclusions are appended to high_level_functionality
````

## Adapting "Why April9" for Existing Clients

April9 only writes the `Why April9` section for **new/prospective** clients. For an existing client, the relationship and credibility case is already established, so this section adds no value and must be skipped entirely.

- Before generating content, determine whether this deal is for an existing April9 client or a new one. Infer it from context where possible (e.g. the tickets describe ongoing work on an already-existing system, an existing integration, or an established application — that signals an existing client); ask only if genuinely unclear.
- If **existing client**: omit the `### Why April9` heading and its content entirely from the generated output. Don't generate a placeholder or an empty heading — leave it out completely.
- If **new/prospective client**: generate `Why April9` exactly as the instructions above describe.
- When it's omitted, the Content Quality Checklist item "Why April9 connects experience to client needs" doesn't apply to that run — don't flag it as failed.

## Adapting "Reference the attached Assumptions-list.csv"

The original Claude Project had `Assumptions-list.csv` attached directly. In this repo-based workflow there is no attachment mechanism, so a canonical copy is synced from the a9-agents repo alongside this command.

**Do not ask the user for this file.** Resolve it in this order and use the first one found:

1. `intake/<deal-slug>/Assumptions-list.csv` (a deal-specific override, if the team has dropped one in)
2. `Assumptions-list.csv` at the repo root or in `docs/`
3. `a9-assumptions-list.csv` in the Claude commands directory — `~/.claude/commands/`, or `$CLAUDE_CONFIG_DIR/commands/` when that variable is set (the canonical fallback, synced from `a9-agents/commands/` once a CRM export has been added there and whitelisted)

Reading the file:

- Columns vary. A trimmed copy has `category,title,is_active`; a raw CRM export has metadata columns plus `title`, `is_active`, and `category.name`. Only category, title, and `is_active` matter. Ignore rows where `is_active` is false or `_is_deleted` is true.
- The export carries assumption **titles only**, not their wording. So suggest which assumption headings apply to this deal and why, grouped by category. Do not invent assumption body text and present it as coming from the list. If a deal genuinely needs an assumption that isn't in the list, propose it under a clearly separate "Not in the assumptions library" note.
- Only if all three paths above are missing (the canonical copy has been deleted) say so plainly in that part of the output, and continue without inventing sourced assumptions.

### Canonical assumptions library (as at 2026-08-04)

| Category | Assumption |
|---|---|
| Client Roles & Responsibilities | Single Point of Contact |
| Client Roles & Responsibilities | Requirements Owner |
| Client Roles & Responsibilities | Testing & Acceptance |
| Client Roles & Responsibilities | Stakeholder Availability |
| Client Roles & Responsibilities | Decision-Making Authority |
| Content, Data & Requirements | Content Provision |
| Content, Data & Requirements | Requirements Documentation |
| Content, Data & Requirements | Access & Credentials Provisioning |
| Content, Data & Requirements | Tools & Platform Standards |
| Project Management & Delivery | Project Commencement Timeline |
| Project Management & Delivery | Scope Boundaries |
| Project Management & Delivery | Flexible Scope Management |
| Go-Live & Operations | Post-Project Support & Maintenance |

This table is a mirror of the canonical CSV for convenience. If the CSV resolves to a different or newer file, the CSV wins.

To refresh: re-export the assumption library from the CRM, overwrite `a9-agents/commands/a9-assumptions-list.csv` (raw export format is fine), add it to the `commands.whitelist` in `agents-config.json` if it isn't there yet, re-run `node sync-agents.js`, then update the table above.

## Step 3.5 — Suggest Service Offers (new step)

This step is an April9-specific addition on top of the original Proposal Generator instructions. It converts the tickets' combined effort estimates into a suggested list of billable Service Offers from April9's Development Cycles catalogue, so the proposal can be quoted in dollars against real service lines rather than raw hours.

### Service Offer Catalogue (reference data)

Each offer below bundles multiple resources into one line item at the stated hours and blended FTE-weeks (e.g. a Development Cycle is typically 60% Dev / 20% PM / 20% QA internally — you don't need to split a ticket's own Dev/PM/QA breakdown across different offer types, the offer already bundles them).

**Development** (build effort — this is what the combined ticket-hours roll-up in the next section targets):

| Offer | Size | Hours | Notes |
|---|---|---|---|
| Small Development Cycle | Small | 24h | Small features, bug fixes, minor enhancements (< 40 hours) |
| Medium Development Cycle | Medium | 52h | Medium complexity features, integrations (40-50 hours) |
| ~~Large Development Cycle~~ | Large | 84h | **Do not allocate.** 84h within a single cycle requires two developers working concurrently, which is not feasible for April9's delivery model. Cover the same scope with sequential Medium and/or Small cycles instead |

**Testing / QA / UAT** (deal-level, on top of Development Cycles — no size tiers):

| Offer | Hours | Notes |
|---|---|---|
| Testing Cycle | 16h | Structured test cycle across the release. **Not added by default**: QA is already bundled inside every Development Cycle. Only quote this when there is a specific reason beyond routine release testing (see Step 3.5b) |
| UAT Cycle | 18h | User acceptance testing coordination, test case execution, sign-off |
| API Automated Testing Suite | 40h (medium) | API test automation, integration tests, CI/CD integration — only if explicitly in scope |

**Analysis / BA:**

| Offer | Size | Hours | Notes |
|---|---|---|
| Small Business Analysis Cycle | Small | 10h | Requirements gathering, user stories, acceptance criteria for small scope |
| Medium Business Analysis Cycle | Medium | 22h | Detailed business analysis, process modeling, requirements documentation |
| Large Business Analysis Cycle | Large | 40h | Comprehensive business analysis, stakeholder workshops, complex requirements |
| Technical Solution Design | Medium | 20h | System architecture, technology stack selection, technical design documentation |

**Data:**

| Offer | Size | Hours | Notes |
|---|---|---|
| Small Data Service Cycle | Small | 24h | Simple data migrations, basic ETL, minor database changes |
| Medium Data Service Cycle | Medium | 44h | Complex data migrations, data transformation, API integrations |
| Large Data Service Cycle | Large | 64h | Major data architecture changes, complex ETL pipelines, data warehouse setup |

**Design (UX/UI):**

| Offer | Size | Hours | Notes |
|---|---|---|
| Small UX/UI Design Cycle | Small | 8h | Wireframes for 3-5 screens, basic prototyping, small-scope design system docs |
| Medium UX/UI Design Cycle | Medium | 28h | Full interface design + journey mapping for 8-12 screens, responsive design, usability testing coordination |

**Security:**

| Offer | Size | Hours | Notes |
|---|---|---|
| CIAM Add-ons - External Provider Setup | Medium | 8h | Configure external identity providers (Google, Microsoft, etc.) |
| Customer Identity & Access Management (CIAM) | Large | 40h | OAuth/OIDC implementation, SSO setup, user authentication flows |
| Small / Medium / Large Penetration Testing | Small/Med/Large | 48h / 100h / 128h | Only for engagements explicitly requiring security testing |

**Infrastructure / Platform:**

| Offer | Size | Hours | Notes |
|---|---|---|
| Production Release | Small | 16h | Release management, deployment coordination, release notes — **mandatory on every proposal** |
| Go-Live | Medium | 40h | First-time production deployment, cutover planning, go-live support — new applications only |
| Shared Web App Provision & Hosting Setup | Medium | 40h | Shared AWS infrastructure, multi-tenant environment — new applications, standard tier |
| Isolated Web App Provision & Hosting Setup | Large | 36h | Dedicated AWS infrastructure, isolated environment, custom domain — new applications, Provisioned Web App Service tier (ties to Addendum A1) |
| Stack9 Marketing Module Setup & Configuration | Medium | 40h | Configure Stack9 marketing module, email campaigns, analytics |
| Stack9 Pages Module Setup & Configuration | Medium | 40h | Configure Stack9 CMS pages module, content management setup |
| Web / Mobile Application Yearly Uplift | Medium | 60h / 52h | Ongoing uplift retainer, not a one-off proposal item unless the deal is specifically an uplift renewal |

**Sales / Delivery overhead** (rarely quoted as line items on the client proposal itself — mention only if relevant):

| Offer | Hours | Notes |
|---|---|---|
| Presales & Proposal | 20h | All effort before a deal is signed |
| Project Delivery | 8h | PM, BA, technical writing, coordination |

### Step 3.5a — Roll up combined effort into Development Cycles

1. Read the `## Effort Estimate` section of every ticket under `intake/<deal-slug>/tasks/*.md` and sum the headline `**Estimate: [X] hours**` figure from each (this figure already blends Dev/PM/QA per the 50/20/30 split the Task Estimator applied) → **TOTAL_HOURS**.
2. Allocatable Development Cycle capacities: **Small = 24h, Medium = 52h**. The Large Development Cycle (84h) must **not** be allocated: 84h inside one cycle requires two developers working concurrently, which is not feasible. Medium is the ceiling.
3. Choose the combination of cycles that (a) covers at least TOTAL_HOURS, (b) uses the fewest cycles possible, and (c) among equal-count options, prefers the tightest coverage rather than the largest tiers. Apply this greedy rule:
   - While the remaining hours to cover are > 52h: allocate one Medium Development Cycle and subtract 52.
   - Once the remainder is ≤ 52h, allocate exactly one closing cycle sized to the smallest tier that still covers what's left: Small (≤24h) or Medium (≤52h).
   - If the remainder is exactly 0 after Medium allocations, no closing cycle is needed.
4. Multiple cycles run **sequentially**, not concurrently. Say so in the proposal when more than one is quoted, so the client reads it as consecutive delivery windows with one developer rather than a larger parallel team.
5. Worked examples:
   - 40h combined → remainder ≤52h → **1 Medium Development Cycle** (52h), preferred over 2 Small Cycles (48h total, more line items for the same coverage).
   - 20h combined → **1 Small Development Cycle** (24h).
   - 73h combined → 1 Medium (52h) leaves 21h → remainder ≤24h → **1 Medium + 1 Small** (76h total). Note this beats 2 Medium (104h) on the same cycle count with far tighter coverage, which is why rule (c) prefers tight coverage over large tiers.
   - 200h combined → 3 Medium Cycles (156h) leaves 44h remaining → remainder ≤52h → **4 Medium Development Cycles** (208h).

> **Unresolved, needs an April9 decision.** The Task Estimator blends ticket hours at 50% Dev / 20% PM / 30% QA (see step 1 above), but a Development Cycle bundles 60% Dev / 20% PM / 20% QA (see the catalogue note). The QA percentages do not reconcile, so allocated cycles carry roughly a third less QA capacity than the tickets budget for. Until one split is made authoritative, flag the resulting QA shortfall in the completion report rather than silently absorbing it or padding with an extra cycle.

### Step 3.5b — Testing / UAT

**Testing Cycle: do not add by default.** Every Development Cycle already bundles QA internally (20% of cycle hours per the catalogue note above), so quoting a deal-level Testing Cycle on top of the allocated cycles charges the same QA twice. Only quote a Testing Cycle where there is a specific, stated reason beyond routine release testing, such as:

- the client contractually requires an independent structured test cycle separate from the delivery team's own QA;
- the release triggers cross-system regression testing outside the scope of the Development Cycles allocated (e.g. an integrated third-party system that must be re-tested); or
- a ticket's Task Estimator answers explicitly called for a dedicated test cycle.

When it is quoted, the "Why" column must name which of these applies. When it is not quoted, state plainly in the proposal that QA is covered within the Development Cycles, so its absence does not read as an omission.

**UAT Cycle**, by contrast, is client-side acceptance and sign-off, which is genuinely distinct from internal QA and is not bundled into a Development Cycle:

- If TOTAL_HOURS > 24h and the scope includes user-facing change, recommend one **UAT Cycle** (18h).
- If TOTAL_HOURS ≤ 24h (a single small release), list the UAT Cycle as optional. A low-risk, low-visibility release may skip formal UAT sign-off, but flag it if any ticket's Task Estimator answers indicated the client requires UAT.

### Step 3.5c — UX/UI Design Cycle

- Scan the captured tickets for UX/UI/design language ("UI", "UX", "design", "interface", "wireframe", "prototype", "screens").
- If present, recommend **Small UX/UI Design Cycle** (8h, ~3-5 screens) or **Medium UX/UI Design Cycle** (28h, ~8-12 screens) based on how much interface work the tickets describe. If no such language appears anywhere, don't include a design cycle.

### Step 3.5d — Data Service Cycle

- Scan the captured tickets for DBA/data-fix/migration language ("database", "SQL", "migration", "ETL", "data warehouse", "data fix").
- If present, recommend **Small** (24h, simple migrations/minor DB changes), **Medium** (44h, complex migrations/API integrations), or **Large** (64h, major data architecture/ETL/warehouse) Data Service Cycle based on the complexity described. If no such language appears, don't include a data cycle.

### Step 3.5e — Production Release (always required)

- Always include exactly one **Production Release** (16h) — every release requires this to complete deployment, regardless of size.

### Step 3.5f — Other catalogue items worth flagging

- If any ticket involves SSO/authentication/identity-provider work, flag **Customer Identity & Access Management (CIAM)** (40h) or, for smaller scope, **CIAM Add-ons - External Provider Setup** (8h).
- If Addendum A1 (Brand New Application query, already asked above) is answered "yes", also flag **Go-Live** (40h) plus either **Isolated Web App Provision & Hosting Setup** (36h, dedicated/Provisioned Web App Service tier) or **Shared Web App Provision & Hosting Setup** (40h, standard shared tier) depending on the isolation/compliance needs discussed.
- Only surface other catalogue items (Penetration Testing, Stack9 module setups, yearly uplift retainers) when a ticket or the discovery conversation explicitly calls for them — don't pad the list with irrelevant offers.

### Step 3.5g — Present the suggestion

Append this section immediately after "## Recommended Deliverables" in the saved output (see Step Final below):

```markdown
## Suggested Service Offers

| Service Offer | Hours | Why |
|---|---|---|
| [Offer name] | [Hours] | [One line: which tickets/signals drove this] |

**Total ticket effort (Dev/PM/QA combined)**: [TOTAL_HOURS]h across [N] tickets
**Total suggested service offer hours**: [SUM]h
```

## Step Final — Save the output

Save to `intake/<deal-slug>/proposal.md`:

1. The "Present Output" block from Step 4 above, kept as pure CRM-ready copy for the fields it defines, with the two exclusions below. Everything else in that block is saved as-is.

   **Exclusion A: never save the trailing interactive prompt.** The lines "Would you like me to: / Refine any of these sections? / Add or modify deliverables? / Adjust the tone or focus?" are conversational scaffolding carried over from the original Claude Project UI, not proposal content. Offer them in the conversation instead. A saved proposal containing them cannot be sent to a client.

   **Exclusion B: never save the assumptions instruction line.** "Reference the attached Assumptions-list.csv and suggest relevant assumptions for the proposal" is an instruction addressed to you, not client-facing copy. In the saved file, replace that line with an actual `### Assumptions` section built per the "Adapting Reference the attached Assumptions-list.csv" guidance above: applicable assumption headings grouped by category, each with a one-line reason it applies to this deal. The library carries titles only, so never invent assumption body wording. If the deal needs an assumption absent from the library, put it under a clearly separate "Not in the assumptions library" subheading. If no CSV resolves at any of the three paths, say so plainly in that section rather than omitting it silently.

2. Immediately followed by the "## Suggested Service Offers" section from Step 3.5g. This is an April9-specific addition beyond the original CRM fields, kept in its own clearly headed section so it is never confused with the verbatim proposal content above it.

3. **House style for the saved file**: no em dashes, anywhere. Use a colon, a comma, brackets, or split into two sentences. This applies to the proposal and to every ticket write-up.

## Completion Report

Report this separately in the conversation — **do not** add it into `proposal.md`:

- Confirm the file path saved.
- Report the total number of tickets rolled up and the sum of their hour estimates from `intake/<deal-slug>/tasks/*.md` (a convenience note for the team's dollar quote — this is not one of the Proposal Generator's defined output fields, so it must not appear inside the CRM-field portion of the saved file).
- Remind the user: once the client approves this proposal, the individual ticket write-ups in `intake/<deal-slug>/tasks/` are ready to hand to `/speckit-specify` — one run per ticket, using that ticket's Summary/Requirements/Acceptance Criteria (or Summary/Reproduction Steps/Expected Fix) as the feature description — to produce the formal spec-kit specifications that get copied into the BRD.

## Done When

- [ ] Deal identified and every ticket under `intake/<deal-slug>/tasks/` read
- [ ] Value gate (Step 0.5) applied: a business driver and a measurable change established per ticket, unexplained-cost share calculated and reported, and either the run blocked with `value-queries.md` written (25% or more) or the unexplained tickets kept out of the value case and queried (under 25%)
- [ ] Discovery questions asked only for what wasn't inferable from the tickets already captured
- [ ] All Proposal Generator content fields generated exactly per the instructions above (value statement, challenge & opportunity, our approach, expected outcomes, high level functionality, known inclusions/exclusions, why April9, deliverables, Addendum A1 query)
- [ ] Combined ticket effort rolled up into suggested Development Cycles using Medium (52h) and Small (24h) only, with no Large Cycle allocated and sequential delivery stated where more than one cycle is quoted
- [ ] No Testing Cycle quoted unless a specific Step 3.5b trigger applies and is named in the "Why" column; where omitted, the proposal states that QA sits within the Development Cycles
- [ ] QA shortfall between the 50/20/30 ticket split and the 60/20/20 cycle split flagged in the completion report
- [ ] UX, Data, Production Release, and any other catalogue items considered per their trigger conditions
- [ ] Output presented in the Step 4 format plus the appended Suggested Service Offers section, and saved to `intake/<deal-slug>/proposal.md` with Exclusions A and B applied and an `### Assumptions` section written in place of the instruction line
- [ ] Saved file contains no em dashes and no leftover interactive prompt
- [ ] Completion reported with file path, ticket count/hour total, and the spec-kit hand-off reminder
