# Twitch Survivors — product specification

Status: v0.6, correct-upstream MVP implemented with the twelve-role audience catalog; live Twitch was proven on the superseded prototype but must be reverified on this fork.
Date: 2026-10-27. This specification supersedes conflicting scope in the two original bootstrap briefs and the mistaken Giovanne Luna foundation.

## 1. Product

A browser survivor game where the streamer controls the main character and viewers become autonomous companions carrying skills. The player survives waves, gains levels, recruits the audience, defeats bosses, and retains streamer progression between runs. Viewers see their names and contributions in the game.

Fork `JPTER78/pokesurvivor` at MIT revision `b29708900da26b34e70d2dc07ad1659a719f4a78`. Preserve and adapt its procedural world, bosses, attacks, upgrades, progression, combat, and polished Canvas presentation instead of reducing the product to a two-role demo. Post-`b297089` code is reference-only unless separately licensed. Port the already-proven audience behavior from the superseded Phaser prototype and reverify live Twitch delivery on the correct foundation.

## 2. Confirmed decisions

| ID | Decision |
| --- | --- |
| D01 | Keep and adapt most existing maps, bosses, upgrades, and progression. |
| D02 | Final visual direction: pixel-art fantasy (adventurer, knights, magic, monsters). Slimes/simple characters are possible final companions, not yet an approved asset set. |
| D03 | Do not replace existing assets during development. Asset replacement is the final implementation task before release; verification follows it. |
| D04 | Viewer participation is autonomous. No active viewer commands, cooldown abilities, or votes in the first release beyond joining. |
| D05 | Use twelve varied viewer roles adapted from compatible inherited attack patterns. Assign roles randomly per run using stable viewer identity plus run identity: the role is stable within that run, duplicate joins cannot reroll it, and it may change on the next run. |
| D06 | Slimelord-inspired model: recruit a viewer companion carrying a skill. This replaces the initial assumption that half of viewers are player-attached skills. |
| D07 | Default recruitment is level-based; a streamer-controlled Join all mode is also required. |
| D08 | Viewer roles and contribution statistics reset each run; streamer progression persists. |
| D09 | Play starts immediately with fixed host survivor Arcblade on the default map. The host has no affinity and keeps one neutral Tackle attack. |
| D10 | Replace the current title illustration with an actual gameplay screenshot in the final presentation pass. |
| D11 | Both input providers are required. Live Twitch `!join` worked on the superseded prototype; port it early and reverify it on the correct fork while keeping mocks available for repeatable development. |
| D12 | The final art pass must replace terrain and every visible Pokémon player, companion, enemy and boss. Skill visuals may remain only when their provenance permits redistribution and they contain no Pokémon-specific identity. |
| D13 | The intended foundation is `JPTER78/pokesurvivor`, pinned at MIT commit `b297089`. The existing `giovanneluna/poke-survivors` implementation is retained only as a behavioral prototype and migration reference. |
| D14 | Match the correct upstream's vanilla JavaScript, Canvas 2D, and `window.G` module architecture. Do not introduce Phaser/TypeScript/Vite during the rework. |
| D15 | Exclude Firebase accounts, rankings, donations, moderation, and online co-op from the hackathon MVP. Preserve local streamer progression. |
| D16 | Make the shell audience-first: remove Recruit/Gacha and tickets from primary presentation, use fantasy runes/icons, keep Local and Twitch inputs, and make Audience a compact lobby. |
| D17 | Disable host-character collection, switching, shiny/rarity presentation, and coin unlocking for the MVP. Combat variety comes from audience viewers; a coin-funded multi-host system is deferred. |

## 3. Scope

### Required for the MVP
- Existing playable solo survivor foundation, procedural world, and retained local streamer progression. Use one representative run path for initial audience acceptance; preserve other content without making exhaustive conversion a prerequisite.
- Run setup and readable HUD; direct base-game launch remains a regression reference.
- Real Twitch chat and credential-free local simulation are delivered together in the first milestone, feeding the same normalized events, duplicate protection and visible queue. Real-channel verification remains explicit; local development does not wait for authorization.
- Per-run viewer registry, waiting queue, two recruitment modes, companion-owned skill execution, and contribution reporting.
- A varied catalog of 12 eligible viewer roles derived from compatible inherited attack patterns. Do not adapt every inherited attack before MVP.
- Clean pause, death, victory, restart, reconnect, and repeated-session behavior.
- Final original/licensed asset conversion and release verification.

### Excluded unless explicitly added
Viewer accounts or persistent viewer progression, subscriber perks, paid priority, runtime LLM features, Firebase/cloud saves, rankings, donations, moderation, upstream online co-op, new crafting/inventory/colony mechanics, and a new database. Browser is the release target; desktop packaging is deferred.

## 4. Player and viewer flows

### Streamer
Open game → choose local or Twitch input and recruitment mode → start run → move/collect XP → recruit viewers → fight waves/bosses → death/victory → review contributions → restart.

