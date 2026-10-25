# Current Codex handoff

Updated: 2026-10-25 (Europe/Madrid).

## Current state
Mock audience companions and recruitment modes are implemented. Audience mode replaces level skill selection with FIFO recruitment; empty queues bank credits. Host Join all recruits without earning credits; returning to level mode preserves existing companions. Solo is default and retains upgrades. Switching back to solo stops recruitment but retains active companions. Existing assets unchanged.

Random roles: Scout rapid shot, Volley spread, Piercer up to three distinct targets. Viewer stats and outcome summaries are visible. Crowded runs use rotating collision-free world labels while retaining the full roster. First attacks are staggered and the 512-shot pool reports saturation. The validation panel advances the real configured boss queue without saving progression.

## Validation
33 focused tests, TypeScript and the production build pass; the existing large-bundle warning remains. Browser verified three restart/outcome cycles, saved coins remaining 101 in simulation, configured boss-queue entry, level-16 Charmeleon evolution, and 100 active viewers with four collision-free labels. A roughly 27-second boss sample reported about 8.5 ms p95, 120 observed active shots and zero drops. It was not a sustained maximum-enemy-wave benchmark.

## Next action
Finish Step 5 acceptance: complete a configured boss sequence to natural victory and run a sustained crowded-wave benchmark before declaring the audience limit. Then perform live Twitch delivery/reconnect acceptance. See ../docs/implementation-plan.md.

## Deferred and constraints
Live Twitch authorization/delivery is explicitly deferred by user; provider/protocol tests do not establish live verification. Required before release. Assets remain the final implementation task. No assets replaced. No commits/pushes for the latest gameplay work; initial private repository snapshot is on origin feat/twitch-survivors-mvp at llamojha/twitch-survivors. Preserve all working-tree changes.
