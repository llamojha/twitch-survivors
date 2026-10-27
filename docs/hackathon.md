# Twitch Survivors — implementation log

## 2026-10-24: clone and first migration pass

User changed direction from an independent bootstrap to adapting the existing poke-survivors repository. Cloned the full upstream history into the existing workspace at baseline `188329a4eabe93072d3d18f740e4ce76ed4662da`, using remote name `upstream`. No new remote repository, branch, commit, staging, push, or deployment was created.

### New work with Codex
- Inspected scene flow, world generation, selection, sprite sources, save system, and dependencies.
- Created an original Phaser title screen and geometric role illustration, responsive at tested desktop sizes; retained navigation into inherited selection and map editing.
- Renamed browser/package identity to Twitch Survivors and added an original SVG favicon.
- Isolated save and language localStorage keys from the upstream game. Existing upstream saves are not migrated or deleted.
- Added an explicit typecheck script and pinned direct dependency versions. Updated Vite within version 6, updated sharp to 0.35.5, and refreshed vulnerable transitive dependencies.
- Changed inherited desktop release workflow from automatic main-branch pushes to manual dispatch. Desktop metadata/assets remain inherited and unverified.
- Replaced obsolete Pokémon-specific project steering; preserved upstream MIT notice and documented the asset boundary.

### Validation actually performed
- Original upstream `npm ci --ignore-scripts` and production build passed before changes.
- Final `npm ci`, `npm run typecheck`, and `npm run build` passed after changes and lockfile updates.
- Final `npm audit`: zero reported vulnerabilities (initial install reported seven high findings).
- Vite retains a large-bundle warning: approximately 2.24 MB minified / 502 KB gzip for the main JavaScript bundle. No optimization claim is made.
- No inherited automated test script exists.
- Chromium browser: title loads; Enter opens SelectScene; normal UI clicks select phase and difficulty and open GameScene + UIScene.
- Movement: held D; player X increased from 1500 to 1540 while Y remained 1500.
- Enemy spawning: three active enemies observed about 14 seconds into the run.
- Map editor opens through the title button. A first automation click immediately after resizing missed; retrying the measured current button position succeeded.
- Screenshots inspected at 1440×900 and 1024×768; title-screen deliverable saved at `docs/title-screen.png`.
- Initial missing-favicon 404 corrected by supplying an original SVG. Fresh reload/title/map-editor path reported no page errors or console errors; gameplay log contained no further errors.

### Limitations and next work
See the explicit TODO list in `docs/migration-plan.md`. Original Pokémon sprites, names, game content, tiles, remaining UI, and public asset directories are still present. This is not a completed original-art conversion or a submission-ready build. The current Vite output includes inherited public assets. Real Twitch integration, mock audience, ownership/contribution accounting, and full regression coverage are pending.

The inherited survivor systems predate this hackathon and must be attributed; only the additions above are new work from this session. The new title describes audience participation as a future feature.

## 2026-10-24: specification and direct base-game launch

User confirmed broader retained content, pixel-art fantasy, autonomous viewer companions carrying random skills, level-based recruitment plus streamer-controlled Join all, per-run viewer resets and persistent streamer progression. Asset replacement is explicitly the final pre-release implementation task. The earlier Fireball/Knight-only and independent-build assumptions no longer define product scope.

Created docs/product-spec.md and docs/implementation-plan.md; updated the migration checklist and project steering to preserve current assets until the last milestone. Proposed credit/upgrade/capacity defaults are labelled separately from confirmed decisions.

Play and Enter now launch GameScene directly with Charmander, phase1, Emerald theme, hard difficulty, and debug disabled. Verified the button in the user's in-app browser: inherited arena, player, HUD, timer and spawning are visible; no browser error logs observed. Narrow inherited selection overlays clip and remain a tracked UI task; direct launch bypasses them.

Follow-up verification: Enter also starts the run directly in the in-app browser. Captured docs/base-game-launch.png, then paused through the HUD. Typecheck and production build passed; existing bundle-size warning remains. Browser error log was empty. No existing game assets were replaced.

