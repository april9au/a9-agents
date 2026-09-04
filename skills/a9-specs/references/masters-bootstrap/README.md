# Master lists — the read contract

Two master lists back every release brief: a **glossary** and a **persona list**. A brief
**extracts** the entries it needs into its own files — one `**Personas**` and one `**Glossary**` per
deliverable file. It never links back, and the reader never leaves the brief.

This file is the **single indirection**. The authoring skill and the gate resolve vocabulary through
the operations below and **never open a master file by path**. When the lists move behind an MCP
server, this file changes and nothing else does.

## Scope — per system, and for now a system is a repo

```
specs/_masters/glossary.md
specs/_masters/personas.md
specs/_masters/pending-entries.md
```

At the root of the repo the system lives in. **The leading underscore is deliberate**: the lists are a
sibling of the release folders under `specs/`, so anything enumerating `specs/*/` to list releases would
otherwise pick them up as one — and nothing forbids an input actually being called *masters*. The name is
reserved here, inside the indirection, so no caller changes. **The repo is the scope**, so nothing in a path or an
entry names the client or the system — there is only ever one pair of lists in reach, and the
operations below take no scope argument.

Per system rather than per client or global, because a term's meaning is fixed by the system that
uses it: `Discard`, `Vehicle Details` and `Display cap` mean what the Car Buying Portal makes them
mean. A persona working across two of a client's systems is defined in both repos — a duplicated
bullet is cheaper than an ambiguous one.

**This is the one thing the indirection has to absorb.** Behind MCP the lists are no longer reached
by being in the same repo, so the system becomes an explicit key. The operations gain that key;
callers do not change, because a caller only ever means *this system*.

## Operations

**`list()`** → every entry in the glossary or the persona list, as bullets.

**`find(surface_form)`** → the entry whose text matches `surface_form`, or nothing. **Case-insensitive**: the V2.50.0 fill writes *"untasked deals"* and *"source data"* in lower case against capitalised entries.

> **`find` is full-text over the whole entry, not a match on the headword.** This is the rule that
> exists because of a specific failure: prototype revision 20 keyed the glossary on the *proposal's*
> vocabulary rather than the brief's, and "a term-for-term scan matched nothing." Searching
> `Remaining` must return the **In progress** entry, because that entry says *"The proposal calls it
> 'Remaining'."*

> **`find` reads the queue as well as the list.** Where the master misses, `find` looks in
> `pending-entries.md` and returns a queued entry, marked as queued. Without this, a term enrolled in
> one run is invisible to the next and the user is asked for it again — a queue nothing reads cannot
> stop vocabulary being re-derived. A queued entry is a legitimate source: it has a confirmed user
> answer behind it, which is exactly what the gate's M1 checks for.

**`propose(entry)`** → queues a new entry for enrolment. It does **not** write to the master list.
See *Enrolment* below.

**`apply()`** → writes the queued entries into the master list and clears them from the queue.
**Called only at issue, and only on the user's yes.** See *Enrolment* below.

**Today these resolve to:** read `specs/_masters/glossary.md` / `specs/_masters/personas.md` from this
repo; `find` is a plain full-text search of both those files and then
`specs/_masters/pending-entries.md`; `propose` appends to the queue; `apply` moves each queued bullet
into `glossary.md` / `personas.md` **verbatim** and deletes its row.
**Later:** the same four operations, served by MCP, with a system key — where `apply` may be refused,
and the queue then simply stays.

## Entry shape — the master entry is what the brief prints

One entry, one bullet, verbatim. The extract is a **copy**, not a transform: what the master holds
is exactly what appears under `**Glossary**` or `**Personas**` in every deliverable file that uses it.

```markdown
- **Age cutoff** — the window after which a closed deal stops appearing on the board, measured
  from when it was last updated. In-progress deals are never removed by it.
```

**No metadata fields, and no aliases column.** A glossary entry only earns its place where the
client's word and the system's word differ — which is the template's own rule — so the entry text
*already names its aliases*, in prose, as part of the definition. That is what makes `find`
full-text and it is why nothing else has to travel alongside the copy.

**Nothing is appended at extract time either.** A brief may not add a release-scoped clause to a
copied entry; if a sentence is only true of one release it belongs in that brief's `Assumptions` or
`Notes / Constraints`, not glued to a shared definition.

## The extract target — one glossary per deliverable file

The brief is a **file set**: `00-executive-summary.md` plus one `NN-<slug>.md` per deliverable.
**Every deliverable file carries its own `**Personas**` and `**Glossary**`**, holding every entry that
file's own content uses. `00-executive-summary.md` carries no vocabulary at all — its `## Release
Context` holds only the release-wide assumptions and exclusions.

Extraction is therefore **one hop per file**, and mechanical: for each deliverable, collect the
personas its stories name and the terms its content uses, `find` each, copy the bullets in. There is
no shared-versus-local judgement — if the file uses the entry, the entry is in the file, so a term
three deliverables use is the same bullet in all three. That duplication is what lets a deliverable be
read alone, and it costs nothing because the copy is literal and this list is its one source of truth.

A brief that reworded one copy and not another has broken the extract, not saved space.

## Enrolment — confirm, queue, apply at issue

A term or persona the brief needs that is not on the list is **never coined in passing**. The process
asks the user (ticket 04's format: direct question, recommended answer, discuss-or-annotate), and the
answer makes it confirmed source.

Then the entry goes to **two places**: into the brief being written, and onto `pending-entries.md`
via `propose`. **A run in progress never writes to a master list.**

**After the gate is clean and the brief is issued, the run offers the queue.** It reports what it
queued and asks once; on a yes it calls `apply()`. On a no — or no answer — the entries stay queued,
`find` keeps returning them, and nothing is lost.

**The write is byte-neutral by construction.** The master ends up holding exactly the text already
copied into the deliverable files, so every copy still matches character for character and M1 reads
the same before and after. That is what makes mutating shared vocabulary safe to do at all; the
confirmation is what keeps a human in front of it.

Two reasons it is an offer at issue rather than a write during the run, and the second is the binding
one:

1. A run in progress must not mutate shared infrastructure that other briefs are reading. After issue,
   with the gate already clean, there is no run left to disturb.
2. **It has to survive the MCP move.** Behind MCP the list may not be writable at all, so `apply`
   degrades to *post a proposal that may be refused* and the queue persists. **Accepted exposure,
   stated not glossed** — `propose` and `find`'s fallback are what keep the process whole when it
   does, and the brief never waits on either.
