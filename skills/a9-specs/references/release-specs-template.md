# Release Brief — the locked template

> **Blank template.** The brief is a **file set**, not one document: an executive summary carrying
> what every deliverable shares, plus one file per deliverable beside it. Copy the two parts below
> into the release folder, fill them in, then delete every banner and every `<guidance>` block.
>
> **One file set per input**, covering every deliverable in it. The input fixes the boundary —
> whatever arrives in one run is what the brief covers, whether that is an approved proposal, a set
> of tickets, or a single paragraph. Where the input names no release, name the folder after its
> source.

```
specs/<releaseName>/
  00-executive-summary.md   ← Part A. Written once, read first
  01-<slug>.md              ← Part B, one copy per deliverable, numbered from 01
  02-<slug>.md
  …
  decisions.md              ← internal. Not part of the brief and never issued
```

**Why a file set.** A release with several deliverables is read by people who each own one of them:
a developer opens the file they are building and a client reviewer opens the item they are
questioning. Splitting on the deliverable is splitting on the unit that people actually work in.

**The rule that governs the split: a deliverable file is COMPLETE ON ITS OWN.** Everything that binds
a deliverable is written in that deliverable's file — the personas and glossary terms it uses, the
assumptions that hold for it, and every exclusion that applies to it, release-wide ones included.
Nothing binding is left behind a reference.

**`00-executive-summary.md` is the master, and it is removable.** It states every assumption and
every release-wide exclusion once, and each deliverable file **copies down** the items that bind it.
The master is where an item is *changed*; the copies are what a reader actually reads. This is
deliberate: the executive summary may be dropped from the output in future, and when it is, **no
deliverable file needs an edit** — that is the test of whether the copies are complete.

**So the back-reference header is not the scope guard.** It carries the release identity, the
deliverable's version and a pointer to the index. Splitting a brief used to leave a deliverable
missing the exclusions that bound it; completeness dissolves that hazard rather than guarding
against it, which is the objection the single-document shape was chosen over and this shape now
answers on its own terms.

**What that costs, stated rather than buried.** One fact lives in the master and in every file it
binds, so changing it edits several files, and two copies can **drift**. Drift is the defect — not
the duplication — and it is mechanical to check, which is why Release Context is a bulleted list
and not prose: an item has to be copyable verbatim, one bullet at a time.

**Both readers open the same files.** The brief is issued as markdown through April9's own delivery
system. There is no trimmed client copy, so the `Notes / Constraints` blocks are read by the client
too.

---
---

# Part A — `00-executive-summary.md`

---

# Release Brief — `<Client>` `<System>` `<Release>` — Executive summary

**Prepared for** · `<client organisation>`
**Source** · `<what fixed this release: an approved proposal, a ticket set, a meeting note, an email thread>`, dated `<date>`
**Source tickets** · `<Znnn, Znnn, …>`
**Issued** · `<date>`

<This file carries only what every deliverable shares. It holds no stories, no per-deliverable
scope lines and no vocabulary — a term or a persona lives in the deliverable files that use it. What
is here is what a reader needs *before* opening any one deliverable, and what binds all of them.>

---

## What this release delivers

`<Two or three sentences, plain language: what the client gets from this release. Do not re-derive
the business case carried by the source — the source is referenced above. The cap does not move when
the source is not a proposal: with less confirmed source, unstructured justification prose is exactly
where invention enters.>`

| # | Deliverable | Ticket | Version | What changes |
|---|---|---|---|---|
| 1 | [`<name>`](01-`<slug>`.md) | `Znnn` | `<n.n.n>` | `<one line, functional: what the system will do differently that a user could observe>` |
| 2 | [`<name>`](02-`<slug>`.md) | `Znnn` | `<n.n.n>` | `<…>` |

<Link every row to its own file. This table is the file set's index, and it is the only place the
whole release can be seen at once — so it is read first and it is never out of step with the folder.

Keep `What changes` to one line and keep it functional — what a user could observe, not how it
will be built. Implementation is the developer's call, made later.

**Versions are read, not assigned.** Take the number the input gives a deliverable, and where it gives
none start it at `0.1.0`. Inventing a version is inventing a commitment. The **release** version is not
a field here — the title carries it, and repeating it in the header told the reader nothing.

**On re-issue, only the deliverables that changed are redrafted** and only their versions move; every
other file stays byte-for-byte identical, so the two issues diff cleanly and this column is what tells
the reader which files to re-open. A changed commitment bumps the **minor** digit — something different
is being approved. Wording, ordering or compression with no commitment moved bumps the **patch** digit.
`1.0.0` is not defined here; delivery and acceptance are recorded outside this brief.>

---

## Release Context

<**This section is the master.** Every assumption and every release-wide exclusion in the brief is
stated here once, and each deliverable file copies down the ones that bind it. This is the only place
an item is *changed*; a change here is followed into every file that carries the copy.