## 2026-10-24: corrected MVP sequencing

User rejected deferring Twitch until late development. Rewrote the plan around real Twitch chat as Step 1, one real fighting viewer as Step 2, recruitment modes/random roles as Step 3, and reliable contributions/restarts as Step 4. Mock testing is supporting infrastructure, not a prerequisite. Preserve inherited content, but move exhaustive catalog conversion and large-audience optimization to the explicit post-MVP backlog. Asset replacement remains the final implementation task. Proposed MVP role count and capacity are labelled as recommendations, not confirmed user decisions. No gameplay code changed in this planning revision.


## 2026-10-24 — audience inputs, MVP step 1
Implemented with Astra low subagents: normalized audience contract, local simulator, shared FIFO registry/session, authenticated Twitch IRC provider and collapsible audience panel. Tokens stay in memory; switching providers cleans subscriptions and rejects stale events. New runs reset the queue. Added an isolated test runner using the existing TypeScript dependency.

Validation: 12 tests passed, typecheck passed, production build passed (large bundle warning remains). Real browser verified Alice plus ten viewers, duplicate protection, Enter in the panel staying on the title screen, switching to Twitch and back, and a new run clearing the queue while retaining the local connection. Alice then joined during gameplay. Screenshot: audience-inputs.png.

Live Twitch authentication/delivery has not been tested with an authorized channel. Step 2 retains this acceptance check. No companion recruitment or asset replacement in this change.


## 2026-10-24 — durable Codex collaboration tracking
Added AGENTS.md maintenance rules, .codex/README.md record index, and .codex/STATUS.md current handoff. The implementation plan remains the authoritative TODO list. Saved identical session snapshots in project .memory/sessions and the personal sessions directory. Documentation-only change; verified snapshot equality and whitespace, without rerunning gameplay tests.


## 2026-10-24 — private repository setup
User authorized repository creation and initial commit/push. Created private llamojha/twitch-survivors and verified origin matches it. Selected feat/twitch-survivors-mvp to comply with the no-main/master-push rule; the new repository has no existing base branch. The initial snapshot includes migration, audience implementation, planning and Codex tracking. Filename screening and likely-secret signature checks on changed files found no matches. Existing gameplay validation is recorded above; this step changes repository metadata/documentation only.


## 2026-10-24 — step 2 shared-input acceptance
Added an integration test routing simulated Twitch IRC messages and local joins through AudienceSession. Verified equal name ordering, stable-ID deduplication, connection-preserving run reset, queue clearing and stale-message rejection on source switch. All 14 tests and typecheck passed. Added a live acceptance checklist to docs/twitch-setup.md. No production/UI changes; previous browser proof remains applicable. Actual Twitch delivery remains pending authorization in the local UI. No commit or push for this step.


## 2026-10-25 — mock companion prototype
User deferred live Twitch acceptance; no credentials are required for ongoing gameplay work. Astra low worker implemented waiting/active viewer state, once-per-run deduplication after admission, named companions using three retained sprites and one inherited projectile skill, explicit projectile ownership, pooled-shot timer generation protection, and reset/shutdown cleanup. Existing solo companion capacity and HUD remain separate. Temporary immediate admission is bounded to ten viewers per game update; level-based and host-controlled recruitment remain step 4.

Validation: 16 tests passed, typecheck and final production build passed (existing bundle warning). Browser observed Alice duplicate suppression, eleven named companions, projectile firing, follow behavior during movement, reset removing all active companions and paused joins remaining queued. Browser error log empty. Screenshot: docs/mock-companions.png. Development-server reloads interrupted the full scene-restart/resume acceptance sequence; do not claim that sequence verified.

Remaining: distinct random skills, final recruitment modes, contribution stats and measured capacity. Live Twitch remains deferred, not passed. Existing assets unchanged. No commits or pushes in this slice.


