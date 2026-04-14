# a9-agents

Shared Claude Code harness distributed to all devs via `node sync-agents.js`.

## What gets synced

| Source | Destination | Purpose |
|---|---|---|
| `agents/` | `~/.claude/agents/` | Subagent definitions |
| `commands/` | `~/.claude/commands/` | Slash commands |
| `skills/` | `~/.claude/skills/` | Skill directories (SKILL.md + references/) |
| `hooks/` | `~/.claude/hooks/` | Global hook scripts |

Only agents listed in `agents-config.json` `whitelist` are synced.

## Adding an agent

1. Create `agents/my-agent.md` with the agent definition
2. Add `my-agent.md` to the `whitelist` array in `agents-config.json`
3. Run `node sync-agents.js`

## Adding a skill

1. Create `skills/my-skill/SKILL.md` — must include `name`, `description`, `user-invocable` frontmatter
2. Add reference files in `skills/my-skill/references/` (loaded on demand by the skill)
3. Add hook scripts in `skills/my-skill/scripts/` if the skill needs framework-level enforcement
4. Run `node sync-agents.js` — the entire directory syncs to `~/.claude/skills/my-skill/`

Skills are invoked by agents or users via the `Skill` tool. Keep `SKILL.md` lean — put patterns in reference files.

## Adding a hook

1. Create the script in `hooks/` (flat files only, no subdirectories)
2. Run `node sync-agents.js` — scripts sync to `~/.claude/hooks/` with `chmod 755`
3. Wire the hook in `~/.claude/settings.json` if it should run globally, or in a skill's frontmatter if skill-scoped

## Running the sync

```bash
node sync-agents.js
# or with a custom config:
node sync-agents.js my-config.json
```
