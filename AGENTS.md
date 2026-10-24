# Codex project instructions

Read `CLAUDE.md` for shared engineering rules, then `.codex/STATUS.md` for the current handoff. Read `docs/implementation-plan.md` before choosing the next task. User instructions override these files.

## Keep work recoverable
- At the end of each meaningful work session, update `.codex/STATUS.md` with the current milestone, completed work, actual validation, limitations and next action.
- Append substantive changes and decisions to `docs/hackathon.md`. Preserve historical entries; clearly mark superseded decisions in new entries.
- Keep agreed future work as checkboxes in `docs/implementation-plan.md`; update `docs/migration-plan.md` when milestone status changes.
- Update `docs/product-spec.md` when the user changes requirements. Distinguish confirmed decisions from proposed defaults.
- Do not duplicate the full task list across handoff files. Link to the authoritative plan.
- Record tests as passed only when actually run; distinguish local/protocol testing from real Twitch verification.
- Never record tokens, credentials, environment secrets or private chat transcripts. Do not read credential files.
- Do not stage, commit, push or publish without explicit instruction.

## Current product constraints
- Both Twitch and local simulation use the same audience event/queue path.
- Keep inherited assets until the final pre-release implementation step.
- Default recruitment is level-based, with host-controlled Join all.
- Viewer roles and contributions reset per run; streamer progression persists.
- Implement first, then test; no TDD. Preserve working game systems and keep changes scoped.
