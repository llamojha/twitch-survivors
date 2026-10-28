# Twitch Survivors release plan

**Goal:** Rebase Twitch Survivors on the polished `JPTER78/pokesurvivor` game, preserve its survivor feel and presentation quality, add the proven Twitch audience loop, and remove all Pokémon identity and uncleared assets before release.

**Authoritative upstream:** `https://github.com/JPTER78/pokesurvivor.git`

**Pinned code baseline:** `b29708900da26b34e70d2dc07ad1659a719f4a78` (2026-10-14), the final revision whose game code is explicitly MIT licensed. Code published after this revision is reference material only unless separate permission is obtained. Pokémon sprites remain CC BY-NC 4.0 and Pokémon names, characters, and marks remain third-party IP regardless of the code license.

**Current checkout:** The existing `giovanneluna/poke-survivors` Phaser implementation and PR remain a recoverable prototype. They prove the audience behavior, Twitch connection, recruitment rules, contribution model, and load-smoothing approach. They are not the release foundation and must not be merged into the new base.

## MVP definition

A streamer starts a run from the polished menu, connects either local simulation or Twitch chat, and plays the survivor game. A viewer types `!join`, enters the same FIFO queue used by simulated viewers, and becomes a named autonomous combat companion. One viewer is recruited per level by default; the host can select Join all. Viewer damage and kills appear during and after the run. Viewer state resets between runs while local streamer progression persists.

The MVP keeps the correct upstream's world generation, movement, combat, enemies, bosses, pickups, level flow, performance systems, and visual quality as its gameplay foundation. Cloud accounts, public rankings, donations, and online co-op are excluded from the hackathon MVP. Existing Pokémon art and names may remain only as development placeholders and must be removed from the distributable release.

## Remaining work summary

Release acceptance has two open tasks: run the live Twitch `!join`/duplicate/disconnect/reconnect checklist on this correct fork, and finish one natural audience-mode boss/victory run. Final screenshot approval remains a user visual sign-off. The missing full unmodified-upstream recording and before/after deterministic-seed capture are historical evidence gaps; they do not block the converted release because final traversal, collision, lifecycle, capacity, build, and audit checks pass.

## Architecture

Match the upstream's dependency-free `window.G` module style instead of introducing Phaser, TypeScript, Vite, or a second engine.

```text
Twitch IRC ─┐
            ├─ AudienceProvider ─ AudienceSession ─ FIFO waiting queue
Local mock ─┘                                      │
                                                   ▼
                                      RecruitmentController
                                      ├─ one per level
                                      └─ Join all
                                                   │
                                                   ▼
                                      CompanionManager
                                      ├─ actor + viewer label
                                      ├─ role/attack schedule
                                      └─ damage/kill ownership
```

New browser modules should follow the upstream IIFE convention:

- `js/audience/provider.js`: normalized event contract and provider lifecycle.
- `js/audience/session.js`: run-scoped identity registry, queue, roster, and stale-provider protection.
- `js/audience/mock-provider.js`: deterministic local joins and batch generation.
- `js/audience/twitch-provider.js`: token validation plus Twitch IRC parsing/reconnect state.
- `js/audience/recruitment.js`: level credits and Join all policy.
- `js/audience/roles.js`: small data-driven role catalog and stable per-viewer phase.
- `js/entities/companion.js`: autonomous follow/target/attack/render behavior.
- `js/ui/audience-ui.js`: source, connection, queue, mode, and contribution controls.

`dev.html` owns source script order. `tools/build.js` generates `index.html` and `js/app.min.js`; generated files must not be edited by hand.

## Ordered task list

### Task 1 — Establish the correct lineage and a recoverable migration base

**Files/areas:** Git refs/remotes, `LICENSE`, `CREDITS.md`, `THIRD_PARTY_LICENSES.md`, `README.md`

