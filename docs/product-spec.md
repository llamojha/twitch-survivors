# Twitch Survivors — product specification

Status: v0.3, mock gameplay development; live Twitch acceptance deferred by user on 2026-10-25.
Date: 2026-10-24. This specification supersedes conflicting scope in the two original bootstrap briefs.

## 1. Product

A browser survivor game where the streamer controls the main character and viewers become autonomous companions carrying skills. The player survives waves, gains levels, recruits the audience, defeats bosses, and retains streamer progression between runs. Viewers see their names and contributions in the game.

Use the existing poke-survivors implementation as the foundation. Preserve and adapt most existing maps, bosses, attacks, upgrades, and progression instead of reducing the product to a two-role demo. Preserve that longer-term direction without requiring exhaustive content conversion before the MVP. Develop the viewer-to-companion loop with local simulation now; verify actual Twitch delivery later, before release. Inventory only what the immediate slice needs; claim support only for verified combinations.

## 2. Confirmed decisions

| ID | Decision |
| --- | --- |
| D01 | Keep and adapt most existing maps, bosses, upgrades, and progression. |
| D02 | Final visual direction: pixel-art fantasy (adventurer, knights, magic, monsters). Slimes/simple characters are possible final companions, not yet an approved asset set. |
| D03 | Do not replace existing assets during development. Asset replacement is the final implementation task before release; verification follows it. |
| D04 | Viewer participation is autonomous. No active viewer commands, cooldown abilities, or votes in the first release beyond joining. |
| D05 | Random roles draw from a larger catalog of inherited attacks/companion types, not only Fireball/Knight or a fixed 50/50 split. |
| D06 | Slimelord-inspired model: recruit a viewer companion carrying a skill. This replaces the initial assumption that half of viewers are player-attached skills. |
| D07 | Default recruitment is level-based; a streamer-controlled Join all mode is also required. |
| D08 | Viewer roles and contribution statistics reset each run; streamer progression persists. |
| D09 | Play the base game starts immediately using the default character/map. Keep the inherited assets and gameplay for this baseline. |
| D11 | Both input providers exist; as of 2026-10-25, use mocks for gameplay development and defer live Twitch authorization/acceptance until later, before release. |
| D10 | Replace the current title illustration with an actual gameplay screenshot in the final presentation pass. |

## 3. Scope

### Required for the MVP
- Existing playable solo survivor foundation and retained streamer progression. Use one existing stage for initial audience acceptance; preserve other content without making exhaustive conversion a prerequisite.
- Run setup and readable HUD; direct base-game launch remains a regression reference.
- Real Twitch chat and credential-free local simulation are delivered together in the first milestone, feeding the same normalized events, duplicate protection and visible queue. Real-channel verification remains explicit; local development does not wait for authorization.
- Per-run viewer registry, waiting queue, two recruitment modes, companion-owned skill execution, and contribution reporting.
- A small varied eligible role catalog derived from existing working content (proposed MVP target: 4–6 combinations). Expand toward the confirmed broader catalog after the core loop works; do not adapt every inherited attack before MVP.
- Clean pause, death, victory, restart, reconnect, and repeated-session behavior.
- Final original/licensed asset conversion and release verification.

### Excluded unless explicitly added
Viewer accounts or persistent viewer progression, subscriber perks, paid priority, runtime LLM features, multiplayer networking between viewers, new crafting/inventory/colony mechanics, and a new database. Existing upstream systems may remain where they work; do not build new systems just because they exist in the original code. Browser is the release target; desktop packaging is deferred.

## 4. Player and viewer flows

### Streamer
Open game → choose base-game reference or audience run → configure channel and recruitment mode → start run → move/collect XP → recruit viewers and choose upgrades → fight waves/bosses → death/victory → review contributions → restart.

Base-game reference launches Charmander, phase1, Emerald theme, hard difficulty, with no debug mode. These are temporary inherited defaults, not final fantasy names. Future audience setup must not silently alter this reference behavior.

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
| BASE-01 | Preserve immediate inherited base-game launch. | Button and Enter enter GameScene + UIScene without selection; movement, spawning, combat and restart work. |
| BASE-02 | Preserve retained content and progression. | Inventory identifies supported stages/bosses/upgrades; each retained stage has smoke coverage and progression survives restart. |
| AUD-01 | Separate audience transport from gameplay. | Identical normalized joins from mock and Twitch reach the same registry; scenes contain no Twitch API calls. |
| AUD-02 | Once-per-run viewer identity. | Repeated joins and transport redelivery create no extra queue entry, companion, or reroll. Different users with equal display names remain distinct. |
| AUD-03 | Mock joins without credentials. | Named single joins and batches are supported; seeded role selection enables reproducible verification. |
| REC-01 | Default level recruitment. | One earned level admits one queued viewer; duplicate level handling cannot spend the same credit twice. Empty-queue credits follow the proposed rule above. |
| REC-02 | Host-controlled Join all. | Existing queue drains safely; future viewers enter; switching back preserves active companions and resumes level recruitment. Chat cannot toggle it. |
| ROLE-01 | Configured role catalog. | Every enabled role declares companion behavior, skill, weight, limits, and compatibility; unavailable or broken attacks are not randomly selected. |
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