The game launches fixed host survivor Arcblade into the procedural world. Arcblade has no elemental affinity and only the neutral Tackle attack. Solo level rewards improve run stats; Audience mode uses level rewards to recruit viewers whose roles provide the varied attacks. Audience setup must not alter core movement, spawning, combat, or world behavior.

### Viewer
Type !join → become eligible for this run → wait for recruitment in default mode (or enter when Join all admits them) → see named companion and assigned skill → contribute automatically → appear in run results. No separate account/login required for viewers.

### Proposed recruitment rules (tuning defaults, not additional user decisions)
- Stable Twitch user ID defines identity; display names are presentation only.
- FIFO queue. Each player level grants one recruitment credit; spend it on the oldest queued viewer.
- If the queue is empty, retain recruitment credits for later arrivals; do not fabricate real viewers. Mock viewers are explicit development data.
- A credited recruit consumes exactly one credit. Joining twice does not add another queue entry or reroll a skill.
- Join all is host-only: recruit current queued viewers and admit subsequent joiners immediately while the mode is enabled.
- Switching back to level mode keeps existing companions; new viewers queue for future recruitment. Credits earned during Join all do not accumulate.
- Manual pause/upgrade menus defer spawn admission until resume; joins can queue. Death/victory close admission for the completed run.
- A new run requires a new !join. Do not silently carry previous participants across runs.

The above credit, queue, mode-switch, and late-arrival semantics are proposed implementation defaults and can be revised before the recruitment milestone.

## 5. Functional requirements and acceptance

| ID | Requirement | Acceptance evidence |
| --- | --- | --- |
| BASE-01 | Preserve immediate inherited base-game launch. | Play starts the Canvas run without account/personality setup; movement, spawning, combat and restart work. |
| BASE-02 | Preserve retained content and progression. | Inventory identifies supported world/boss/upgrade paths; representative paths have smoke coverage and local progression survives restart. |
| AUD-01 | Separate audience transport from gameplay. | Identical normalized joins from mock and Twitch reach the same registry; scenes contain no Twitch API calls. |
| AUD-02 | Once-per-run viewer identity. | Repeated joins and transport redelivery create no extra queue entry, companion, or reroll. Different users with equal display names remain distinct. |
| AUD-03 | Mock joins without credentials. | Named single joins and batches are supported; seeded role selection enables reproducible verification. |
| REC-01 | Default level recruitment. | One earned level admits one queued viewer; duplicate level handling cannot spend the same credit twice. Empty-queue credits follow the proposed rule above. |
| REC-02 | Host-controlled Join all. | Existing queue drains safely; future viewers enter; switching back preserves active companions and resumes level recruitment. Chat cannot toggle it. |
| ROLE-01 | Configured role catalog. | 10–12 enabled viewer roles declare companion behavior, skill, weight, limits, and compatibility; unavailable or broken attacks are not randomly selected. |
| ROLE-03 | Per-run random role assignment. | Role selection combines run ID and stable viewer ID: repeated joins during a run preserve the assigned role, while a later run can assign a different eligible role. |
| ROLE-02 | Companion-owned skills. | Attacks originate/target relative to their owning companion; they do not accidentally use player position, cooldown, or owner ID. |
| AI-01 | Autonomous followers. | Companions follow, engage nearby enemies, return within a leash, and recover when separated without blocking the player. |
| STAT-01 | Accurate attribution. | Damage is capped at HP actually removed; kills count once; projectiles and damage-over-time retain owner attribution. Healing counts only effective healing if supported. |
| UI-01 | Visible ownership. | Recruit notification shows display name/role; names appear on companions; roster shows active/waiting state and contributions without names on every projectile. |
| RUN-01 | Clean run lifecycle. | Restart clears queue, roles, credits, entities, damage sources, timers, and listeners; streamer progression stays. Repeat at least three runs. |
| TW-01 | Live Twitch joins. | Authorized test channel messages recruit the correct identity through the same path as mock events; reconnect does not duplicate participants. |
| TW-02 | Connection resilience. | Connection/reconnect/error states are visible; gameplay continues while chat is disconnected; explicit disconnect stops new intake. |
| PERF-01 | Measured participation capacity. | Load tests record frame time, enemy/projectile/companion counts, and join burst behavior on a named machine/browser. No unbounded per-frame spawn loop. |
| ART-01 | Assets last. | No asset replacement occurs before gameplay/integration checkpoints pass. Final package contains only original or verified reusable assets. |
| REL-01 | Honest release/demo. | Demo shows real joining and a complete loop; new work is distinguished from attributed upstream work. Title uses gameplay screenshot after final asset conversion. |

## 6. Gameplay design

Preserve existing procedural world generation, enemy waves, boss behavior, spatial queries, collision, XP collection, and streamer meta-progression wherever compatible. Introduce recruitment at the level-up boundary rather than rewriting the survivor loop.