- [x] Preserve the current Phaser branch and PR as a historical prototype; do not rewrite or force-push them.
- [x] Add the correct project as a separately named upstream remote and fetch its full history.
- [x] Create the new base directly from exact commit `b29708900da26b34e70d2dc07ad1659a719f4a78` so the inherited Git ancestry remains auditable.
- [x] Create the rework feature branch from that base. Keep `origin` pointed at `llamojha/twitch-survivors`.
- [x] Copy project-only planning and Codex tracking documents onto the new branch without copying the old Phaser application.
- [x] Preserve the upstream MIT notice and author credit; document SpriteCollab, Pixelify Sans, PokéAPI data, and Pokémon trademark boundaries separately.
- [x] Verify the exact origin owner/repository and intended base branch before any later push.

**Acceptance:** Git can prove the source commit and its license; both old prototype and new fork are recoverable; no secret or credential files enter the branch.

### Task 2 — Prove and constrain the pinned upstream game

**Files:** `dev.html`, `js/main.js`, `js/game.js`, `js/core/db.js`, `js/ui/menu.js`, `tools/build.js`

- [ ] Historical baseline only: record every unmodified flow (movement, combat, level-up, death/restart, boss/world generation). Boot/menu/console were recorded, but the remaining pre-conversion capture is no longer a release blocker.
- [x] Run the upstream production builder in exposed/local mode and verify generated `index.html` boots.
- [ ] Historical baseline only: capture pre-conversion screenshots and performance. Final converted-release screenshots and sustained capacity evidence exist; the missing upstream-before sample is non-blocking.
- [x] Disable Firebase startup, accounts, friends, rankings, donations, moderation, and online co-op in the MVP shell without removing the underlying combat/world systems.
- [x] Keep local streamer progression and settings under Twitch Survivors-specific storage keys so they cannot overwrite PokéSurvivor saves.
- [x] Rename visible project identity and metadata to Twitch Survivors while retaining temporary Pokémon gameplay assets until the final art pass.
- [x] Lock the MVP to English, remove language switching, and verify legacy Spanish preferences cannot change the presentation.
- [x] Make Play start the default local run without requiring account setup or the personality test.

**Acceptance:** The correct game works locally without cloud configuration, external service errors, or touching upstream save keys; its visual quality and core loop remain intact.

### Task 3 — Port the shared audience core and local simulation

**Files:** create `js/audience/provider.js`, `js/audience/session.js`, `js/audience/mock-provider.js`; modify `dev.html`, `js/game.js`; create `tests/audience-session.test.js`

- [x] Define a normalized `viewer_join` event containing stable ID and display name.
- [x] Implement one run-scoped registry and FIFO queue with case-insensitive duplicate protection.
- [x] Guard provider callbacks by generation so a disconnected or replaced provider cannot enqueue stale events.
- [x] Reset waiting/active viewers and contributions on run start while keeping the selected provider connected.
- [x] Add local controls for one named viewer and a deterministic batch of 10 viewers.
- [x] Use Node's built-in test runner for pure queue/lifecycle behavior; add no test framework dependency.

**Acceptance:** Local single and batch joins enter one queue, duplicates are ignored, provider switching is safe, and a new run resets viewer participation.

### Task 4 — Port live Twitch input early

**Files:** create `js/audience/twitch-provider.js`; modify `js/ui/audience-ui.js`, `dev.html`; create `tests/twitch-parser.test.js`; update `docs/twitch-setup.md`

- [x] Port the working browser-only Twitch IRC provider from the prototype into the upstream module style.
- [x] Validate the user access token through Twitch, require `chat:read`, verify the token-owner username, and connect to the selected channel.
- [x] Parse exact case-insensitive `!join` messages and derive stable viewer identity from Twitch tags.
- [x] Keep tokens only in memory, clear the token input immediately, sanitize displayed errors, and never use a client secret in browser code.
- [x] Show precise disconnected, connecting, listening, reconnecting, and error states.
- [x] Feed Twitch and local events through the identical `AudienceSession` path.
- [ ] Perform live acceptance immediately after the port: one real `!join`, one local join, duplicate suppression, disconnect, and reconnect.

**Acceptance:** Real and simulated viewers are indistinguishable after normalization, while local mode remains fully usable without Twitch credentials.

### Task 5 — Turn queued viewers into autonomous companions

**Files:** create `js/entities/companion.js`, `js/audience/roles.js`; modify `js/game.js`, `js/entities/projectile.js`, `js/entities/enemy.js`, `js/core/camera.js`, `js/ui/hud.js`; create `tests/companion-roles.test.js`

