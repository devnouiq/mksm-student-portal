# AGENTS.md

This repository is designed for long-running coding-agent work on the **MKSM Student Portal**
(see `/docs/MKSM_Portal_Feature_PRD.md` for product scope, roles, and milestones). The goal is not
to maximize raw code output. The goal is to leave the repo in a state where the next session can
continue without guessing.

## Startup Workflow

Before writing code:

1. Confirm the working directory with `pwd`.
2. Read `session_state.md` for the latest verified state and next step.
3. Read `feature_list.json` and choose the highest-priority unfinished feature.
4. Review recent commits with `git log --oneline -5`.
5. Run the project's init/setup script (e.g., `./init.sh` or `make setup`).
6. Run the required smoke or end-to-end verification before starting new work.

If baseline verification is already failing, fix that first. Do not stack new feature work on top
of a broken starting state.

## Working Rules

- Work on one feature at a time.
- Do not mark a feature complete just because code was added.
- Keep changes within the selected feature scope unless a blocker forces a narrow supporting fix.
- Do not silently change verification rules during implementation.
- Prefer durable repo artifacts over chat summaries.
- Role-based access (Student / Teacher / Admin) is a cross-cutting constraint — verify feature
  work against the correct role's scope before calling it done (see PRD §2, §7).
- Subscriptions (Razorpay / PayPal) and Zoom links are **read-only / static** integrations — no
  payment processing or Zoom API integration is in scope (PRD §7, §12).

## Engineering Standards (mandatory)

All coding work in this repo follows the `engineering-workflow` skill. Load it at the
start of any feature, bug fix, or refactor — it sequences the stages below. These skills
are installed via APM (`apm.yml` → `devnouiq/engineering-standards-skills`) and live in
`.agents/skills/`.

- **Delegate to subagents** — `subagent-first`. Investigation, cross-file analysis, and
  research go to subagents; decisions and edits stay in the main thread. Launch
  independent investigations in parallel. Never hand-grep what a subagent can map.
- **Design with SOLID** — `solid-engineering`. Single responsibility, open/closed,
  Liskov, interface segregation, dependency inversion. Deep modules, bounded work,
  stateless services, no framework imports in domain logic.
- **Build test-first** — `tdd` / `unit-testing`. Cover failure paths, not just the happy
  path. Tests must be deterministic.
- **Security is a constraint, not a phase** — `secure-by-default`, then run the audit
  skills against the diff: `secure-code-review` always, plus `api-security`,
  `owasp-top-10-web`, `dependency-scanning`, `secrets-management`, `pipeline-security`,
  `threat-modeling`, `llm-top-10`, `prompt-injection`, or `agent-security` depending on
  what the change touched. Payment-status sync (Razorpay/PayPal), auth, and file upload
  paths (homework, practice material, announcements) are the highest-value targets for
  `api-security` and `owasp-top-10-web`.
- **Ship production-grade** — `production-readiness`. Error handling, structured logging
  with correlation ids, metrics, startup-validated config, timeouts and bounded retries,
  bounded/indexed queries, backward-compatible migrations, a real rollback path.
- **Review before done** — `code-review`, or delegate the diff to a reviewer subagent.

Code that skips the security or production-readiness gate is not done, regardless of
whether it works.

## Required Artifacts

- `feature_list.json`: source of truth for feature state
- `session_state.md`: session log and current verified status
- `init.sh` (or equivalent): standard startup and verification path
- `session-handoff.md`: optional compact handoff for larger sessions

## Definition Of Done

A feature is done only when all of the following are true:

- the target behavior is implemented
- the design holds up against `solid-engineering`
- tests cover the happy path and the failure paths, and they pass
- the `secure-by-default` gate ran against the diff and findings are resolved or explicitly accepted
- the `production-readiness` checklist is satisfied, or each gap is waived with a recorded reason
- the required verification actually ran
- evidence is recorded in `feature_list.json` or `session_state.md`
- the repository remains restartable from the standard startup path

## End Of Session

Before ending a session:

1. Update `session_state.md`.
2. Update `feature_list.json`.
3. Record any unresolved risk or blocker.
4. Commit with a descriptive message once the work is in a safe state.
5. Leave the repo clean enough for the next session to run the startup path immediately.