Preserve existing enemy waves, map topology, boss behavior, collision/pooling, XP collection, and streamer meta-progression wherever compatible. Introduce recruitment at the level-up boundary rather than rewriting the survivor loop.

Confirmed 2026-10-25: in audience mode, recruitment replaces the level-up skill picker; solo retains existing upgrades. Empty-queue credits are banked. This must be balanced because larger teams multiply damage. Skill upgrades must have an explicit target (player, one companion, or whole squad); never infer ownership from the selected player character. Resolve the reward rule at Step 3 using only the relevant inherited upgrade behavior.

Use local joins through the shared queue to make one simulated viewer a fighting companion using one existing compatible skill, before expanding to the small varied MVP role set. This is implementation order, not a two-role product scope. Disabled attack IDs and incompatibility reasons belong in the catalog audit.

Proposed default: companions have no separate permadeath in the first release. They remain active for the run; the streamer losing ends the team run. Confirm at Step 3 if inherited companion behavior requires a different choice.

## 7. UI and visual design

- Keep current character, effect, item, and map assets during development; temporary labels may identify their inherited names.
- HUD: health, level/XP, timer, objective/boss status, active viewers, waiting viewers, recruitment mode, and compact connection status.
- Audience controls: host-only mode switch, roster, and clearly labelled mock controls in development.
- Recruitment: non-blocking name + role notification; queue bursts aggregate rather than covering gameplay with notifications.
- Roster/results: damage/kills, optional effective healing, role, active/waiting status. Long/Unicode names are bounded and safely rendered.
- Selection and overlay layouts must fit narrow in-app panels. Existing selection overlays clip at approximately 486 px wide; record and fix before audience setup depends on them.
- Final style: readable pixel-art fantasy with consistent scale, silhouettes, effects and UI palette. Final companion species, art source, and exact mapping remain to be designed.
- Final title artwork: a screenshot of the actual converted game, not an illustration that implies unimplemented gameplay.

## 8. Architecture

Reuse Phaser, strict TypeScript, Vite, and existing entity/world/combat systems. Add small modules, not a new ECS or a rewritten game engine.

AudienceProvider → normalized ViewerJoin → ViewerRegistry → RecruitmentSystem → RoleAssignmentSystem → CompanionSystem → owned Attack/DamageTracker → roster/results.

Provider subscriptions return an unsubscribe function. Transport lifetime and run lifetime are separate: restarting a scene must not multiply connections. Every run has a run ID; delayed events/damage from an old run cannot mutate the new one.

Companion skills need an explicit combat-owner context (position, stats, target query, damage owner) rather than direct assumptions about ctx.player. Preserve player attacks through an adapter while migrating eligible companion skills incrementally. Damage events carry a source/owner ID through projectile pooling, chained effects and damage-over-time.

Keep Twitch authorization details out of the game bundle and logs. Select the provider transport and required authorization flow from current official Twitch documentation at Step 1, before companion refactoring; this spec does not prescribe unverified scopes or promise a backend-free flow.

## 9. Capacity and balancing

Join all expresses intent to admit all participating viewers; it is not evidence of unlimited device capacity. Propose 10–20 active viewers as the initial MVP test envelope with representative existing enemy/skill loads. Measure rather than promise capacity. Larger 50/100-viewer tests are post-MVP work unless evidence makes them necessary.

Proposed overload behavior: stagger admission, show pending viewers, and reduce cosmetic effects before degrading gameplay. Do not silently discard participants, merge their identities, invent contribution credit, or promise unlimited independent companions. If a hard active limit is required, return with measured evidence before finalizing the policy.

## 10. Open decisions

- Exact eligible initial companion/attack catalog: resolve through compatibility audit, retaining a broad selection rather than Fireball/Knight only.
- Recruitment replaces the level reward in audience mode (confirmed 2026-10-25); solo upgrades remain unchanged.
- Empty-queue credits, mode switch rules, and companion mortality: proposed defaults above.
- Final capacity/fallback policy after measured load tests.
- Twitch deployment/authentication arrangement after technical validation.
- Final fantasy identity mapping and asset production/source, deferred to the last implementation milestone.

No open item authorizes asset replacement now. These decisions block only their dependent tasks, not the first live Twitch connection and queue demonstration.

## 11. Release gate

Prove the complete real-channel MVP loop, viewer lifecycle, supported-stage regression, modest capacity measurement, and essential UI with existing assets first. A full inherited-content audit is not a prerequisite. Then perform the final asset/branding replacement, audit distributable contents and licenses, capture a real gameplay screenshot/video, and rerun visual/gameplay regressions. Release/publishing requires separate user instruction.
