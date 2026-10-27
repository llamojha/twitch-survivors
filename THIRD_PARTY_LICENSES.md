# Third-party notices

## PokéSurvivor code baseline

Twitch Survivors is based on `JPTER78/pokesurvivor` at commit `b29708900da26b34e70d2dc07ad1659a719f4a78`.

Copyright © 2026 JPTER78. The code at that pinned revision is provided under the MIT License. The original notice is preserved in `LICENSE`.

Code published upstream after the pinned revision is not part of this fork unless separately documented.

## Pixelify Sans

The inherited Pixelify Sans font files under `assets/fonts/` are provided under the SIL Open Font License 1.1. The font notice is preserved at `assets/fonts/OFL.txt`.

## Kenney Tiny Dungeon

The fantasy actor presentation uses selected 16×16 cells from Kenney's **Tiny Dungeon 1.0** packed tilemap:

- Creator/distributor: Kenney
- Primary source: https://kenney.nl/assets/tiny-dungeon
- License: Creative Commons Zero 1.0, https://creativecommons.org/publicdomain/zero/1.0/
- Repository files: `assets/fantasy/kenney-tiny-dungeon/tilemap_packed.png` and the preserved upstream notice at `assets/fantasy/kenney-tiny-dungeon/LICENSE.txt`

CC0 does not require attribution. Twitch Survivors credits Kenney voluntarily. Runtime code crops actor cells from the packed sheet and renders them with nearest-neighbor scaling; the stored PNG is otherwise unmodified. Full provenance is recorded in `docs/asset-provenance.md`.

## Removed baseline content

The pinned baseline included a franchise-specific roster, PokéAPI-derived data, and SpriteCollab artwork licensed separately from the MIT code. Twitch Survivors does not ship those actor files or generated datasets. The release audit rejects their paths and visible identity if they return.

An asset is approved for the release only when it is listed in `docs/asset-provenance.md`.
