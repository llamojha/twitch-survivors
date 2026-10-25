# Twitch Survivors — Twitch-first MVP implementation plan

Revised 2026-10-24 following user feedback: Twitch is the core, so real chat integration is the first new feature. The previous M0–M8 sequence is superseded. Do not wait for a full content audit, mock system, combat refactor, or UI redesign before connecting Twitch.

## MVP outcome

A real viewer types !join in the streamer's Twitch channel, appears in the game queue, and becomes a named autonomous companion with a random compatible skill. Player levels recruit viewers by default; a host-controlled Join all mode admits everyone who joined. Viewer damage/kills are visible. A run can end and restart cleanly while streamer progression persists.

Keep existing maps, bosses, upgrades, progression and assets. Their presence does not require converting every inherited attack or verifying every stage before proving the core audience loop. Preserve existing functionality and avoid unrelated changes. Use one existing playable stage as the MVP acceptance path, then smoke-check any other stage explicitly offered as supported with audience mode.

## Step 0 — existing playable foundation
- [x] Clone upstream and preserve attribution.
- [x] Play/Enter immediately launch the inherited game.
- [x] Verify launch in the real browser; typecheck and build pass.

This is enough to begin Twitch integration. Full upstream inventory is not a prerequisite.

## Step 1 — build audience input with two modes (IMPLEMENTED)
- [x] Define one normalized viewer event and shared FIFO queue with duplicate protection.
- [x] Local mode: join as Alice or another name; add 10 viewers without credentials.
- [x] Twitch mode: authenticated chat connection receiving !join, token validation and connection status.
- [x] Keep tokens in memory, clear the token field after connecting, and sanitize connection errors.
- [x] Disconnect old sources and ignore stale callbacks on mode changes.
- [x] Show the same queue in both modes; reset on new runs while keeping the connection.
- [x] Verify local joins, duplicates, mode switching, narrow layout and Enter isolation in the browser.
- [x] Run 12 focused tests, typecheck and production build.

Live Twitch delivery is not yet verified. The provider currently accepts an existing user access token; an integrated OAuth login screen is not included. See [connection setup](twitch-setup.md).

## Step 2 — live Twitch acceptance (DEFERRED by user, 2026-10-25)
- [x] Verify a simulated join appears in the audience queue during the base game.
- [x] Integration-test Twitch protocol messages and local joins through the same AudienceSession: FIFO, duplicates, run reset and stale-message rejection.
- [ ] Connect an authorized Twitch channel and send a real !join.
- [ ] Confirm real and simulated viewers use the same queue behavior and duplicate protection.
- [ ] Record live acceptance evidence; keep local development available if authorization is unavailable.

Local/protocol acceptance passes. Actual Twitch authorization and delivery are deferred until after mock gameplay development, but remain required before release. Protocol unit tests alone do not establish live acceptance.

## Step 3 — turn mock viewers into companions (IMPLEMENTED)
- [x] Inspect the existing companion and attack paths needed for one skill.
- [x] Recruit named companions through the shared session; browser-verify local followers and automatic projectile firing. Live input acceptance remains deferred.
- [x] Preserve viewer ownership through companion projectiles, including pooled-shot reuse.
- [x] Add three distinct projectile roles using existing visuals: Scout, Volley and Piercer.
- [ ] Verify both local and Twitch participants behave identically.

## Step 4 — implement recruitment modes (LOCAL IMPLEMENTATION COMPLETE)
- [x] Recruit from the queue on level-up by default in audience mode, in FIFO order.
- [x] Add host-controlled Join all for waiting viewers and subsequent joins.
- [x] Show waiting/active counts, credits and role labels.
- [x] Bank empty-queue credits; audience recruitment replaces the skill picker; solo keeps upgrades.
- [x] Test duplicate joins, empty queues, mode switching and pause gates; browser verifies solo skill picker.
- [ ] Confirm the same recruitment behavior using real Twitch input.

## Step 5 — complete and test runs
- [x] Track effective direct projectile damage and kills per viewer, counting actual damage once.
- [x] Add a simple run summary and clear viewer roles/stats on restart.
- [x] Preserve streamer progression and existing solo gameplay; migrate victories separately from deaths.
- [x] Use local simulation for repeatable gameplay, join bursts and measured load tests.
- [ ] Use real Twitch for authorization, delivery and reconnect tests.
- [ ] Verify a full natural stage victory and record supported audience capacity from a sustained crowded-wave run.
- [x] Smoke-check retained stage, boss, evolution and upgrade contracts offered in the MVP.

