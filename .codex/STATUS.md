# Current Codex handoff

Updated: 2026-10-28 (Europe/Madrid).

## Current milestone

The current uncommitted soundtrack/icon, English-only presentation, and preview mock-gating work is isolated on `feat/original-audio-attack-icons`, based on the Vercel packaging branch after the main release work merged into `base/bootstrap`. The local/offline shell, shared Local/Twitch audience path, recruitment modes, autonomous companions, contribution reporting, fantasy asset conversion, audience-first UI, original score, release attack icons, English-only runtime, and deployment feature flag are implemented.

The authoritative checklist is `../docs/implementation-plan.md`. Asset provenance and art direction are in `../docs/asset-provenance.md` and `../docs/art-direction.md`.

## Implemented behavior

- Local and Twitch providers feed one normalized queue with stable-ID duplicate protection. Local mock controls are enabled automatically on Vercel previews and disabled by default elsewhere.
- Level recruitment banks credits; Join all drains the queue and admits later joins.
- Twelve named companion roles follow and fight with projectile, cone, nova, boomerang, orbit, chain, meteor, mine, and beam patterns. They reroll by run plus viewer identity, stagger attacks by recruitment time, and report direct damage and kills.
- Viewer state resets each run while streamer progression remains in the local profile.
- Pausing an Audience run shows every recruited viewer with assigned skill, total damage, DPS measured from that viewer's recruitment time, and kills; final results include DPS too.
- The release uses a compact fantasy roster, Kenney CC0 actors, converted procedural terrain palettes, original app icons, and no inherited actor directory or species dataset.
- Play and Audience lead the purple fantasy shell. Recruit/Gacha and ticket balances are absent; reachable ticket rewards convert to crowns.
- The game uses one fixed MVP host: no affinity, rarity, shiny, or character selection; one neutral Blade Arc attack; stat-only Solo level rewards. Viewer roles provide the varied attacks.
- The fixed host is player-facing as the saved streamer name in Local mode and the Twitch channel name after connection; the old Arcblade label is now internal history only. Its menu portrait is centered without changing world anchoring.
- The host portrait renders at 5× in the menu. All 64 base moves and 59 evolved moves use fantasy display names while their save-compatible combat IDs remain internal; the host attack is shown as Blade Arc.
- Seven original code-sequenced themes now cover the menu, three biomes, boss, rift, and finale. The host attack and all twelve release viewer skills have distinct code-drawn fantasy icons, also shown beside viewer contributions.
- The menu and start-screen Twitch Survivors wordmarks use bright Twitch-purple letter fills with a deep-purple pixel outline at desktop and compact sizes.
- Permanent upgrades use the Survivor Forge presentation with ten active host/progression upgrades plus Chat Momentum, which boosts viewer damage and retains Solo rerolls. Move-slot and move-ban purchases remain dormant for save compatibility.
- The legacy Missions screen is now the Twitch-purple Bounty Board: three daily bounties, two weekly trials, crown-only rewards, role-specific fantasy icons, and 21 reachable survival/combat/bounty milestones. Collection, gacha, legendary, and group milestones are excluded from the MVP surface.
- Crowns use an original gold crown on a Twitch-purple token across balances, rewards, and costs instead of the inherited plain coin.
- Player-facing elemental/type labels are fantasy affinities such as Wild and Spirit; inherited combat keys remain internal for compatibility.
- Audience is a compact lobby: Twitch credentials are collapsed; preview builds also show one Local testing row backed by the same queue.
- Firebase, Cloudflare, social, ranking, donation, moderation, updater, service-worker, inherited domain, and sponsor release configuration are removed or disabled.

## Validation evidence