- [x] Implement a `CompanionManager` that follows the player, finds nearby enemies, attacks autonomously, draws the viewer name, and cleans up at run end.
- [x] Start with a small curated catalog of compatible inherited attacks and temporary inherited actors; do not attempt all 966 species for the MVP.
- [x] Expand the audience catalog to **12 varied roles** adapted from compatible inherited projectile, cone, nova, boomerang, orbit, chain, meteor, mine, and beam patterns. Burn/poison remain excluded until delayed damage can retain viewer ownership.
- [x] Assign each viewer a role randomly per run, seeded by run ID plus stable viewer ID so the assignment remains stable for that run, duplicate joins cannot reroll it, and a new run can produce a different role.
- [x] Keep Arcblade host combat excluded from the expanded role catalog: the host remains Tackle-only and all additional combat variety belongs to recruited audience viewers.
- [x] Store viewer ownership on projectiles and other direct damage sources.
- [x] Anchor attack schedules to recruitment time and retain a stable viewer-specific phase so Join all batches do not fire in lockstep.
- [x] Bound projectile counts and report saturation instead of allocating indefinitely.
- [x] Keep companion actors distinct from online co-op players and from the streamer save/progression model.
- [x] Ensure enemies can target or collide with companions only if the chosen role explicitly permits it.

**Acceptance:** Several named companions follow, attack with visibly different roles, avoid synchronized burst spikes, and disappear cleanly on restart.

### Task 6 — Implement level recruitment and Join all

**Files:** create `js/audience/recruitment.js`; modify `js/game.js`, `js/systems/levelup.js`, `js/ui/run-ui.js`, `js/ui/audience-ui.js`; create `tests/recruitment.test.js`

- [x] Add host-selectable gameplay mode: Solo or Audience companions.
- [x] In audience mode, recruit one queued viewer per player level by default and preserve FIFO order.
- [x] Bank recruitment credits when the queue is empty so a later viewer can fill the earned slot.
- [x] Add Join all, applying it to both existing waiting viewers and subsequent joins.
- [x] Define the level reward clearly: audience recruitment consumes the audience reward path while Solo retains normal level-up cards.
- [x] Preserve active companions when switching modes; stop new recruitment when returning to Solo.
- [x] Cover empty queues, repeated level signals, duplicates, mode changes, pause screens, and restart.

**Acceptance:** Both local and Twitch viewers obey identical level and Join all rules without breaking upstream level-up, pause, or run state.

### Task 7 — Add contribution reporting and clean run lifecycle

**Files:** modify `js/entities/enemy.js`, `js/systems/combat.js`, `js/game.js`, `js/ui/hud.js`, `js/ui/run-ui.js`, `js/ui/audience-ui.js`; create `tests/contributions.test.js`

- [x] Attribute effective damage once after mitigation and award a kill once to the final credited source.
- [x] Display compact live leaders and a final viewer table with display name, role, damage, and kills.
- [x] Snapshot contributions before entity cleanup on victory, death, or quit.
- [x] Reset viewer roles and statistics on every new run while preserving local streamer progression.
- [x] Prevent forced/local validation runs from altering persistent progression or rankings.
- [x] Decide explicitly whether damage-over-time and area fields count in MVP statistics; direct damage is the safe default.

**Acceptance:** Repeated runs produce correct, isolated contribution summaries and do not duplicate rewards or leak prior viewers.

### Task 8 — Validate gameplay, Twitch behavior, and capacity

**Files:** create `tests/run-lifecycle.test.js`, `docs/acceptance.md`; modify validation helpers only where necessary

- [x] Run focused Node tests, the upstream build, and a real-browser smoke test after each coherent slice.
- [x] Complete a natural death with audience mode enabled and preserve contributions through the clean result/restart path.
- [ ] Complete a natural boss/victory path with audience mode enabled.
- [x] Verify local/mock joins, recruitment, pause/level behavior, and restart through browser checks and focused lifecycle tests.
- [ ] Verify live Twitch joins before a run and during play, plus disconnect/reconnect on this correct fork.
- [x] Exercise 10, 20, and 50 queued/active viewers; record sustained frame timing, enemy count, projectiles, saturation, and label readability.
- [x] Pick and document the supported MVP audience capacity from evidence rather than the target number.
- [x] Inspect the browser console and network activity for uncaught errors, accidental cloud calls, token exposure, and reconnect loops.

