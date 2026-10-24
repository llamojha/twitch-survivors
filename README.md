# Twitch Survivors

**Your Twitch chat becomes your build.** A browser survivor game being adapted from [poke-survivors](https://github.com/giovanneluna/poke-survivors).

## Current state

This is the first migration pass, not a finished Twitch game. It has an original Twitch Survivors entry screen and retains the upstream combat, enemies, waves, maps, map editor, progression, and selection/HUD systems. Pokémon artwork, names, and much of the UI still remain. Local audience simulation and an authenticated Twitch chat provider now feed the same waiting queue. Companion recruitment is not implemented yet; live Twitch delivery remains an early acceptance check.

The direction is one streamer-controlled survivor, with viewers joining as named skills or companions. See [the migration TODO](docs/migration-plan.md).

## Local development

Use Node.js 22 LTS or newer with npm. The initial validation used Node.js 26.1.0.

```sh
npm ci
npm run dev
```

Open http://localhost:8080. Choose **Play the base game** (or press Enter) to start immediately as Charmander on phase 1 with the Emerald map theme and the inherited hard difficulty. Move with WASD or arrow keys; attacks run automatically. The map editor is accessible from the title screen. The inherited selection/HUD still use their original presentation during migration.

```sh
npm run typecheck
npm run build
npm run preview
```

Audience tests are available through `npm test`. Browser validation and build results are recorded in [the hackathon log](docs/hackathon.md).

Open **Audience** in the bottom-right corner. Local simulation starts automatically: use **Join viewer** with Alice or another name, or **Add 10 viewers**. Switch to Twitch chat to enter connection details; see [Twitch setup](docs/twitch-setup.md). Both modes share duplicate protection and the waiting queue. Switching sources or starting a new run clears the queue. Viewers do not fight yet.

## Architecture and provenance

- Phaser 3 scenes and Arcade Physics; TypeScript strict mode; Vite.
- Existing scene flow: Boot → new Title → Game + UI directly; inherited selection remains available from other game flows.
- World generation, biome selection, map schema, collisions, and pooling are retained.
- Fork save data and language preferences use separate keys from the upstream game.
- Upstream is recorded as the `upstream` Git remote. The private project repository is `llamojha/twitch-survivors`, configured as `origin`; initial work uses `feat/twitch-survivors-mvp`.
- Desktop packaging remains inherited and unverified; its release workflow is now manual only.

## Asset migration status

The MIT code license is preserved in [LICENSE](LICENSE). It does not establish reuse rights for Pokémon artwork, game-derived map tiles, or other third-party assets. This checkout and its build still include those assets. Do not describe the current build as original art or submission-ready. Map structure can be retained while tile artwork is replaced. See [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).

## Product planning

See [product specification](docs/product-spec.md) for confirmed decisions, requirements and open tuning rules, and [implementation plan](docs/implementation-plan.md) for ordered tasks and acceptance gates. Existing assets stay until the final pre-release implementation milestone.