- `npm test`: 38 tests passed.
- `npm run build:test`: previous exposed browser-validation build covered 62 scripts; preview builds now contain 63 scripts including the feature module and mock provider.
- `npm run build`: 62 scripts bundled into the protected production build with the feature module included and the mock provider omitted.
- `npm run audit:assets`: passed for runtime scripts, served HTML and metadata, forbidden identity/paths, remote-service policy, and required licenses.
- Chromium at 1280×800 and 760×500: menu and compact Audience lobby had no viewport overflow or console errors; Local Join all started a run with one companion.
- The updated two-tone purple wordmark rendered without clipping or overflow at 1280×800 and 760×500.
- Survivor Forge rendered all 13 upgrades without viewport overflow at 1280×800 and 760×500; a protected-build purchase advanced the first upgrade to level one with no console errors.
- Protected-build Chromium smoke check opened Audience, started Play, loaded only approved same-origin release files, and kept `window.G` hidden.
- Fixed-host Chromium checks confirmed no collection button, affinity chips, rarity, shiny, or hero selector; the host had one Blade Arc slot, rejected a second attack, offered stat-only level rewards, and recruited Alice through Local Join all with zero console errors.
- Chromium recruited eleven viewers through Local Join all, observed multiple assigned skills and contribution credit, then exercised all twelve forced role families for five seconds with zero console errors or dropped audience shots. The host still had only Blade Arc.
- Chromium verified the shared crown token in the menu balance at its real 12-pixel UI size with zero console errors; screenshot: `../docs/screenshots/crown-token-icon.png`.
- Chromium verified the centered host portrait and Streamer fallback label, then rendered both Bounty Board tabs with English copy, crown rewards, no viewport overflow, and zero console errors. Screenshots: `../docs/screenshots/centered-host-portrait.png`, `../docs/screenshots/bounty-board.png`, and `../docs/screenshots/bounty-board-milestones.png`.
- Chromium verified the larger 5× portrait plus Blade Arc in both the menu summary and live run HUD with zero console errors. Screenshots: `../docs/screenshots/larger-host-blade-arc.png` and `../docs/screenshots/blade-arc-in-run.png`.
- Chromium purchased Chat Momentum, confirmed its 1.05 viewer-damage multiplier plus retained Solo reroll, and rendered the audited Forge without horizontal overflow or console errors at 1280×720 and 760×500. Screenshots: `../docs/screenshots/forge-upgrade-audit.png` and `../docs/screenshots/forge-upgrade-audit-narrow.png`.
- Chromium recruited ten local viewers, let them fight, and verified the Pause roster's names, skills, damage, active-time DPS, and kills with no horizontal overflow or console errors at 1280×720 and 760×500. Screenshots: `../docs/screenshots/pause-viewer-dps.png` and `../docs/screenshots/pause-viewer-dps-narrow.png`.
- Chromium verified all seven new themes produced a nonzero Web Audio signal after gesture unlock. A ten-viewer Join all run rendered ten distinct attack icons in the Pause roster without horizontal overflow at 1280×800 or 760×500 and produced zero console errors.
- English-only Chromium checks preloaded the retired Spanish preference, then verified the title, menu, Audience, Forge, Bounties, every Settings tab, and an active Pause screen stayed English. The protected build had zero console errors and no viewport overflow at 760×500.
- Feature-flag Chromium checks verified the preview build showed and auto-connected Local Test, while the default production build hid Local Test and `+ viewer`, remained disconnected until Twitch setup, and kept Twitch visible. Both builds logged zero console errors.
- Natural audience-mode death at 0:41 preserved Alice's 317 damage and 10 kills. Attempts at 1:39 and 2:44 ended before the first three-minute boss.
- Sustained local capacity checks held 60 FPS at 10, 20, and 50 companions. The supported MVP presentation limit is 20; 50 is mechanically stable but visually unreadable.
- Final and UI screenshots are under `../docs/screenshots/`.

## Remaining acceptance work

- User-assisted live Twitch verification on this correct fork: real `!join`, disconnect, and reconnect.
- Natural boss completion with audience mode enabled.

Historical, non-blocking evidence gaps are the complete unmodified upstream gameplay recording and a before/after deterministic-seed comparison. Final-release traversal, collision/readability, local lifecycle, capacity, build, audit, and diff checks pass.

## Working tree warning

The rework worktree contains extensive modified, deleted, and untracked implementation, documentation, generated files, and asset changes. Do not discard or overwrite them. No credential files were read. Do not stage, commit, push, or update a PR without explicit user instruction.
