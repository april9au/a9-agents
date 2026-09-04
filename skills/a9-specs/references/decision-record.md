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

## The `## Run status` block

The record opens with it. It is the run's phase cursor — what makes *where is this up to?* answerable
without reading the file, and what the author prints to the user at every phase transition.

```markdown
## Run status — run 1 · first run

- [x] 0 · orient — no folder present, so first run
- [x] 1 · input read — 5 deliverables identified
- [x] 2 · recon — 4 findings, 1 contradiction (raised as Q5)
- [x] 3 · vocabulary + release context — 13 terms, 1 persona, 2 proposed
- [x] 4 · draft — 5 files written, 9 tags open
- [x] 5 · clarification round — 7 of 7 answered
- [ ] 6 · amend — n/a, first run
- [ ] 7 · gate — **running**, a9-specs-gate ← here
- [ ] issued
- [ ] 8 · enrolment — 2 queued, offered after issue
```

**A phase waiting on a subagent is marked `running`, with the agent named.** The block has to tell
*not started* apart from *in flight* — a run whose gate is still thinking is not a run that skipped
its gate, and it is not a finished run either.

**Every ticked line carries the count that proves it.** A bare tick says only that something was
claimed; `recon — 4 findings, 1 contradiction` says what came back, and that is what makes the block
worth printing.

**On a re-issue it names the amend surface.** That is the *where am I* fact on an amend, because every
file outside the surface must stay byte-for-byte identical.

```markdown
## Run status — run 2 · re-issue
**Amend surface:** `00-executive-summary.md`, `02-deals-board-visibility-prioritisation.md`
```

**It is the one part of the record that is rewritten rather than appended**, and it shows the
**current run only**. The entries are the history; the block is only the cursor over them. A top-level
`## Run status` heading against the `### Q3` / `### R2` entry shape is what keeps the two
unmistakable.

**It is not an entry, and nothing blocks on it.** An unticked box is not an open question. A resumed
run reads the **open entries** as truth and the block as a convenience — a session killed mid-write
leaves the block stale.

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

### The enrolment offer

Step 8's question is a user answer like any other, so it is an **answered entry**, targeted
release-wide. Without it the status block is the only trace — and the block is rewritten each run, so
a later run cannot tell *never asked* from *asked and declined*, and will offer again.

```markdown
### Q7 — answered
- **Run:** 1
- **Target:** release-wide
- **Question:** Apply the 4 entries this run queued to the master lists?
- **Answer:** Yes — applied and cleared from the queue.
```

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
point. The `## Run status` block is the one exception, and it is not history: it is the cursor, and it
is rewritten in place.

## What the gate does with it

The record is one of the gate's three sources (input + master lists + record). Two consequences:

- **The gate's block condition is simply "any open entry."** That is the authoring rule with nothing
  added — an unanswered question blocks its deliverable, a release-wide one blocks the brief.
- **The gate ignores the `## Run status` block.** It is not an entry, so unticked boxes are not open
  questions and nothing about it can block. It is not a rubric item either — the rubric stays M1–M4,
  J1–J4.
- **The gate reads recon findings; it never re-runs recon.** A gate that re-derives has become a second
  author. Findings live here precisely so the source set stays at three.
