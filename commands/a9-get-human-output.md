---
description: Turn a suite of SpecKit feature specifications into a stakeholder one-pager — a structured JSON summary of every user story in plain language, plus a standalone HTML page that renders that JSON. Run on request when the user wants the user stories across specs summarised, a plain-language release summary of what is being delivered, or a shareable page of spec content for a business audience.
---

## User Input

```text
$ARGUMENTS
```

You **MUST** consider the user input before proceeding (if not empty). It may name a specs directory, a release, an explicit set of spec files, or an output path. Anything it names overrides the defaults in step 1 and step 4.

## Outline

Produce a **one-pager**: a business reader takes in every feature and every user story at a glance, with no spec jargon and no acceptance criteria. Specs are long because they must be; the one-pager is short because it must be.

This command **reads specs and writes two new artefacts — it never edits a spec.** Two files come out of every run, in this order:

1. `humanized-spec.json` — the one-pager's content as structured data, always in the same shape.
2. `humanized-spec.html` — a standalone, shareable page that renders that JSON and nothing else.

The JSON is the single source of truth. The HTML is a fixed renderer with exactly one substitution point: the JSON is embedded into it verbatim, so the page needs no network access and the two files can never disagree.

This is a documentation *output* command, not a review. It consumes specs that already satisfy April9's Spec Writing Principles; judging them against those principles is `/a9-brd-review`'s job. Three facts from those principles are load-bearing here:

- The **feature-type banner** at the top of each spec (`[Portal Feature]` / `[Back-office Feature]`) names the system the feature belongs to.
- The **master persona list** supplies canonical persona names — use them verbatim.
- **Never invent a persona.** If a spec references one that is not on the master list, report it and recommend `/a9-brd-review` rather than inventing a name to paper over it.

All generated stakeholder content is written in **Australian English**.

### 1. Locate the specs

Glob `specs/*/spec.md` from the repo root, unless `$ARGUMENTS` names a directory, release, or file set — in which case use that.

Do **not** use `.specify/scripts/bash/check-prerequisites.sh` to resolve paths. That script resolves the current feature branch's single spec directory; this command summarises the whole suite.

If the glob matches nothing, abort with:

> ERROR: No specs found under `specs/*/spec.md`. Pass a specs directory or file set as an argument.

**Done when:** every spec file is listed and you have stated how many there are.

### 2. Read each spec for two sentences per story

Per spec, read:

- the feature title and its feature-type banner,
- each `### User Story N` heading — its title and `(Priority: PN)`,
- the narrative paragraphs beneath each story,
- enough of the Functional Requirements to name the concrete change.

The Clarifications, Success Criteria, Out of Scope, Edge Cases, and Notes for the team sections stay **unread** — they carry detail the one-pager omits.

**Done when:** for every story you can say, in the persona's own vocabulary, what goes wrong today and what changes.

### 3. Distil

- One entry per feature, in spec-number order, each with a one-line description of what the feature is for.
- One entry per story: a short title, one sentence of problem, one sentence of fix. No more.
- Rewrite each spec's wordy story heading down to **four words or fewer**. The gerund lead from Principle II may be dropped in the short title — the one-pager is prose for a stakeholder, not a spec heading.
- Use canonical persona names. One persona is attributed per system, not per feature — by Principle VII a suite spanning both systems has at least one persona per system, so do not force a two-system suite down to one persona.
- Group the features by the system their feature-type banner names. A single-system suite is still one group; the renderer suppresses the heading when there is only one.
- Decide, per story, whether it changes data — that split tells a reader where the risk sits. **The test:** a story changes data if its Functional Requirements create, update or delete a record. Everything else — reading, sorting, filtering, showing or hiding — is not data-changing.

**Done when:** no story runs past three sentences, every feature from step 1 is present, and no acceptance scenario has been copied across.

### 4. Write the JSON

Write to `<specs dir>/humanized-spec.json` unless `$ARGUMENTS` names a path. **Overwrite** any existing file — the one-pager always reflects the current state of the suite, and git history preserves earlier runs.

The release or set name comes from `$ARGUMENTS` when it names one; otherwise use the repository or product name that the specs sit under. Never invent a version number the specs do not state.

Every run emits **exactly this structure**, whatever the suite looks like. Filled with real values, a two-feature suite spanning both systems looks like this:

