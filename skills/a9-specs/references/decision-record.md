# The decision record

`specs/<releaseName>/decisions.md`. **Internal — never published.** The client receives the brief's
file set — `00-executive-summary.md` and the `NN-<slug>.md` deliverable files — and nothing else.

It is three things at once, and that is why it earns its keep:

1. **The audit trail.** It answers *"why does the brief say this?"*, and it is what stops the gate's
   most likely bogus flag — a fact the user supplied out loud, now written down.
2. **The state file**, which is what makes the author **resumable**. A long input will not always fit
   one session; without a persisted queue, a dropped session loses every question not yet asked.
3. **The change ledger.** Entries are run-stamped, so the set added since the last issue *is* the
   amend surface.

## What is recorded, and what is not

**A source needs recording only if it is not already durable.** The input is a file. The master lists
are files. Neither is copied here. The volatile sources are the user's answers and recon's findings —
so those, and only those, are what the record holds.

## Three entry classes

### Open question

The queue itself, persisted.

```markdown
### Q3 — open
- **Run:** 1
- **Target:** deliverable 2   <!-- or: release-wide -->
- **Question:** When the board is over its display cap, does an in-progress deal displace a purchased one?
- **Suggested:** Yes — in progress, then purchased, then lost.
```

**`Target` is load-bearing.** It is what blocks the right thing (a deliverable, or the whole brief),
and on a re-issue it is what computes the amend surface. Every entry has one.

Since the brief is a file set, a target now **names a file**: `deliverable 2` is `02-<slug>.md`, and
`release-wide` is `00-executive-summary.md` plus every deliverable file that leans on it. That is the
whole of the amend mechanism — no diff of the text is needed to know which files may move.

### Answered question

```markdown
### Q3 — answered
- **Run:** 1
- **Target:** deliverable 2
- **Question:** …
- **Answer:** In progress, then purchased, then lost.
- **Retired tags:** D2-order, D2-cap-composition, D2-framing
```

**`Retired tags` is not bookkeeping.** One-at-a-time pacing means answers cascade — one answer can
dissolve several tags at once. A record that pairs only Q with A will make the next run re-ask
questions this run had already made unnecessary.

### Recon finding

```markdown
### R2 — recon
- **Run:** 1
- **Terms:** age cutoff, display cap
- **Established:** closed deals leave the board 30 days after last update.
- **Not found:** whether the cutoff is applied per user.
- **Contradiction:** the input states 31 days. **Recon overrides the input** — raised as Q5.
```

Record `not found` explicitly. An absent finding and an unlooked-for one are different, and only the
record can tell them apart on the next run.

A **contradiction** entry always has a question behind it. Recon never silently corrects the input.

## Run stamps

Every entry carries the run that added it. On a re-issue this is the whole mechanism: the targets named
by entries stamped with the current run are the deliverable files that get redrafted, and every other
file in the set stays byte-for-byte identical — an unmodified file, which `git status` will confirm.

The record is **appended to** — never versioned into a second file, never superseded. History is the
point.

## What the gate does with it

The record is one of the gate's three sources (input + master lists + record). Two consequences:

- **The gate's block condition is simply "any open entry."** That is the authoring rule with nothing
  added — an unanswered question blocks its deliverable, a release-wide one blocks the brief.
- **The gate reads recon findings; it never re-runs recon.** A gate that re-derives has become a second
  author. Findings live here precisely so the source set stays at three.