## 2026-10-25 — recruitment and varied attacks
Implemented using Astra low workers and parent integration: pure recruitment ledger, actual level reward gating, host gameplay/recruitment controls, local level simulation, and three random projectile roles (Scout/Volley/Piercer). Audience mode replaces skill selection; solo retains it. Empty queues bank credits; Join all earns no new credits and mode transitions preserve companions. Evolution code preserves its existing events without opening the audience skill picker; rare candy resumes its gacha pause.

22 tests and final build including TypeScript passed. Browser verified FIFO level admission, later joins spending a saved credit, 11 recruits via Join all, switching back leaving 10 new viewers waiting, visible roles and solo upgrade picker. Fixed initial disabled test-button refresh. Extended run/evolution/rare-candy browser checks remain pending. No assets, commits or pushes.

## 2026-10-25 — contributions and run validation
Added effective direct projectile damage and kills, live viewer stats and outcome summaries, guarded run finalization, and local validation controls with isolated saved progression. Fixed a restart crash caused by cleaning up a collider after the physics world was destroyed. Added bounded game-loop timing and active entity counts.

28 tests and production build including TypeScript passed; the existing large-bundle warning remains. In the browser, forced victory and defeat produced summaries, restart cleared viewers, and simulation kept saved coins at 101. Both stages started and their first bosses spawned; rare candy reached level 2. Brief 10/20/50-viewer tests used small enemy groups, and labels overlapped at 50. These checks do not establish natural boss completion, evolution, sustained-load capacity or comprehensive retained-content compatibility. Detailed timings and remaining TODOs are in docs/implementation-plan.md. Twitch live acceptance and asset replacement remain deferred.

## 2026-10-25 — gameplay reliability and audience scaling
Implemented additive save schema v3 with distinct victories and defeats, including v1/v2 migration; fixed victories incorrectly incrementing lifetime deaths. The local validation panel now advances the configured boss queue and shows boss progress, using simulation-only invincibility so boss deaths and `phase-complete` remain the real path. Added collision-free rotating world labels, deterministic first-shot staggering, a 512-shot pool, and label/projectile/drop telemetry. Added retained stage/enemy/boss/evolution contract coverage.

33 focused tests and typecheck passed. Browser verified three restart/outcome cycles with saved coins fixed at 101, Charmander evolving to Charmeleon at level 16 through rare candy, and a configured phase-1 boss encounter. At 100 active viewers on the prior recorded Mac17,2 / 486×779 setup, four world labels remained readable while all viewers stayed in the roster; a roughly 27-second boss sample showed about 8.5 ms p95, 120 observed active shots and zero drops. A full natural boss sequence and sustained maximum-wave benchmark remain acceptance work, so 100 is not yet the declared supported limit. Live Twitch acceptance and assets remain deferred.

## 2026-10-25 — recruitment-relative attack staggering

Fixed the PR review finding where companions recruited after the scene clock exceeded their cooldown attacked immediately and then synchronized by role. Each companion now anchors its stable viewer phase to its first active update and advances from that schedule in whole cooldown intervals, including after missed attack opportunities. Added focused coverage for late recruitment and retained cadence offsets. Existing assets remain unchanged.

## 2026-10-25 — final asset overhaul specification

Defined the final visual migration around a cohesive pixel-fantasy vertical slice, followed by terrain and all reachable player, companion, enemy and boss replacements. The plan preserves legacy gameplay/save IDs, map topology, combat and collision while mapping them to new fantasy presentation data and reusable archetypes. Existing skill effects are provisional: they may ship only with verified redistribution rights and no Pokémon-specific identity. The release build must exclude replaced Pokémon, terrain, artwork and unreferenced source-pack assets from `public/`; a planned audit will enforce that boundary. No assets or runtime code changed in this planning pass.

## 2026-10-25 — corrected upstream and fork rework plan

The user supplied screenshots from the intended foundation and identified `JPTER78/pokesurvivor` as the correct project. Investigation confirmed that the existing checkout came from a different similarly named repository, `giovanneluna/poke-survivors`. The current Phaser branch and PR are retained as a behavioral prototype rather than the release foundation.

