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

## Step 2 — prove both inputs reach the game
- [x] Verify a simulated join appears in the audience queue during the base game.
- [ ] Connect an authorized Twitch channel and send a real !join.
- [ ] Confirm real and simulated viewers use the same queue behavior and duplicate protection.
- [ ] Record live acceptance evidence; keep local development available if authorization is unavailable.

Exit: an actual Twitch join and a simulated join visibly reach the game. Protocol unit tests alone do not establish live acceptance.

## Step 3 — turn viewers into companions
- [ ] Inspect the existing companion and attack paths needed for one skill.
- [ ] Recruit a named companion from either input; follow the player and fight autonomously.
- [ ] Preserve viewer ownership through attacks and projectiles.
- [ ] Expand to a small varied random selection of compatible existing skills.
- [ ] Verify both local and Twitch participants behave identically.

## Step 4 — implement recruitment modes
- [ ] Recruit from the queue on level-up by default, in FIFO order.
- [ ] Add host-controlled Join all for waiting viewers and subsequent joins.
- [ ] Show waiting/active counts and recruitment feedback.
- [ ] Define empty-queue level rewards and unused recruitment credits before implementation; these tuning rules are not decided yet.
- [ ] Test duplicate joins, empty queues, mode switching and pause/upgrade menus locally.
- [ ] Confirm the same recruitment behavior using real Twitch input.

## Step 5 — complete and test runs
- [ ] Track per-viewer contributions such as damage and kills, counting actual damage once.
- [ ] Add a simple run summary and clear viewer roles/stats on restart.
- [ ] Preserve streamer progression and existing solo gameplay.
- [ ] Use local simulation for repeatable gameplay, join bursts and measured load tests.
- [ ] Use real Twitch for authorization, delivery and reconnect tests.
- [ ] Verify three consecutive runs and record supported audience capacity.
- [ ] Smoke-check retained maps, bosses and upgrades offered in the MVP.

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