**One item per bullet, in both elements.** Not prose. An item has to be copyable **verbatim** into a
deliverable file, and half a sentence is not — this is the same reason the glossary is a bulleted
list rather than a table. A bullet that has to be cut in two to be copied was two items.

**Write each bullet so it is true on its own**, without the sentence before it, because it will be
read inside a deliverable file with different neighbours.

Personas and glossary terms are deliberately **not** here — they live in the deliverable files that
use them, extracted from the master lists, which are their master.>

**Assumptions**

- `<one assumption, as a self-contained bullet. What holds — for the release, for several
  deliverables, or for exactly one. Anything that needs confirming before this brief is issued
  belongs here with the confirmation named.>`

**Out of scope (release-wide)**

- `<one exclusion, as a self-contained bullet. Where no source states any release-wide exclusion,
  this element reads `None stated` and the heading survives.>`

<**Breadth is part of an exclusion's commitment.** An exclusion in this section binds every
deliverable that copies it, so which files copy it is a decision about what the client is
committing to — not formatting. Deciding an exclusion binds one deliverable rather than five
**removes it from four**, and that is a commitment moving, with the version consequence
that follows.

Assumptions mostly do not work that way: one that only ever constrained a single deliverable was
misfiled if it read as release-wide, and filing it correctly moves nothing.>

---
---

# Part B — `NN-<slug>.md`, one copy per deliverable

---

# `<N>`. `<Deliverable name>` (`Znnn`)

**Release** · `<Client>` `<System>` `<Release>` · **Version** · `<n.n.n>` · [Executive summary](00-executive-summary.md)

> **This file is complete on its own.** Every assumption and exclusion that binds this deliverable
> is written below, release-wide ones included. The [executive summary](00-executive-summary.md) is
> the index and the master.

<Keep this header on every deliverable file. It carries three things a file opened alone otherwise
cannot say: which release it belongs to, which version of this deliverable it is, and where the index
is.

**It is not the scope guard.** Earlier drafts made it one — "the release-wide exclusions in the
summary apply to this deliverable" — because the file did not carry them. It does now, so the header
states completeness instead of pointing at what is missing. That is what lets the executive summary be
dropped later without editing a single deliverable file.

**The `Version` here is the deliverable's own**, the same number as its row in the summary's table. It
sits in the file because on a re-issue this is the one thing that moves. The release version is in the
title of the executive summary and is not repeated here.>

**Personas**

- **`<persona>`** — `<every persona this deliverable's stories name. Extracted verbatim from the
  master persona list — the definition, not the name>`

**Glossary**

- **`<term>`** — `<every term this deliverable's reader trips on, extracted verbatim from the master
  glossary. Omit the whole element when there is genuinely nothing to define>`

<**Both lists hold everything this file uses, and are extracted straight from the master lists.**
There is no shared-versus-local judgement to make: if this deliverable's content uses an entry, the
entry is in this file. A persona or a term three deliverables use appears in all three files, as the
same bullet. That duplication is deliberate and it is free, because the extract is a **literal copy**
of the master entry — nothing is reworded on the way in and nothing release-scoped is appended to it.
A sentence true only of this release belongs in `Assumptions` or in `Notes / Constraints`, never glued
to a shared definition.

Copy the *definition*, never a list of names: every story already opens **As a** `<persona>`, so which
persona applies is on the page twice over. What a reader opening this file alone is missing is what
that persona *is*.

**This is where terminology goes that would otherwise be buried in Notes.** A definition inside a
paragraph of constraints is findable only by reading the paragraph. Given a labelled home it gets
found, and the Notes block gets shorter — which is the point, since Notes is the one block with no
structural limit on its length. What stays in Notes is the rule that *governs* a term, not the meaning
of the word.

**Define, do not restate.** A glossary entry says what a word *means*; it does not repeat a rule the
stories or Notes already carry. If an entry is only a rule with a term stapled to the front, it belongs
in Notes and not here. And do not manufacture entries to fill the element: an element that appears only
when it has something to say stays a signal.

**Both elements are bulleted lists, one entry per bullet, even at one entry.** These are the two lookup
blocks in the file — a reader scans them for an entry rather than reading them through — so they are
shaped alike and shaped for scanning.>

**Assumptions**

- `<every assumption that binds this deliverable, copied verbatim from the master in the executive
  summary's `Release Context`. Omit the whole element when nothing binds this deliverable.>`

<**This element is copy-only.** Every bullet is a verbatim bullet of the master's `Release Context`
`**Assumptions**`, so a change to the master is followed here and the two must never diverge — and an
assumption written here that is not in the master has no master to change. Where an assumption holds
for this deliverable and no other, the master still carries it once and this file still carries the
copy: the master holds everything, the files hold what binds them.

`**Out of scope:**` below is the one element that mixes — the deliverable's own exclusions, which are
in no master, alongside copies of the release-wide ones, which must match theirs exactly.

**Assumptions, not rules.** What must hold for this deliverable to be built as described — a
platform's behaviour, a dependency, something outside April9's control, something still to be
confirmed with its confirmer named. A rule that *governs* the behaviour is
`Notes / Constraints`; behaviour itself is a story.