Exit: a complete repeatable audience-driven run with visible contributions and documented operating limits.

## Step 6 — replace assets last and verify release
- [ ] Only after the functional MVP, replace distributed Pokémon assets/identities with original or verified reusable fantasy art.
- [ ] Preserve map structure, mechanics and tested collision contracts.
- [ ] Exclude unused/unverified inherited assets from the release package.
- [ ] Replace title imagery with a real final-game screenshot and update provenance notices.
- [ ] Run final-art gameplay checks, typecheck, build and a real Twitch demo.
- [ ] Review the release package before any separately authorized publication.

No asset replacement is part of steps 1–5.

## Explicit post-MVP backlog
- [ ] Expand audience compatibility across the full inherited companion/attack catalog.
- [ ] Exhaustive stage/boss/upgrade compatibility matrix and regression coverage.
- [ ] Larger 50/100-viewer benchmarks and any capacity-driven optimization.
- [ ] Elaborate roster/leaderboard, optional healing stats, advanced balancing and UI polish.
- [ ] Desktop packaging if requested.

These items preserve the longer-term direction to adapt most of the inherited game. No existing content is deleted merely because it is outside the first audience acceptance path.

## Engineering policy
Implement first, then add meaningful tests; no TDD. Use existing npm typecheck/build gates and low-concurrency browser checks. Keep credentials out of source/logs; never put a client secret in the browser. Retain a tiny normalized audience boundary so mock and real events use the same code. Keep save contracts stable; test any necessary migration without deleting user data. No staging, commits, pushes or publishing without instruction.

## Current slice — 2026-10-25 mock companion prototype

Goal: named simulated viewers follow the player and fight using retained companion assets. No Twitch setup required.

1. Extend the shared session with waiting/active state while keeping once-per-run identity protection (`src/audience/AudienceSession.ts`, `src/systems/ViewerRegistry.ts`).
2. Reuse companion orbit/target/projectile behavior; add viewer labels and explicit projectile owner metadata (`src/entities/Companion.ts`, `src/systems/CompanionSystem.ts`).
3. Admit viewers during an active game as a temporary immediate-admission prototype; clean listeners and entities at shutdown (`src/scenes/GameScene.ts`). Level recruitment remains step 4.
4. Show accurate waiting/active counts in `src/ui/AudiencePanel.ts`.
5. After implementation, test lifecycle/duplicate behavior, run typecheck/build and verify named followers and combat in the real browser.

Preserve solo companion drops and existing assets. Do not claim final role variety if only projectile parameter variants are implemented. Keep live verification deferred, not marked passed.

## Recruitment implementation — 2026-10-25

User approved implementing the proposed next slice. Audience mode replaces the level skill picker with a recruitment credit; solo keeps normal upgrades. Empty queues retain credits. Join all admits existing/new viewers, earns no level credits, and returning to level mode preserves companions. Enabling audience mode mid-run starts from the current level, without retroactive rewards.

- [x] Add pure recruitment state and shared-session admission gates, tested after implementation (`src/audience/RecruitmentState.ts`, `AudienceSession.ts`, focused tests).
- [x] Integrate actual level rewards and retain evolution/rare-candy lifecycle (`src/systems/UpgradeSystem.ts`, `src/scenes/GameScene.ts`).
- [x] Add host audience enable/mode controls and local level simulation using the actual level-up path (`src/ui/AudiencePanel.ts`).
- [x] Assign a small random catalog of distinct projectile behaviors using existing visuals (`src/audience/CompanionRoles.ts`, `src/entities/Companion.ts`, `src/systems/CompanionSystem.ts`).
- [ ] Verify FIFO, duplicate levels/joins, banked credits, mode transitions, pause and restart; run tests/typecheck/build and real-browser checks.

Risks: evolution and rare-candy pauses must resume correctly; pooled projectiles must reset role and hit state; no new art or dependencies. Live Twitch acceptance remains deferred.

Validation 2026-10-25: 22 tests and production build (including TypeScript) pass. Browser verified one-level admission, banked credit with late batch, Join all, return to level mode retaining companions, role labels, and solo picker. Extended restart/evolution/rare-candy browser regression remains part of run verification.