Local production-build capacity evidence from 2026-10-27 sets the supported MVP presentation limit at **20 active companions**. All three 25-second samples held 60.00 mean FPS with 62–71 enemies, no frame over 20 ms, and zero dropped audience shots. Fifty companions remained mechanically stable, but 43 of 50 visible labels participated in estimated overlap and the center was visibly unreadable. See `docs/acceptance.md` for the measured table and test conditions.

**Acceptance:** A repeatable end-to-end run works with local and live input, and the documented capacity has sustained evidence.

### Task 9 — Replace terrain and Pokémon presentation last

**Files:** `js/world/tiles.js`, `js/world/world.js`, `js/core/sprites.js`, `js/data/pokedex.js`, `js/data/enemies.js`, `js/data/starters.js`, `js/data/moves.js`, `js/ui/*.js`, `css/style.css`, `assets/**`, `CREDITS.md`, `THIRD_PARTY_LICENSES.md`

- [x] Inventory every runtime-reachable asset and its license before adding replacement art.
- [x] Approve one complete fantasy vertical slice: terrain, streamer hero, viewer companion, regular monster, boss, UI portrait, and representative attacks.
- [x] Replace grass, paths, water, cliffs, trees, rocks, and biome decoration while preserving procedural chunk topology, collision, anchors, and draw order.
- [x] Replace every reachable Pokémon player, companion, enemy, boss, portrait, name, type label, item, and world reference with a fantasy presentation mapping.
- [x] Keep generic skill/VFX only when provenance permits release and the effect has no Pokémon identity; replace the remainder with original effects.
- [x] Remove all unused Pokémon/SpriteCollab assets from the distributable tree after runtime references reach zero.
- [x] Add a release audit that fails on prohibited paths, Pokémon terms, unapproved remote URLs, or unknown asset provenance.
- [x] Capture final screenshots only after the actual converted game passes visual regression.
- [x] Refocus the shell on Play and Audience with a Twitch-purple fantasy palette and new sword/audience/rune/quest icons.
- [x] Restyle the menu and start-screen wordmarks with bright Twitch-purple letters, a deep-purple pixel outline, and a compact readability shadow.
- [x] Replace the inherited score data with an original procedural Twitch Survivors soundtrack and give every release-reachable host/viewer attack a bespoke fantasy pixel icon.
- [x] Rebuild permanent upgrades as the Survivor Forge with thirteen fantasy icons, four visual power schools, and save-compatible upgrade IDs.
- [x] Remove Recruit/Gacha and ticket balances from the primary MVP UI; convert reachable ticket drops and mission rewards into crowns.
- [x] Reduce Audience to a compact lobby with a one-row local simulator, collapsed Twitch setup, recruitment mode, status, and short queue.

Completed locally: the release now uses the documented pixel-fantasy direction, a CC0 Kenney Tiny Dungeon actor sheet, a compact fantasy roster, centralized presentation mapping, re-paletted procedural terrain, original branding icons, and rebuilt metadata. The inherited actor directory and generated species datasets are removed. The source/build audit passes, and desktop plus narrow production browser checks show the local audience loop working without console errors or external runtime requests. Live Twitch acceptance remains user-assisted.

**Acceptance:** The release package contains no Pokémon identity or uncleared art, while the procedural world, combat readability, and Twitch loop still work.

### Task 10 — Release and hackathon evidence

**Files:** `README.md`, `docs/architecture.md`, `docs/hackathon.md`, `docs/acceptance.md`, `THIRD_PARTY_LICENSES.md`

- [x] Document the correct upstream, pinned MIT revision, material modifications, and third-party notices.
- [x] Record which Twitch checks were live and which tests were simulated.
- [x] Produce the final demo path: launch, connect/local toggle, `!join`, recruitment, combat contribution, run outcome, restart.
- [x] Run the production asset audit, build, browser regression, mobile/narrow-layout smoke check, and final credential scan.
- [x] Review the final diff against the new base, including release identity, deleted inherited assets/infrastructure, generated output, credential patterns, and the latest UI changes.