This element exists rather than folding into `Notes / Constraints` for the reason the glossary
exists: `Notes` is the one block with no structural limit on its length, and an assumption buried
in a paragraph of constraints is findable only by reading the paragraph.>

**Today** `<the problem, from the persona's side: what it costs them now>`. **We're building**
`<the change itself, in functional terms>` **so that** `<the outcome that closes the problem>`.
`<A third sentence if something needs saying that the three clauses cannot carry — a threshold
that does not change, a fallback.>`

<One paragraph, three to five sentences, no labels and no bold beyond the three keywords.

**`Today` … `We're building` … `so that` …** — problem, change, outcome. Keep the three words
exactly and in this order; they are the paragraph's only signposts, and reworded per deliverable
they stop being a scan target. `so that` is the same word the story line uses and means the same
thing in both places: the outcome, not the mechanism.

Name the thing after **We're building**, not the work: "an explicit retention priority for the
Deals Board", not "prioritisation logic will be introduced". That clause is what a client scanning
the release and a developer checking they opened the right file will read on its own.

**Three to five sentences, none of them a wall.** Sentence count alone does not bound a paragraph.
This is the only prose here with no structure holding it, and it is where the approved proposal's
business case leaks back in — a `Today` clause that runs on has started re-deriving the proposal.

Watch for a keyword colliding with the domain's vocabulary — a filter whose options include one
named *Today*, say. Split them into separate sentences rather than reaching for a different
keyword.>

**User Story 1: `<verb-led title>`**

**As a** `<persona>` **I want** `<capability>` **so that** `<outcome>`.

1. **Given** `<state>`, **when** `<action>`, **then** `<observable result>`.
2. **Given** `<state>`, **when** `<action>`, **then** `<observable result>`.

**User Story 2: `<verb-led title>`**

**As a** `<persona>` **I want** `<capability>` **so that** `<outcome>`.

1. **Given** `<state>`, **when** `<action>`, **then** `<observable result>`.

<Bold the story keywords — **As a** / **I want** / **so that**, and **Given** / **when** /
**then** — so the grammar of a story is visible at a glance and a missing half is obvious.

Stories number from 1 **within their file**, and each story's criteria number from 1 within that
story. Nothing is numbered across the release: `User Story 1` in one deliverable file has nothing to
do with `User Story 1` in another. A criterion is named by where it is — "deliverable 3, User Story 1,
criterion 2" — which is what a person says out loud anyway.

**The stories are the acceptance criteria.** There is no separate criteria list. Anything that must
hold has one home — a story's Given/When/Then if it is behaviour, `Notes / Constraints` if it is a
rule or an interaction with existing behaviour, `In scope` / `Out of scope` if it is a boundary,
and the executive summary's `Release Context` if it binds the whole release.>

> **Notes / Constraints.** `<What bounds the change and what a reader needs in order to act on it,
> stated without repeating the stories: rules that govern the behaviour, what must hold that no
> story says, how this deliverable meets behaviour that already exists, dependencies, and the
> questions a developer or the client will ask. **Defined terms belong in Glossary above, not here**
> — what stays here is the rule that governs a term, not the meaning of the word.
> No code research — no field names, file paths or query internals. If a fact here needs
> confirming, confirm it with the client or the BA before this brief is issued; the brief states
> settled facts, not investigations.>`

<Both words, because the block does both jobs. *Constraints* is the larger half and the sharper
test — most of what belongs here bounds the change — but a deliverable also carries clarification
that constrains nothing and a reader still needs.

This is the largest block in the file and the only one with no structural limit on its length,
so the guard has to be stated: **the test is whether a reader needs it to build or to approve, not
whether the writer found it interesting.**>

**In scope:** `<the surfaces, actions or rules this deliverable touches — named items, not
sentences>`

**Out of scope:**

- `<one exclusion per bullet: this deliverable's own, plus each release-wide one copied verbatim from
  the master, in one list and unmarked>`

<The boundary closes the file. By the time a reader reaches it they know what the change is, so
these two lines answer the question they now have.

**One list, not two.** A reader asking "what does this not cover" does not care whether an exclusion
was written for this deliverable or for the release — they care what is excluded. So the copied
release-wide exclusions sit in the same list as the deliverable's own, unmarked. The author and the
gate tell them apart by comparing against the master, which is a text match, not a label the reader
has to carry.

**Bulleted, one exclusion per bullet** — for the same reason the master is: a copy has to be verbatim,
and an item folded into a semicolon-separated line is not a copy of anything. `**In scope:**` stays a
single line of named items, because nothing is ever copied into it.

Keep the line to named items and let the paragraph do the explaining: the test is whether it names
the *territory* the change lands in or restates the *change* itself. Below a certain size the two
converge — leave the line thin rather than manufacture a distinction.

**Copies are verbatim.** A release-wide exclusion reworded on the way in has drifted from the master,
which is the one defect this shape can produce and the gate checks for it.>