Inspected the correct repository and exact commit `b29708900da26b34e70d2dc07ad1659a719f4a78` in a temporary clone. Its source uses vanilla JavaScript, Canvas 2D, `window.G` IIFE modules, `dev.html` for source script order, and `tools/build.js` for production generation. Its baseline license explicitly grants MIT to the code while excluding SpriteCollab/Pokémon content from that grant. Current code after this commit uses PolyForm Noncommercial, so newer code is reference-only unless separately licensed.

Replaced the active implementation and asset plans with a migration checklist for the correct fork. The plan preserves the proven audience behavior, ports Twitch early, excludes upstream cloud/social systems from the MVP, and keeps terrain/Pokémon replacement as the final implementation milestone. No application files, Git refs, remotes, commits, PRs, or deployments changed during this planning pass.

## 2026-10-26 — fantasy asset provenance and art contract

Recorded the first release-cleared visual dependency: Kenney Tiny Dungeon 1.0 under CC0, using its official packed 16×16 tilemap for fantasy actors. Added a provenance ledger with source, license, repository paths, modifications and SHA-256 checksums; retained the upstream license beside the image. Pixelify Sans remains documented under OFL 1.1.

Defined the visual contract for actor scale, foot anchors, Y sorting, terrain, palette, lighting, crowd readability and UI. The current vertical slice includes an Arcblade hero, three viewer roles, reusable fantasy enemies, a boss mapping and three re-paletted core biomes. This documentation does not approve the remaining inherited Pokémon/SpriteCollab content: the complete inventory, purge, automated release audit and final browser regression remain required before release.


## 2026-10-26 — fantasy release conversion completed locally

Removed the inherited actor library and generated species datasets after replacing runtime actor loading with the fantasy presentation facade and compact roster. Rebranded visible runtime copy, the 30-minute boss, app icons, favicon, social preview, and the first three procedural biome palettes. Added a source/build asset audit that rejects legacy identity, prohibited asset paths, unapproved remote services, and missing required licenses.

Validation: 19 Node tests passed; the 61-script exposed production bundle built; the asset audit passed. Production Chromium loaded only same-origin release files, recruited Carol through the local Join all path, recorded 176 damage and three kills in the final contribution table, and logged no errors after the prop-flash regression was fixed. Heroes, Recruit, and Upgrades also opened without errors. Desktop and 760×500 screenshots are saved in `docs/screenshots/`. Live Twitch acceptance, natural outcome paths, and sustained audience-capacity measurements remain open. No files were staged, committed, pushed, or published.

## 2026-10-27 — audience-first UI and release cleanup

Simplified the inherited collection-heavy shell around the Twitch MVP. The main menu now presents Play, Audience, Companions, Upgrades, Missions, and Settings; Recruit/Gacha and the ticket pill are removed from primary navigation. Reachable ticket drops and mission rewards convert to crowns. Added original pixel sword, audience, scroll, and rarity-rune icons, a purple fantasy/Twitch palette, and a compact Audience lobby with Local controls visible and Twitch credentials collapsed.

Removed inherited static guide/collection pages, legacy service worker, old domain/SEO metadata, sponsor configuration, and deployable Firebase/Cloudflare infrastructure that targeted the upstream project. The release audit now checks served HTML, release metadata, forbidden paths, nested template strings, remote URLs, and required licenses.

Validation: 21 Node tests passed; the 61-script exposed browser-test build, protected production build, and asset audit passed. Chromium at 1280×800 and 760×500 showed no UI overflow or console errors, Recruit/tickets were absent, and a Local Join all viewer entered a run. The protected build also opened Audience and started Play while keeping `window.G` private and loading only approved same-origin release files. A natural death at 0:41 preserved 317 damage and 10 kills; natural three-minute boss completion remains open. Capacity evidence supports 20 active companions. No files were staged, committed, pushed, or published.

## 2026-10-27 — Twitch wordmarks and Survivor Forge

