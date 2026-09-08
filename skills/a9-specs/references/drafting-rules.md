# Drafting rules

The rules the author applies while writing. The gate checks the result; these are what make the
result checkable.

## 1. The no-new-commitment test

A sentence is a **rewording** if every commitment in it traces to a source. It is an **assertion** if
it introduces one.

**Commitments** are the checkable nouns: named entities, actors, numbers, thresholds, states,
conditions, observable behaviours.

**Free** — tone, ordering, sentence structure, April9's grammar, consolidating several source
sentences into one, dropping detail. **Only adding is a violation; compressing never is.**

Worked. Source: *"sales staff can't tell which deals need attention first."*

- ✅ *"**Today** a Sales Consultant scanning the Deals Board cannot tell which deals need attention
  first."* — persona from the master list, everything else present in the source.
- ❌ *"…deals untouched for more than 7 days."* — `7 days` is a new commitment. It comes from the
  input, from recon, or from the user, or it does not appear.

**Not a semantic-equivalence test.** "Does this mean the same as the source?" sounds stricter but is
unfalsifiable and fails legitimate consolidation. This test is mechanical: for each commitment, point
at where it came from. That is what makes the gate affordable.

## 2. Tags

A commitment you cannot trace becomes an inline tag in the **working draft**. A tag never reaches the
client and is retired one of two ways:

- You **find the source** — the tag disappears, no trace.
- It **becomes a question** — the question and its answer land in the decision record, where the gate
  can see them.

So every tag that mattered is preserved and only the self-resolved ones vanish. **Emit when zero tags
remain**, or the deliverable is blocked.

## 3. What never earns a question

These introduce no commitment. They feel substantive; asking them is the forty-question grilling this
process replaces.

| Class | Looks like | Why it changes nothing |
|---|---|---|
| **Framing / polarity** | *"Frame it as what the board retains, or what drops off it?"* | Exact inverses. Same observable behaviour, opposite sign. |
| **Titles and wording** | *"What should User Story 1 be called?"* | Editorial. Not a blocking criterion anywhere in this process. |
| **Placement in the document** | *"Where should this be captured?"* | Where a behaviour is written does not change what is committed — and the boundary is read from the input, never negotiated. |
| **Below the brief's resolution** | Field names, enum values, query internals, file paths | Excluded from the brief by the template, so a question about them cannot change it. |

**A question that both introduces a commitment and looks like one of these is a real question.** The
classes suppress the framing, not the substance riding under it.

## 4. The release boundary

**The input fixes it. Read it; never negotiate it.** Whatever arrives in one run is what the brief
covers. There is no scoping step and there is no second artefact for small inputs — a paragraph
produces a release brief with one deliverable, which is the same file set with one deliverable file.

**Naming.** `<Release>` in the title comes from the input where the input names a release or version.
Where it does not, the brief is named after its source and the `Issued` line carries the date.

## 5. The file set — every file complete on its own

The brief is **`00-executive-summary.md` plus one `NN-<slug>.md` per deliverable**, numbered from `01`.

**The governing rule: a deliverable file is complete on its own.** Everything that binds a
deliverable is written in that deliverable's file — the personas and terms it uses, the assumptions
that hold for it, and every exclusion that applies to it, release-wide ones included. Nothing binding
sits behind a reference.

**The executive summary is the master, and it is removable.** It states every assumption and every
release-wide exclusion once, as **bulleted lists, one item per bullet**, and each deliverable file
copies down the items that bind it. The master is where an item is *changed*. The test of whether the
copies are complete: **if the executive summary were deleted, no deliverable file would need an
edit.** That is the intended future, so write to it now.

**Two copy families, one rule.** Vocabulary copies from the master lists; assumptions and
release-wide exclusions copy from the master's `Release Context`. Both are **verbatim** — nothing
reworded on the way in, nothing release-scoped appended. **Drift between a copy and its master is
the defect**, not the duplication, and it is a text match to check.

**Where each copy lands in a deliverable file:**