**Acceptance:** The submission is reproducible, accurately attributed, visually original, and demonstrates the audience-driven loop without relying on hidden setup.

### Task 11 — Lock the MVP host identity and move combat variety to the audience

**Files:** `dev.html`, `js/data/roster.js`, `js/data/starters.js`, `js/data/upgrades.js`, `js/systems/levelup.js`, `js/game.js`, `js/ui/menu.js`, `css/style.css`, `tests/host-rules.test.js`

- [x] Remove the Heroes/Companions collection entry point and all host-character switching controls from the MVP menu.
- [x] Present Arcblade as the fixed host survivor without elemental affinities, rarity, or shiny controls.
- [x] Give the host one neutral Tackle attack and prevent additional or evolved host attacks from level-up rewards.
- [x] Keep level-up stat rewards in Solo mode and audience recruitment rewards in Audience mode.
- [x] Keep coin-funded permanent stat upgrades for the fixed host while hiding move-slot and move-ban upgrades.
- [x] Audit every reachable Forge upgrade; repurpose the Audience-mode-dead reroll card as viewer damage while retaining its Solo reroll effect and save-compatible ID.
- [x] Show recruited viewers, assigned skills, total damage, active-time DPS, and kills on the pause screen.
- [x] Verify the menu, forge, Solo level-up, and Audience recruitment flow in a real browser.

**Acceptance:** The player controls one simple neutral host; all varied combat roles come from joined audience viewers, and no collection or character-selection UI is reachable.

**Deferred post-MVP TODO:** Design a coin-funded character unlock system only if multiple playable hosts return; keep the selector and collection disabled until that design is approved.

### Task 12 — Gate local mock audience tools by deployment environment

**Files:** `tools/release-features.js`, `tools/build.js`, `package.json`, `dev.html`, `js/core/features.js`, `js/ui/audience-ui.js`, `js/main.js`, `tests/release-features.test.js`, `tests/presentation.test.js`

- [x] Resolve one `mockAudience` build flag from `TS_ENABLE_MOCK_AUDIENCE`, defaulting on for Vercel preview builds and off everywhere else.
- [x] Stamp only the resolved boolean into generated HTML, and omit the mock provider module from default production bundles; do not expose deployment environment details to the browser.
- [x] When disabled, hide local simulator controls, skip mock-provider creation/connection, and remove the in-run mock join control.
- [x] Keep Twitch connection, recruitment modes, queues, and contribution behavior unchanged.
- [x] Verify preview-on and production-off builds through focused tests and real-browser checks; leave generated release artifacts in production-default mode.

**Acceptance:** Vercel previews expose repeatable local audience simulation automatically. Production/default builds expose Twitch only and cannot create mock viewers through the UI.

## Explicit exclusions for the MVP

- Porting post-`b297089` upstream code without separate permission.
- Cloud accounts, Firebase saves, public rankings, donations, moderation, or upstream online co-op.
- Supporting all 966 inherited actors or every attack as a viewer role.
- Subscriber perks, paid priority, viewer persistence across runs, crafting, or runtime generative AI.
- A framework conversion to Phaser/TypeScript during the fork rework.

## Risks and rollback

- **License drift:** Pin the full commit SHA and reject accidental code copied from newer upstream revisions. Keep the original MIT notice in the repository.
- **Third-party art:** The MIT code license does not cover Pokémon/SpriteCollab assets. Development placeholders must never be mistaken for release-cleared assets.
- **Architecture mismatch:** The prototype is Phaser/TypeScript while the correct fork is vanilla Canvas. Port behavior and tests deliberately; do not paste engine-specific classes.
- **Generated files:** Edit `dev.html` and source modules, then regenerate `index.html`/`js/app.min.js`. Direct edits to generated outputs will be lost.
- **Save collisions:** Use new storage keys and migration tests; never delete or overwrite existing PokéSurvivor browser data.
- **Rollback:** Keep the old prototype branch intact. Build the new base and each feature as reviewable commits so the fork can roll back by task without rewriting history.
