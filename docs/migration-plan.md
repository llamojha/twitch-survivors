# Twitch Survivors migration status

## Corrected foundation

The intended game is `JPTER78/pokesurvivor`, not `giovanneluna/poke-survivors`. The release foundation will use exact commit `b29708900da26b34e70d2dc07ad1659a719f4a78`, the final revision whose game code is explicitly MIT licensed. Newer upstream code is reference-only. Third-party artwork and trademarks are outside the MIT grant and remain scheduled for final replacement.

The current Phaser branch remains intact as a working audience prototype. It proves local/Twitch normalization, queueing, level recruitment, Join all, autonomous companions, attribution, restart behavior, and attack staggering. Those behaviors will be ported into the correct fork's vanilla JavaScript/Canvas architecture.

## Ordered milestones

- [x] M1: preserve the old branch/PR and establish an auditable branch from JPTER78 commit `b297089`.
- [x] M2: verify the unmodified correct fork locally, disable cloud/social dependencies, isolate saves, rename the shell, and make Play start a default run.
- [x] M3: port the shared audience session and local simulation.
- [x] M4: port Twitch IRC input into the shared audience path. Real `!join` and reconnect acceptance remain under M8.
- [x] M5: port named autonomous companions, a small varied role catalog, ownership, and staggered schedules.
- [x] M6: port level-based recruitment, banked credits, and host-controlled Join all.
- [x] M7: port contribution summaries and clean run lifecycle.
- [ ] M8: complete natural-run, browser, Twitch, restart, and sustained-capacity acceptance.
- [x] M9: replace terrain and every reachable Pokémon identity and asset; audit the release package.
- [x] M10: complete final screenshots, documentation, attribution, local demo evidence, and final diff review.

The file-level checklist, architecture, acceptance criteria, risks, and rollback plan are authoritative in [implementation-plan.md](implementation-plan.md).

## Immediate next action

Finish M8 acceptance evidence: complete the user-assisted live Twitch join/disconnect/reconnect check and one natural boss/victory path. Natural death/restart, sustained capacity, the converted release build, asset audit, final diff review, and desktop/narrow local browser loop pass. Commits, pushes, PR changes, or publication require the user's explicit instruction at execution time.

## 2026-10-26 asset milestone update

M9 is complete locally. The release uses the CC0 actor sheet, fantasy roster, centralized presentation mapping, converted terrain palette, and original branding. The inherited actor directory and generated species metadata are gone. The asset audit passes, the production bundle is regenerated, and desktop plus narrow browser checks show a named mock companion fighting without console errors.
