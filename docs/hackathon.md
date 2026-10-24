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
