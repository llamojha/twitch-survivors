# Twitch Survivors acceptance record

Only checks actually performed should be marked complete.

## Correct-fork baseline

- [x] Pinned exact upstream commit `b29708900da26b34e70d2dc07ad1659a719f4a78`.
- [x] Source production builder completed with `node tools/build.js --expose --sin-seo` on Node 26.0.0.
- [x] `dev.html` reached the tap-to-start and login screens in Chromium.
- [x] Baseline browser console had no errors; it produced Firebase and audio-autoplay warnings.
- [ ] Historical/non-blocking: the complete unmodified baseline movement, combat, level-up, death, and restart was not recorded before conversion.

## Local shell

- [x] No Firebase, ranking, social, donation, co-op, updater, or service-worker request occurs during boot/run/end.
- [x] Play enters a valid default run without login or personality setup.
- [x] Streamer progression survives reload under Twitch Survivors-specific keys.

## Audience loop

- [x] Named local join and batch join share the session queue.
- [x] Duplicate joins are ignored for the run.
- [ ] Real Twitch `!join` reaches the same queue.
- [x] Provider switching rejects stale callbacks.
- [x] Level mode, banked credits, Join all, Solo switching, pause, and restart behave as specified.
- [x] Named companions follow, attack, and report direct damage/kills.

## Run and capacity

- [x] Natural death produces a contribution summary and clean restart.
- [ ] Natural boss/victory path completes with audience mode.
- [x] 10, 20, and 50 viewer samples record sustained frame timing, enemies, projectiles, drops, and label readability.
- [x] Supported MVP audience capacity is documented from evidence.
- [x] Natural audience-mode death preserves contributions in the result screen.

### Local audience capacity — 2026-10-27

The production `index.html` build ran in Chromium at 1280×800 with the local mock provider and Join all. Each capacity had a five-second settling period followed by a 25-second `requestAnimationFrame` sample. The run timer was advanced to five minutes so the spawner held 62–71 enemies, and the stationary player's health was raised only to keep the same run alive for measurement. Viewer cohorts were added sequentially in that run. Label overlap is an estimate from the actual rendered 10 px monospace label bounds; screenshots were also inspected visually.

| Active viewers | Mean FPS | Frame p95 / p99 / max | Enemies min / avg / max | Projectiles min / avg / max | Audience shots min / avg / max | Dropped audience shots | Label result |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| 10 | 60.00 | 16.7 / 16.8 / 16.8 ms | 62 / 68.8 / 71 | 0 / 7.2 / 20 | 0 / 1.5 / 11 | 0 | All 10 visible; 4 labels in 2 estimated overlap pairs, still readable in the screenshot. |
| 20 | 60.00 | 16.8 / 16.8 / 16.8 ms | 71 / 71.0 / 71 | 1 / 10.7 / 29 | 0 / 3.3 / 15 | 0 | All 20 visible; 10 labels in 5 estimated overlap pairs. Crowded, but individual names remain identifiable. |
| 50 | 60.00 | 16.7 / 16.8 / 16.8 ms | 66 / 68.5 / 70 | 2 / 18.4 / 53 | 1 / 9.9 / 33 | 0 | All 50 visible; 43 labels in 28 estimated overlap pairs. The center becomes unreadable despite stable simulation. |

No sampled frame exceeded 20 ms, the game stayed in `playing`, the 160-shot audience cap was never reached, and Chromium reported no console errors. The only warning was the expected audio-autoplay warning.

**Supported MVP capacity: 20 active viewer companions.** Ten is the clearest presentation. Twenty remains mechanically stable and usable, although crowded. Fifty is mechanically stable on this machine but is outside the supported MVP presentation limit because most labels overlap. This is local desktop evidence, not a mobile-device or real-Twitch network capacity claim.

### Natural outcome and compact UI — 2026-10-27

Chromium completed an unforced audience-mode death at 0:41 with Join all and Alice active. The result retained Alice's 317 damage and 10 kills, with no console errors. Two subsequent natural attempts reached 1:39 with 20 viewers and 2:44 with 50 viewers; both ended before the first three-minute boss, so a natural boss completion remains open rather than claimed.

The audience-first UI was checked at 1280×800 and 760×500. Recruit/Gacha and ticket balances were absent, the menu and compact Audience lobby had no viewport overflow, Twitch setup remained available in its collapsed section, and Local Join all started a run with one active companion. Browser console errors: zero; expected audio autoplay warning: one.

## Final presentation

- [x] Terrain and every reachable Pokémon identity are replaced.
- [x] Release asset/provenance audit passes.
- [x] Desktop and narrow/mobile layouts pass real-browser checks.
- [x] Final local demo passes with release assets.
- [ ] Final live Twitch demo passes with release assets on this correct fork.
