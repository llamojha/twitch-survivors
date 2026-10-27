# Twitch Survivors architecture

## Foundation

The release foundation is `JPTER78/pokesurvivor@b29708900da26b34e70d2dc07ad1659a719f4a78`. It is a dependency-light browser game built with vanilla JavaScript and Canvas 2D. Modules attach explicit APIs to a shared `window.G` namespace and load in the order declared by `dev.html`. `tools/build.js` concatenates those sources and generates `index.html` plus `js/app.min.js`.

The project retains the upstream world, rendering, movement, spawning, combat, projectile, level, and local progression systems. Cloud accounts, rankings, donations, moderation, and online co-op are outside the hackathon MVP.

## Audience boundary

Audience transports emit one normalized event:

```js
{ type: 'viewer_join', viewer: { id, displayName } }
```

`MockAudienceProvider` and `TwitchAudienceProvider` implement the same lifecycle and feed `AudienceSession`. The session owns once-per-run identity, FIFO waiting order, active viewers, provider-generation guards, and contribution state. Gameplay never parses Twitch messages or handles access tokens.

Transport lifetime is longer than run lifetime. Starting a new run clears viewer participation while leaving the selected provider connected. Changing providers invalidates callbacks from the old provider.

## Recruitment

`RecruitmentState` supports:

- Solo mode, which leaves the inherited level-card flow intact.
- Audience level mode, where each earned level grants one FIFO recruitment credit.
- Join all, where current and subsequent viewers are admitted immediately during playable updates.

Empty-queue credits remain available for later viewers. Provider callbacks only enqueue viewers; companion creation occurs in the playable update loop so pause and outcome screens cannot spawn entities.

## Companions and combat ownership

Viewer companions are lightweight actors managed separately from the streamer and inherited online co-op players. Each actor follows a stable formation slot, finds targets through the enemy spatial query, and fires a configured role on a recruitment-relative staggered schedule.

Audience projectiles carry immutable viewer and run ownership separately from the projectile's physical owner. Combat branches on that ownership so viewer attacks do not trigger streamer critical hits, life-steal, or personal damage statistics. Contributions count effective HP removed after shields and mitigation; final-source kills count once. Streamer-wide run kills remain unchanged for inherited progression.

## UI and security

The Audience panel owns source selection, local simulation, Twitch connection fields, queue/roster display, recruitment mode, connection status, and contribution summaries. It renders external display names through text nodes.

Twitch user access tokens remain only in provider memory. The token input is cleared after connection attempts. Client secrets are never part of browser code, storage, logs, or documentation.

## Asset boundary

Inherited Pokémon and SpriteCollab content is a development placeholder. The final presentation layer replaces terrain, actors, names, icons, and identity while retaining internal gameplay contracts where that avoids unnecessary save or balance changes. `docs/asset-overhaul-plan.md` defines the release gate.