Confirmed 2026-10-25: in audience mode, recruitment replaces the level-up skill picker; solo retains existing upgrades. Empty-queue credits are banked. This must be balanced because larger teams multiply damage. Skill upgrades must have an explicit target (player, one companion, or whole squad); never infer ownership from the selected player character. Resolve the reward rule at Step 3 using only the relevant inherited upgrade behavior.

Local joins through the shared queue now recruit fighting companions from the twelve-role MVP catalog. Arcblade remains Tackle-only; the expanded attacks belong exclusively to recruited audience viewers. Burn and poison are excluded from viewer contribution damage until delayed ticks can retain source ownership.

Proposed default: companions have no separate permadeath in the first release. They remain active for the run; the streamer losing ends the team run. Confirm at Step 3 if inherited companion behavior requires a different choice.

## 7. UI and visual design

- Keep current character, effect, item, and map assets during development; temporary labels may identify their inherited names.
- HUD: health, level/XP, timer, objective/boss status, active viewers, waiting viewers, recruitment mode, and compact connection status.
- Main menu: Play and Audience lead; Upgrades, Missions, and Settings remain secondary. Character collection, Recruit/Gacha, Profile favorites, and ticket counters are absent from the MVP navigation.
- Audience controls: compact host-only mode switch and Local test row, with Twitch credentials collapsed until requested.
- Recruitment: non-blocking name + role notification; queue bursts aggregate rather than covering gameplay with notifications.
- Roster/results: damage/kills, optional effective healing, role, active/waiting status. Long/Unicode names are bounded and safely rendered.
- Selection and overlay layouts must fit narrow in-app panels. Existing selection overlays clip at approximately 486 px wide; record and fix before audience setup depends on them.
- Final style: readable pixel-art fantasy with consistent scale, silhouettes, effects and UI palette. Final companion species, art source, and exact mapping remain to be designed.
- Final title artwork: a screenshot of the actual converted game, not an illustration that implies unimplemented gameplay.

## 8. Architecture

Reuse the correct upstream's dependency-free vanilla JavaScript, Canvas 2D renderer, `window.G` modules, and existing entity/world/combat systems. Add small IIFE modules, not a new framework, ECS, or rewritten game engine. `dev.html` defines source load order; `tools/build.js` generates the production bundle and `index.html`.

AudienceProvider → normalized ViewerJoin → ViewerRegistry → RecruitmentSystem → RoleAssignmentSystem → CompanionSystem → owned Attack/DamageTracker → roster/results.

Provider subscriptions return an unsubscribe function. Transport lifetime and run lifetime are separate: restarting a scene must not multiply connections. Every run has a run ID; delayed events/damage from an old run cannot mutate the new one.

Companion skills need an explicit combat-owner context (position, stats, target query, damage owner) rather than direct assumptions about ctx.player. Preserve player attacks through an adapter while migrating eligible companion skills incrementally. Damage events carry a source/owner ID through projectile pooling, chained effects and damage-over-time.

Keep Twitch credentials out of persistent storage and logs. Port the verified browser IRC flow with a user access token and `chat:read`; never include the client secret in browser code. Local simulation remains available without Twitch.

## 9. Capacity and balancing

Join all expresses intent to admit all participating viewers; it is not evidence of unlimited device capacity. Propose 10–20 active viewers as the initial MVP test envelope with representative existing enemy/skill loads. Measure rather than promise capacity. Larger 50/100-viewer tests are post-MVP work unless evidence makes them necessary.

Proposed overload behavior: stagger admission, show pending viewers, and reduce cosmetic effects before degrading gameplay. Do not silently discard participants, merge their identities, invent contribution credit, or promise unlimited independent companions. If a hard active limit is required, return with measured evidence before finalizing the policy.

## 10. Open decisions

- The approved catalog uses Ember, Thunder Shock, Confusion, Rock Throw, Flamethrower, Heat Wave, Razor Leaf, Fire Spin, Thunderbolt, Rock Slide, String Shot, and Ice Beam behavior under fantasy skill names.
- Recruitment replaces the level reward in audience mode (confirmed 2026-10-25); Solo offers stat-only level rewards for the fixed host.
- Empty-queue credits, mode switch rules, and companion mortality: proposed defaults above.
- Final capacity/fallback policy after measured load tests.
- Final Twitch deployment/authentication UX; the current manual user-token flow is acceptable for MVP development and must be reverified after the port.
- Final fantasy identity mapping and asset production/source, deferred to the last implementation milestone.

No open item authorizes asset replacement now. These decisions block only their dependent tasks, not the audience-core and live Twitch port.

## 11. Release gate

Prove the complete real-channel MVP loop, viewer lifecycle, representative-world regression, modest capacity measurement, and essential UI on the pinned correct fork with inherited development assets first. Then perform the final asset/branding replacement, audit distributable contents and licenses, capture a real gameplay screenshot/video, and rerun visual/gameplay regressions. Release/publishing requires separate user instruction.
