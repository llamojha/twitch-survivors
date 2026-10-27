# Twitch Survivors art direction

## Visual goal

Twitch Survivors is a readable pixel-fantasy survivor game: one streamer hero leads a crowd of named viewer companions through ruins, moonlit caverns, and an ember keep. The screen should retain the density and clarity of the pinned upstream game while presenting an original fantasy identity with release-cleared assets.

The current vertical slice uses Kenney Tiny Dungeon actors for a consistent base and project-generated terrain for the world. A small reusable cast is intentional for the MVP; gameplay variety comes from roles, attacks, palettes, names, and encounter behavior rather than hundreds of unique species.

## Pixel and rendering contract

- Actor source cells are 16×16 pixels from the packed Kenney sheet.
- World tiles are generated at 16×16 art pixels.
- Render sprites and terrain at integer scale with image smoothing disabled.
- Preserve the gameplay ground point: actors are positioned by their feet, with the visual body extending upward.
- Keep shadows centered beneath the foot anchor and viewer labels above the silhouette.
- Preserve world Y sorting so lower feet draw in front of higher feet.
- Keep attacks aligned to the actor's ground point and facing direction.
- Runtime fallback actors use hard-edged rectangles on the same pixel grid; they must not create a second soft or vector-like style.

The Kenney packed sheet provides static poses. Movement currently reads through direction, game motion, bobbing, attack offset, hit flash, and effects. True multi-frame directional animation is a post-MVP improvement unless a compatible, documented asset set is added.

## Cast language

| Gameplay purpose | Presentation |
| --- | --- |
| Streamer | Arcblade: a compact armored hero with a strong centered silhouette. |
| Scout viewer | Light adventurer/goblin silhouette; fast single-target attacks. |
| Volley viewer | Ranged adventurer silhouette; wider multi-shot cadence. |
| Piercer viewer | Mage/guard silhouette; straight penetrating magic. |
| Regular enemies | Reusable slimes, skeletons, goblins, wisps, mushrooms, imps, wolves, and sentinels. |
| Bosses | Enlarged or otherwise emphasized warden/tyrant archetypes with distinct effects and banners. |

Viewer display names remain the strongest ownership cue. Role color and attack behavior should distinguish companions when several share an actor cell. Actor reuse must never hide which viewer earned damage or kills in the UI.

## Palette and lighting

The shared palette favors dark blue-violet structure, cool teal world tones, warm gold rewards, and restrained magenta accents. Contrast should come from value before hue so attacks and actors remain legible for color-deficient players.

- **Verdant Ruins:** teal-green ground, warm brown paths, cyan water, muted stone, yellow/pink/white flowers.
- **Moonlit Grotto:** indigo ground, violet stone, cyan crystals and water, pale blue highlights.
- **Ember Keep:** charcoal-red ground, near-black masonry, orange lava, gold heat highlights.
- **UI:** deep navy/slate panels, pale text, gold primary actions and rewards, cyan information, red danger.

Lighting is top-left by convention. Highlights belong on top/left planes and shadows on bottom/right planes. Avoid global blur, gradients over pixel art, and subpixel placement.

## World contract

The rework changes presentation while preserving the procedural game's spatial behavior:

- Keep chunk size, seeded layout, terrain categories, walkability, obstacle bounds, spawn safety, and camera behavior.
- Paths and floor patches need distinct value and texture without looking like walls.
- Water and lava edges must read before the player touches them.
- Trees, rocks, crystals, tall grass, and ruins need clear bases that match their collision footprint.
- Decoration may overlap empty ground but must not resemble pickups or hostile projectiles.
- Minimap colors must remain distinguishable at small size.

## Combat and UI readability

- The streamer and viewer companions must remain visible under projectile load.
- Enemy silhouettes should separate from the active biome at a glance.
- Damage effects may flash white but must not erase identity for more than a frame.
- Use names in roster/result interfaces; show only a bounded subset of world labels during large crowds.
- Reserve gold diamonds/crowns for progression and rewards.
- Keep Twitch state and recruitment controls visually separate from combat actions.
- Avoid Pokémon-shaped icons, capture-ball motifs, species/type language, and inherited franchise colors used as identity cues.

## Approval checklist for the vertical slice

- [x] Release-cleared actor sheet and license stored together.
- [x] Streamer, three viewer roles, regular enemies, and boss archetype mapped through one presentation module.
- [x] Three core biome palettes established without changing procedural topology.
- [x] Stable internal IDs separated from player-facing fantasy names.
- [x] Verify eight-direction movement, attack origins, hit flashes, foot anchors, labels, and Y sorting in active gameplay.
- [x] Verify menu, HUD, audience controls, and outcome UI at desktop and narrow widths.
- [ ] Capture user-approved screenshots after the remaining identity purge and release audit pass.