| Copied item | Lands in |
|---|---|
| Persona | `**Personas**` |
| Glossary term | `**Glossary**` |
| Assumption | `**Assumptions**` — **copy-only**, so every bullet has a master bullet behind it; omit the element when nothing binds this deliverable |
| Release-wide exclusion | that file's `**Out of scope:**` list, alongside its own — the one **mixed** list, so its own items have no master and the copies must match theirs exactly |

Exclusions land in **one list, not two**: a reader asking what is not covered does not care which
scope an exclusion was written at. The author and the gate distinguish them by comparing against the
master.

**Every list that receives a copy is bulleted, one item per bullet** — the master's two elements and
each file's `**Out of scope:**`. A copy has to be verbatim, and an item folded into prose or a
semicolon-separated line is not a copy of anything. `**In scope:**` stays a single line: nothing is
ever copied into it.

**The back-reference header is not the scope guard.** It carries the release identity, the
deliverable's version and a pointer to the index. Completeness is what dissolves the scope hazard a
split brief used to have — the header no longer has to point at what the file is missing, because
nothing binding is missing.

**Breadth is part of an exclusion's commitment.** Deciding a release-wide exclusion binds one
deliverable rather than five **removes it from four** — a commitment moving, with the version
consequence in §7, not a placement tidy-up. Assumptions rarely behave this way: one that only ever
constrained a single deliverable was misfiled if it read as release-wide, and filing it correctly
moves nothing. **When it is arguable which deliverables an exclusion binds, ask** — that is a real
question under §1, not one of §3's suppressed classes.

## 6. `None stated`

Where no source states a release-wide exclusion, `## Out of scope (release-wide)` in
`00-executive-summary.md` reads **`None stated`** and **the heading survives**. Deleting the heading
hides that the question was reached; inventing an exclusion to avoid an empty section is a straight violation of §1, in the one place a
client is most likely to be held to the words.

What you **may** do is offer candidates drawn from the input, as questions: *"the tickets mention X but
nothing asks for it — out of scope?"* An answer is confirmed source. Silence leaves the line empty.

## 7. Versions

**Read, never assigned.** Each deliverable's `Version` is the number the input gives it, or `0.1.0`
where the input gives none. Inventing a version is inventing a commitment.

**The release version is not a field in the brief.** It lives in the title, where the input's own
naming puts it, and repeating it in the header said nothing the title did not — struck as revision 24.
So the table below is the only version rule the author runs, and it governs deliverables.

On re-issue, only the changed deliverables' numbers move:

| Change | Bump |
|---|---|
| A commitment changes, is added, or is removed | **minor** — `0.1.0` → `0.2.0` |
| Wording, ordering or compression only | **patch** — `0.1.0` → `0.1.1` |
| Untouched | none — and the file is byte-for-byte identical |

**A relocation is a patch, a change of breadth is a minor.** Moving an assumption from the master's
prose into a file's `**Assumptions**`, or copying a release-wide exclusion down, moves no commitment —
the deliverable was already bound. Deciding an exclusion no longer binds a deliverable does move one,
for that deliverable.

`1.0.0` is undefined here. *Delivered* and *accepted* are both recorded in April9's delivery system.

## 8. Recon findings

A **contradiction** between recon and the input **overrides the input** — but it becomes a question,
never a silent correction. The client may have asked for a change *from* the current behaviour, and
only they can say which.

`not found` is a finding and is recorded as one. It is not licence to assume the input is right.

**No code detail reaches the brief.** No field names, file paths, enum values or query internals. The
rule is about the *output*, not the process — you may read anything; the brief states settled facts,
not investigations. The decision record legitimately holds the detail.

## 9. What has no rule here

**Register and voice.** The locked template governs them in its own guidance and you already carry it.
There is deliberately no register section in this file, and the gate has no matching check — the brief
must read the same whether a proposal exists or not, and a voice rule sourced from one input shape
would be exactly the mode-dependence this process forbids.