## Current execution — stats, lifecycle and capacity (2026-10-25)
- [x] Track effective viewer projectile damage and kills; snapshot final contributions before terminal cleanup.
- [x] Consolidate run finalization to prevent duplicate persistence; verify forced outcomes and restart cleanup.
- [x] Add labelled local validation runs/controls with isolated saved progression.
- [x] Add bounded timing samples and viewer/enemy counts; smoke-test 10/20/50 viewers.
- [x] Start both retained stages and spawn their first boss for a smoke check.
- [x] Run focused tests, typecheck/build and browser checks.
- [ ] Verify natural death and boss victory across three consecutive runs, including persistent progression and actual evolution/reward pause paths.
- [ ] Benchmark sustained crowded waves and boss combat, determine a supported audience capacity, and address overlapping viewer labels.
- [ ] Test the retained MVP maps, bosses and upgrades beyond the initial spawn smoke checks.
- [ ] Decide whether to attribute damage-over-time effects; current stats count direct viewer projectiles only.

Browser smoke results, 2026-10-25: on an Apple Silicon Mac (Mac17,2, 32 GB), in-app browser at approximately 486×779, 10, 20 and 50 active viewers fought small groups of 3–4 enemies. The rolling Phaser delta monitor reported about 8.3 ms mean and 8.4 ms p95, but these are smoothed game-loop deltas from brief samples, not a capacity or frame-latency guarantee. Labels overlap at 50 viewers. Phase 1 Raticate and phase 2 Arcanine spawned; neither was verified through a natural boss defeat. Forced victory and defeat showed summaries, restarting cleared the roster, and saved coins remained unchanged in simulation. A test rare candy reached level 2; evolution was not verified.

## Planned slice — gameplay reliability and crowded audiences

**Goal:** finish the local/mock gameplay MVP so a complete audience run has correct outcomes and progression, remains readable under crowding, and has a documented operating limit. Live Twitch authorization and replacement art remain outside this slice.

**Scope:** product fixes plus the minimum local validation tooling needed to exercise a 12–52 minute stage without waiting in real time. Validation controls must mark the run as a simulation and must never alter the saved profile. Existing maps, combat, assets and save data remain compatible.

### Task 1 — correct persistent run outcomes
**Files:** `src/scenes/GameScene.ts`, `src/systems/SaveSystem.ts`, `src/scenes/StatsScene.ts`, `tests/run-lifecycle.test.ts`, `scripts/test-audience.mjs`.

- Add an explicit `defeat | victory` outcome to the saved run result and lifetime accumulation contract.
- Increment deaths only for defeats and add a migrated lifetime victory counter for wins; preserve older v1/v2 saves by filling the new field during load.
- Keep the existing one-time terminal guard so duplicate death, boss and UI events cannot award coins or stats twice.
- Confirm normal runs persist coins, records and outcome once, while simulation runs persist none of them.

Acceptance: focused save/lifecycle tests cover defeat, victory, duplicate finish, old-save migration and reload.

Status: implemented. Save schema v3 adds `totalVictories` and last-run outcome; v1/v2 data migrates additively. Victory no longer increments deaths.

### Task 2 — make the real stage-completion path locally exercisable
**Files:** `src/audience/LocalRunControls.ts`, `src/systems/SpawnSystem.ts`, `src/scenes/GameScene.ts`, `src/ui/AudiencePanel.ts`, `tests/run-lifecycle.test.ts` or a new focused stage-progress test.

- Add a simulation-only control that advances to the next configured boss through the stage queue. It must use the same spawn, boss-death and `phase-complete` events as a normal timed run; it must not call `finishRun('victory')` directly.
- Expose the current boss index and remaining boss count in the validation panel so the tested path is visible.
- Keep the existing forced outcome buttons for narrow lifecycle checks, but label them clearly as synthetic.
- Use the real rare-candy/evolution path to reach configured evolution levels; fix pause/resume or companion-bonus defects only if reproduced.

Acceptance: defeat, retry and natural stage victory work for three consecutive simulated runs; roster/contributions reset each run, and the pre-test save is byte-equivalent afterward.

Status: implementation complete. The panel now advances the configured boss queue, displays progress and grants simulation-only invincibility while still requiring real boss kills. Three restart/outcome cycles and save isolation passed; a full 13-boss natural victory remains an acceptance check.