```json
{
  "schemaVersion": "1.0",
  "release": "Acme Fleet Release 4",
  "featureCount": 2,
  "storyCount": 3,
  "systems": [
    {
      "label": "Portal",
      "persona": "Fleet Manager",
      "features": [
        {
          "number": "001",
          "name": "Bulk vehicle import",
          "purpose": "Lets a whole month of vehicles be loaded in one go instead of one at a time.",
          "stories": [
            {
              "id": "US1",
              "priority": "P1",
              "title": "Import a spreadsheet",
              "problem": "Adding fifty vehicles means fifty trips through the same form.",
              "fix": "One spreadsheet upload creates them all, and names any row it could not read.",
              "changesData": true
            },
            {
              "id": "US2",
              "priority": "P2",
              "title": "Preview before importing",
              "problem": "A bad column is only discovered once the records already exist.",
              "fix": "The upload is shown back for checking before anything is saved.",
              "changesData": false
            }
          ]
        }
      ]
    },
    {
      "label": "Back-office",
      "persona": "Operations Administrator",
      "features": [
        {
          "number": "002",
          "name": "Import history",
          "purpose": "Shows who imported what, so a bad batch can be traced.",
          "stories": [
            {
              "id": "US1",
              "priority": "P3",
              "title": "Review past imports",
              "problem": "There is no record of which upload created a vehicle.",
              "fix": "Every import is listed with its owner, its date and its row count.",
              "changesData": false
            }
          ]
        }
      ]
    }
  ]
}
```

Structural rules — the renderer depends on all of them:

- **`systems` is always an array**, even for a single-system suite. `label` is `Portal` or `Back-office`, taken from the feature-type banner. Features stay in spec-number order within a system, and systems in portal-then-back-office order.
- **`featureCount` and `storyCount` are totals across every system**, and must match what is actually in the arrays.
- **`persona` is a canonical name or `null`.** Never invent one: if a spec references a persona that is not on the master list, set `null`, and report it in step 6 with a recommendation to run `/a9-brd-review`.
- **`number` is the spec's directory number as a string** (`"001"`), keeping any leading zeros. `id` is `US<n>` and `priority` is `P<n>`, both exactly as the spec writes them.
- **`changesData` is a boolean**, decided by the test in step 3. The page derives its data-changing footer from these flags, so a missing or guessed flag misreports risk.
- **No extra keys, no omitted keys.** A field with nothing to say still appears — as `null` for `persona`, or an empty array where a system genuinely has no features.
- **Every `<` in a string value is written as the JSON unicode escape** — a backslash followed by `u003c` (so `<b>` becomes `\u003cb>`). JSON decoders read it back as `<`, and it stops a literal `</script>` in spec prose from closing the data block when step 5 embeds this file in the page.

**Done when:** the file is valid JSON in exactly this shape, every feature and story from step 1 appears in it, the counts match the arrays, and every non-null persona is a canonical name from a master persona list.

### 5. Write the standalone HTML

Write `<specs dir>/humanized-spec.html` from the template below, starting at `<!DOCTYPE html>` — the leading HTML comment block documents the template's home in the April9 repo and MUST NOT appear in the generated page.

The template is a **generic renderer with two substitution points**. Copy it byte for byte and change only these:

1. The `{{HUMANIZED_SPEC_JSON}}` line inside `<script type="application/json" id="humanized-spec-data">` — replace it with the contents of the `humanized-spec.json` you just wrote. **Read that file back and paste what it contains** — do not regenerate the JSON, or the two copies will drift.
2. `{{RELEASE_NAME}}` in `<title>` — replace it with the `release` value. The renderer also sets the title at runtime; the tag matters because publishing tools read it statically, before any script runs.

Nothing else is edited. Do not touch the `<style>` block, do not add or remove markup, and never hardcode a feature, story, persona or heading into the body — the renderer builds the header, the system headings, every feature card, every story block with its priority chip, and the data-changing footer from the JSON alone. It handles light mode, dark mode, print, one-system and two-system suites, priorities P1 through P4, and the all/none data-changing cases already.

No HTML escaping is involved — the renderer assigns text, not markup, so `&`, `<`, `>` and quotes in spec prose need nothing beyond the JSON escaping step 4 already applied.

```html
{{include:shared/human-output-template.html}}
```

**Done when:** the file opens from disk with no external requests, no `{{PLACEHOLDER}}` remains, the embedded JSON is byte-identical to `humanized-spec.json`, and the rendered page shows every feature and story with no error banner in either light or dark mode.

### 6. Close out

State both output paths, the number of features and stories covered, any persona left `null`, and any spec you could not fully summarise and why.

Then offer to publish the HTML as a shareable Artifact link. Leave both files untracked — committing is a separate ask.

## General Guidelines

- **Summarise, never author.** You do not add scope, invent stories, or resolve gaps a spec left open. A spec that reads as incomplete is a finding to report, not a blank to fill.
- **No spec jargon in the output.** No file paths, no requirement IDs, no Given/When/Then, no acceptance criteria, no framework nouns. If a business reader would need the spec open to follow a bullet, rewrite the bullet.
- **Canonical persona names only** — no synonyms, no generic "the user".
- **Australian English** throughout the generated content.
- **One screen is the target.** Length is the deliverable's whole point; when a suite is large, tighten the wording rather than adding bullets.
- Always use absolute paths when running shell scripts.
- For single quotes in shell arguments, use escape syntax: `'I'\''m Groot'` (or double-quote the whole string when possible).
