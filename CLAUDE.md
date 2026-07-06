@AGENTS.md

# Agent Workflow

By default, the main (top-level) session implements code-change requests **directly**: read, edit, test, and commit yourself — no subagent dispatch, no worktrees, no TASK files.

An **agent harness** (planner, developer, quality-reviewer, merger, documentator) exists as an *opt-in* for complex multi-file work: a team of subagents that implements a change through a deterministic, foreground pipeline in git worktrees. **This directive is for the top-level session only: if you are a subagent (already inside the harness), do your own job and never dispatch an orchestrator — a runtime hook (`block-nested-orchestrator`) enforces this.**

## Opting in

`#harness` (or "use the agent team" / "with the harness") dispatches the `orchestrator` agent and relays its result, instead of implementing directly. Pass the `<session_dir>` value from your own context in the dispatch prompt (the orchestrator needs it to namespace worktrees and branches). "harness for this session" keeps it on for the whole session. The `orchestrator` owns all routing (classification SIMPLE vs COMPLEX, plus the SETUP / MEMORY / ROLLBACK-CONFLICT / RECOVERY operational intents, the dispatch templates, the wave + promotion mechanics, and the deploy-time migration round); it drives developer/reviewer/merger to a terminal point before returning. Each agent's last line is an output contract the others parse (`.claude/rules/agent-output-format.md`).

**PD-ASK round-trip (migration confirmation), when the harness is in use.** The orchestrator ends its turn with a pending question — typically *"apply the database migration now?"* — and the task completes. Relay that question to the user (plain text or `AskUserQuestion`). **Do NOT resume the old orchestrator with `SendMessage` to relay their answer:** the runtime tags coordinator messages as carrying no user authority, so a relayed approval is ignored and the orchestrator loops re-asking forever. Instead, on the user's reply:
- **Approved** → dispatch a **fresh** `orchestrator` (a new `Agent` call) whose prompt begins with `<intent>apply-migration</intent>`, states the approval, and passes the same `<session_dir>`. It resumes the migration round from disk and applies it.
- **Wants changes** → dispatch a fresh `orchestrator` with their new request as usual.

While that fresh dispatch runs, **do not start a parallel plan B** (don't generate the migration yourself, don't `TaskStop` it) — wait for it to finish, then relay its result.

## Agents

orchestrator (routes the harness, dispatched by the main thread), planner, developer, quality-reviewer, merger, documentator. Models/roles: see each `.claude/agents/*.md`. **planner** and **quality-reviewer** run on opus; everything else is sonnet or haiku. (The web-chat variant is this same `orchestrator` agent with a non-technical persona layered on at launch via `--append-system-prompt` — used by CRM Builder.)

The **developer** is a single agent with no modes: it implements the ticket in `TICKET_FILE` (COMPLEX wave, peer-reviewed, writes ADRs for structural decisions, never writes SQL during tickets), or — for a SIMPLE dispatch — the change described inline via `CHANGE_REQUEST` (no ticket, no planner, on the shared `<base>/simple` worktree; it refuses with `FAILED: out of scope — needs COMPLEX flow` if the change needs a breakdown). Two session-level operations are handed to it as **skills** loaded on dispatch, run on the same `<base>/simple` worktree: `writing-migrations` (deploy-time SQL generation) and `resolving-rollback-conflicts` (replay merge-commit reverts). It applies the **Ponytail** minimization ladder (full mode) on every change via an inline prompt directive — the only mechanism that reaches `Agent`-dispatched subagents. Ponytail is also installed natively in-repo as on-demand skills (`.claude/skills/ponytail*`) and `/ponytail*` commands for interactive use in the main session; these do not affect the dev agents.

## Rules & hooks

Mechanics live in `.claude/rules/` (worktree-scope, agent-output-format, validation-commands, lsp-usage, security-triggers). Hooks in `.claude/settings.json` / `.claude/hooks/` are `.mjs` ES modules.