### Task 3 — implement a readable crowded-viewer presentation
**Files:** create `src/audience/ViewerLabelLayout.ts`; modify `src/entities/Companion.ts`, `src/systems/CompanionSystem.ts`, `src/ui/AudiencePanel.ts`, `src/ui/audience-panel.css`; create `tests/viewer-label-layout.test.ts`.

- Keep every recruited viewer active and listed with stats in the audience panel.
- Limit world-space nameplates to a collision-free display budget, prioritizing viewers near the front of the orbit and rotating priority every few seconds so no viewer is permanently hidden.
- Show a compact `visible / active` label indicator in the panel; hiding a nameplate must never hide, disable or remove its companion.
- Use a pure layout selector for deterministic tests rather than coupling the rule to Phaser rendering.

Acceptance: at 10, 50 and 100 viewers, visible nameplates do not overlap materially at the supported viewport and every viewer remains present in the roster and contribution tracker.

Status: implemented and browser-verified at 100 active viewers. Four collision-free rotating labels were visible at the 486×779 viewport while all 100 viewers remained in the contribution roster.

### Task 4 — smooth audience combat load and define the supported limit
**Files:** `src/entities/Companion.ts`, `src/systems/CompanionSystem.ts`, `src/audience/PerformanceMonitor.ts`, `src/ui/AudiencePanel.ts`, `tests/performance.test.ts`, `tests/companion-roles.test.ts`.

- Stagger each companion's first attack deterministically so a Join all burst does not make every viewer fire on the same frame.
- Replace the unbounded companion projectile group with an explicit pool sized for the MVP target, while preserving ownership and contribution accounting on reuse.
- Extend telemetry with active companion projectiles and dropped-shot count so saturation is visible instead of silently losing attacks.
- Run sustained foreground scenarios with 10, 50 and 100 viewers against crowded waves and a configured boss. Pick the highest tier that stays responsive without sustained pool saturation as the documented MVP limit; optimize once if 50 cannot pass.

Acceptance: the chosen limit is recorded with viewport, machine, duration, enemy count, p95/max game-loop delta, projectile peak and dropped-shot count. These numbers are local evidence, not a universal performance guarantee.

Status: implementation complete; final capacity acceptance remains open. First attacks are deterministically staggered, the pool is capped at 512, and telemetry shows shots, visible labels and dropped shots. A roughly 27-second 100-viewer boss sample reported about 8.5 ms p95, 120 observed active shots and zero drops, but it did not include a sustained maximum-enemy wave and therefore does not establish the supported limit.

### Task 5 — verify retained MVP content contracts
**Files:** `src/data/enemies/index.ts`, `src/config.ts` and existing content modules as findings require; create `tests/content-contracts.test.ts`; update `scripts/test-audience.mjs`.

- Validate that every retained stage has waves and bosses, every referenced enemy exists, and required boss/companion/projectile textures and starter evolution forms can load.
- Exercise both retained stages, each configured boss sequence, a normal upgrade choice, audience recruitment at level-up, rare candy, and at least one player evolution.
- Fix only reproducible compatibility defects in these paths; exhaustive inherited catalog coverage remains post-MVP.

Acceptance: content-contract tests, three browser run cycles, typecheck, production build and `git diff --check` pass. The existing bundle-size warning may remain documented.

Status: implemented. Contract tests cover every retained stage wave/boss reference and ordered evolution paths. Browser validation exercised phase 1 configured boss entry, three restart/outcome cycles, and the real rare-candy path through Charmander's level-16 evolution. Earlier validation covered phase 2 start and first boss; every configured boss sequence has not yet been completed manually.

### Task 6 — close the milestone records
**Files:** `.codex/STATUS.md`, `docs/hackathon.md`, `docs/implementation-plan.md`, `docs/migration-plan.md`, `README.md`.

- Record actual fixes, commands and browser evidence; mark only completed acceptance items.
- Leave live Twitch delivery/reconnect verification as the next milestone and replacement assets as the final implementation milestone.
- Do not commit, push or publish without a new explicit instruction.

**Risks and rollback:** save-schema changes must be additive and migration-tested; local acceleration must be impossible to use as a persistent run; label filtering and projectile limits must not change recruitment or viewer stats. Each product change is isolated so it can be reverted without removing the audience session or Twitch provider.
