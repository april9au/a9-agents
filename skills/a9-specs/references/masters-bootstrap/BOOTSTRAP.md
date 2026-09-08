# Masters bootstrap

The four files beside this one are the **starter** for a repo that has no master lists yet.

The lists are scoped **per system, and for now a system is a repo** —
so they belong in the repo the skill is run against, never in the skill directory and never in the
agents repo. This directory is a seed, not a source of truth: copy it out, then forget it.

```
cp -R references/masters-bootstrap/{README,glossary,personas,pending-entries}.md specs/_masters/
```

`README.md` is the contract and copies **verbatim** — it is system-agnostic, and it is the one file
that changes when the lists move behind MCP. The three lists start **empty**: a repo's vocabulary is
earned by enrolment, one confirmed answer at a time, and seeding another system's terms would put
words in a client's mouth that no input ever used.

Do not copy this file itself.

## Which copy wins

`README.md` here is a **seed**, and the seed is never the authority. The contract a run resolves is
the one in the repo being written — `specs/_masters/README.md`, or a sibling
`specs/_masters-<system>/README.md`. The gate resolves that same file and never looks in here, so a
seed that has drifted is invisible to it. Where the two differ, **the repo's copy is what governs
that repo**; fix the seed separately.