Restyled both the menu wordmark and the large Press to start title with a brighter Twitch-purple fill, deep-purple pixel outline, and compact readability shadow. Rebuilt permanent upgrades as the Survivor Forge with thirteen original fantasy icons, four color-coded power schools, fantasy names, compact cards, and bilingual copy. Gameplay IDs, costs, effects, levels, and save data remain unchanged.

Validation: 21 Node tests, protected production build, and release asset audit passed. Chromium rendered the title and Forge without clipping or viewport overflow at 1280×800 and 760×500. The protected build displayed all 13 upgrades, kept `window.G` private, and successfully purchased the first upgrade with no console errors. No files were staged, committed, pushed, or published.

## 2026-10-27 — checklist reconciliation and final diff review

Reconciled the implementation, migration, acceptance, art, and asset-overhaul checklists against recorded evidence. Natural death/restart, local audience lifecycle, capacity, final assets, responsive UI, release build/audit, screenshots, documentation, attribution, and the final diff review are marked complete. Combined checklist lines were split so the remaining live Twitch and natural boss checks no longer hide completed local work.

The final diff review covered release identity, removed inherited assets and deployment infrastructure, generated output, credential patterns, and the latest logo/Survivor Forge changes. No credential material was found. The only release acceptance still open is live Twitch join/disconnect/reconnect on this correct fork and one natural boss/victory run. Historical pre-conversion baseline and deterministic-seed comparisons remain explicitly documented as non-blocking gaps. No files were staged, committed, pushed, or published.

Follow-up identity cleanup replaced the remaining player-facing elemental labels with fantasy affinities. Arcblade now displays Wild and Spirit instead of Grass and Ghost. The underlying combat/save keys are unchanged. The 21 Node tests, protected build, release audit, and protected-browser menu check passed with no console errors.

## 2026-10-27 — fixed neutral host

Locked the MVP to Arcblade as one fixed, affinity-free host with only the neutral Tackle attack. Removed the Companions/Heroes entry point, shiny/rarity presentation, profile favorites, collection/evolution achievements, hero selector, move-slot bindings, and move-ban/two-move Forge purchases from reachable UI. Solo level rewards are stat-only; Audience mode continues to turn levels into viewer recruitment, making viewers the source of varied combat roles. A coin-funded multi-host unlock system is explicitly deferred.

Validation: 23 Node tests passed. Chromium confirmed no character selector, no type chips, an 11-upgrade fixed-host Forge, Arcblade with `types: []`, one Tackle slot, rejection of a second move, stat-only host offers, and local Join all recruitment of Alice with zero console errors.

## 2026-10-27 — Survivor Forge gameplay audit

Audited all eleven reachable Forge cards against the fixed-host Audience MVP. Ten were already connected to live host, progression, pickup, or reward behavior. The level-card reroll was ineffective in the default Audience flow because levels recruit viewers instead of opening cards. Its stable `reroll` save key now powers Chat Momentum: each level adds 5% viewer-companion damage while preserving one additional reroll per level in Solo. The Forge now labels host-only effects, the run-end crown payout, pickup radius, and XP's level-recruitment benefit explicitly. Legacy move-slot and move-ban upgrades remain hidden and save-compatible.

Validation: 30 Node tests passed, including projectile and direct-hit viewer scaling. Chromium purchased Chat Momentum, confirmed a 1.05 viewer-damage multiplier and retained Solo reroll, and rendered the Forge without horizontal overflow or console errors at 1280×720 and 760×500. Screenshots: `docs/screenshots/forge-upgrade-audit.png` and `docs/screenshots/forge-upgrade-audit-narrow.png`.

## 2026-10-27 — Pause viewer DPS roster

Added an Audience roster to the Pause screen. It lists every recruited viewer, their assigned skill, total damage, kills, and DPS. DPS uses time since that viewer was recruited rather than total run time, so late joins remain comparable. The end-of-run contribution list now includes the same DPS value.

