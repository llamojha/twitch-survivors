# Twitch Survivors

Twitch Survivors is a browser survivor game where viewers join the run as named autonomous companions. A streamer can use Twitch chat or the built-in local simulator. Both sources feed the same queue, recruitment rules, combat system, and contribution table.

The game uses vanilla JavaScript and Canvas 2D. It is based on the MIT-licensed code from `JPTER78/pokesurvivor` at commit `b29708900da26b34e70d2dc07ad1659a719f4a78`. The release presentation uses a compact fantasy roster, code-drawn terrain, and Kenney Tiny Dungeon tiles under CC0.

## Run locally

Requirements:

- Node.js 22 or newer
- Python 3 for the local static server

Install is not required. Start the source build with:

```sh
npm run serve
```

Open `http://127.0.0.1:4173/dev.html`. Press **Play** for a default run.

The local profile and streamer progression live in this browser. Viewer roles and contribution stats reset for each run.

## Audience modes

Open **Audience** from the main menu.

- **Local simulation:** add one named viewer or a batch of ten. This path needs no Twitch account.
- **Twitch chat:** enter the channel, token-owner username, and a user access token with `chat:read`. The browser keeps the token in memory and clears it when disconnected.
- **One per level:** each new level recruits the next waiting viewer. Empty levels bank recruitment credits.
- **Join all:** recruits everyone waiting and admits later joins immediately.

Viewers follow the streamer, attack nearby enemies, and earn direct damage and kill credit. The in-run dock shows the queue and leaders. The run result shows the full contribution table.

See [the Twitch setup guide](docs/twitch-setup.md) for authorization and live acceptance steps.

## Controls

| Input | Action |
|---|---|
| `W` `A` `S` `D` or arrows | Move |
| `1` to `4` | Select an attack |
| `Q` / `E` | Previous or next attack |
| `Esc` / `P` | Pause |
| Touch drag | Move on phones and tablets |

Use landscape orientation on mobile.

## Build and checks

```sh
npm test
npm run build
npm run audit:assets
```

The production build writes `index.html`, `js/app.min.js`, and `version.json`. Edit `dev.html` and source modules, then rebuild. Do not edit generated files directly.
Use `npm run build:test` only for browser automation that needs access to the internal `window.G` test hooks; it intentionally produces an exposed, non-release bundle.

The asset audit rejects legacy actor paths, visible inherited identity, unapproved remote services, and missing license files.

## Project layout

```text
js/audience/       normalized local and Twitch input
js/entities/       player, enemies, companions, projectiles, pickups
js/systems/        combat, spawning, recruitment-adjacent game systems
js/world/          procedural terrain, props, collision
js/ui/             menus, HUD, audience panel, run results
js/data/           fantasy roster and gameplay data
assets/fantasy/    approved fantasy art and license files
docs/              product spec, plans, acceptance record, provenance
tests/             Node tests for audience, combat, and release audit
```

## Licensing

The pinned upstream code is MIT licensed. The original notice remains in [LICENSE](LICENSE).

Pixelify Sans is licensed under the SIL Open Font License 1.1. Kenney Tiny Dungeon 1.0 is CC0. Paths, sources, and checksums are recorded in [docs/asset-provenance.md](docs/asset-provenance.md) and [THIRD_PARTY_LICENSES.md](THIRD_PARTY_LICENSES.md).
