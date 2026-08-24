---
name: test-fix-loop
description: Run the project's test suite, automatically fix failures using the debugger agent, and loop until green or a maximum iteration count is reached.
---

## Steps

### 1. Detect the test command

Check `package.json` for test scripts. Common patterns: `test`, `test:unit`, `test:integration`, `test:e2e`.

- If a single `test` script exists, use it
- If multiple exist, ask the user which to run or confirm running all in sequence
- If no `package.json` exists, look for `Makefile`, `pytest.ini`, `go.mod`, or equivalent and detect the test runner accordingly
- If no test command can be determined, ask the user to provide one

### 2. Run tests

Execute the test command and capture full output including stdout and stderr.

If tests pass on the first run, report success and stop — no fixes needed.

### 3. Fix loop (max 5 iterations)

For each iteration:

1. Parse the failure output to identify failing tests, assertion messages, and stack traces
2. Delegate to the `debugger` agent with: the failure output, the relevant source files, and the test files — ask it to diagnose and fix each failure
3. Apply the fixes
4. Re-run the test command
5. If green, exit the loop with a success report
6. If still failing after 5 iterations, exit and report remaining failures

Do not re-attempt an identical fix that already failed in a previous iteration. If the debugger agent produces the same fix twice, stop and escalate to the user.

### 4. Report

**On success**: report which iteration tests went green, list the fixes applied, and suggest `/spec-guard` if not yet run.

**On failure after max iterations**: report the remaining failures, summarise what was attempted in each iteration, and ask the user to review manually before continuing.