Validation: 31 Node tests passed, including active-time DPS accounting. Chromium recruited ten local viewers, observed live combat contributions, and verified the roster at 1280×720 and 760×500 with no horizontal overflow or console errors. Screenshots: `docs/screenshots/pause-viewer-dps.png` and `docs/screenshots/pause-viewer-dps-narrow.png`.

## 2026-10-27 — twelve audience skills

Expanded the viewer catalog from three generic roles to twelve fantasy skills adapted from inherited combat patterns: Firebolt, Storm Needle, Seeker, Stoneguard, Flame Fan, Starburst, Runeblade, Flame Orbit, Chain Spark, Meteorist, Rune Trapper, and Frost Channeler. The catalog covers aimed, piercing, homing, cone, radial, returning, orbiting, chained, meteor, mine, and beam attacks. Viewer assignment combines the run ID, world seed, and stable viewer ID, so duplicates cannot reroll a skill during a run while later runs can produce a new skill. Arcblade remains Tackle-only.

All audience damage uses immutable viewer ownership. Direct chain, meteor, and beam hits bypass streamer rewards; short-lived orbits release projectile budget; slow can apply safely, while burn and poison remain disabled for viewer damage until delayed ticks can retain their source.

Validation: 28 Node tests passed; the exposed and protected 62-script builds plus release asset audit passed. Chromium recruited eleven local viewers, recorded contributions from multiple skills, and exercised every role family for five seconds with zero console errors or dropped shots. The final review added per-frame cast/direct-hit budgets, wall-clamped beams, and travel-aware targeting. Screenshot: `docs/screenshots/audience-skills-12-role-catalog.png`.

## 2026-10-27 — crown currency icon

Replaced the inherited plain gold coin with an original Twitch Survivors currency mark: a gold crown set inside a Twitch-purple pixel token. The existing shared `coin` icon key remains stable, so menu balances, Forge costs, mission rewards, and result screens all receive the new design without changing currency behavior or save data.

Validation: the icon definition passed syntax and 12×12 dimension checks; all 28 Node tests passed. Chromium rendered the token at its real menu size with no console errors. Screenshot: `docs/screenshots/crown-token-icon.png`.

## 2026-10-27 — Bounty Board and streamer host identity

Replaced the reachable legacy Missions and Achievements presentation with a Twitch Survivors Bounty Board. Daily bounties and weekly trials retain their stable mission IDs, progress counters, reroll behavior, and save compatibility, while using fantasy objectives, original UI icons, and crown-only reward presentation. The Milestones tab now contains 21 objectives backed by systems available in the MVP; collection, gacha, legendary roster, and group milestones were removed from the reachable definition set.

Removed Arcblade from the player-facing host identity. Local mode displays the saved profile name, currently Streamer, and a connected Twitch setup displays the channel name. The menu portrait now opts into a centered canvas anchor while gameplay actors retain their foot anchor for collisions and Y sorting.

Validation: 28 Node tests, protected production build, and release asset audit passed. Chromium rendered the centered portrait, Bounties, and Milestones with translated English copy and zero console errors. Screenshots: `docs/screenshots/centered-host-portrait.png`, `docs/screenshots/bounty-board.png`, and `docs/screenshots/bounty-board-milestones.png`.

## 2026-10-27 — larger host and fantasy attack names

Increased the centered menu host portrait from 4× to 5×. Replaced the remaining hardcoded Tackle label with the runtime fantasy name Blade Arc, which now appears consistently in the menu and run HUD.

Completed the presentation mapping for all 64 retained base attacks and all 59 evolved attacks. Save data, combat behavior, VFX lookup, and internal move IDs remain unchanged; only player-facing names were replaced.

Validation: the mapping inventory reported zero missing base or evolved names; 28 Node tests, protected production build, and release asset audit passed. Chromium verified Blade Arc in the menu and live HUD with zero console errors. Screenshots: `docs/screenshots/larger-host-blade-arc.png` and `docs/screenshots/blade-arc-in-run.png`.
