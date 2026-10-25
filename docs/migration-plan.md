# Twitch Survivors migration

## Goal and scope
Adapt the cloned survivor game into Twitch Survivors while preserving its working combat and map foundation. The first pass establishes the fork, replaces the title screen, and verifies the inherited gameplay. It is not a completed asset conversion or a submission-ready build.

Upstream: https://github.com/giovanneluna/poke-survivors
Baseline: 188329a4eabe93072d3d18f740e4ce76ed4662da

## First pass
- [x] Clone upstream into the existing workspace, retaining history and MIT notice.
- [x] Inspect scene flow, map generation, sprite provenance, and build.
- [x] Replace `src/scenes/TitleScene.ts` with an original responsive title screen and preserve access to inherited gameplay/tools.
- [x] Rename package/browser identity, add typecheck, pin dependencies, and isolate save/language storage.
- [x] Change inherited automatic release workflow to manual dispatch until desktop branding is migrated.
- [x] Record licensing boundaries and current limitations in README and third-party notices.
- [x] Verify clean installation, strict typecheck, production build, title navigation, movement, enemies, and browser errors.

## Current specification and ordered TODO

The latest user decisions supersede the initial bootstrap scope. See [product specification](product-spec.md) and [implementation plan](implementation-plan.md).

- [x] Make Play/Enter launch the inherited game directly with default character/map.
- [ ] Step 1 (in progress): Local/Twitch input modes feeding one shared queue; verify locally and then with authorized real chat.
- [ ] Step 2: recruit one real viewer as a named fighting companion using an existing skill.
- [ ] Step 3: default level recruitment, host Join all, small varied random role catalog.
- [x] Step 4: visible contributions and clean local restart; live reconnect acceptance remains in Twitch Step 2.
- [ ] Step 5: local gameplay implementation complete; finish natural boss-sequence and sustained-capacity acceptance.
- [ ] Step 6 (FINAL implementation task): replace release assets/branding and capture actual gameplay for the title.
- [ ] After Step 6: final-art regression, demo and release preparation.
- [ ] Post-MVP: expand toward the full inherited content catalog and larger audiences.

The previous M0–M8 order is superseded: real Twitch is first, not after mocks, content conversion or UI work. Keep all current assets during functional development. Preserve inherited maps/bosses/progression; exhaustive audience compatibility is not required before proving the live core loop. See the implementation plan for file-level tasks and acceptance criteria.

## Validation and rollback
Implement changes before adding tests. Use a clean npm install, typecheck, build, and a real Chromium gameplay smoke test. Keep changes uncommitted and preserve the original upstream history; no pushes or publishing. Review changes against the recorded baseline without destructive Git operations.

## Risks
The inherited project bundles third-party game artwork. This checkout is a migration workspace, not cleared for redistribution as an original hackathon entry. Existing map systems can remain, but map artwork needs its own provenance decision. The upstream project includes gameplay outside the original bootstrap scope; do not expand it during migration. Dependency fixes should remain within existing major versions where possible and be validated by build and browser testing.


## Current execution TODO — 2026-10-24
The six-step order and acceptance checkboxes in [implementation-plan.md](implementation-plan.md) supersede earlier milestone sequencing above.
- [x] 1. Implement local and Twitch audience inputs with one shared queue.
- [ ] 2. Live Twitch acceptance deferred by user on 2026-10-25; local and simulated protocol checks pass.
- [x] 3. Named mock companions with Scout, Volley and Piercer projectile roles.
- [x] 4. Implement level-based and host-controlled Join all recruitment locally; live Twitch confirmation deferred.
- [ ] 5. Contributions, restart, outcome persistence, evolution and scaling controls implemented; full natural victory, capacity declaration and live tests remain.
- [ ] 6. Replace assets last, then verify release.
