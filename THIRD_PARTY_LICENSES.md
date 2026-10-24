# Third-party notices and asset migration

## Upstream code

Source: https://github.com/giovanneluna/poke-survivors
Cloned baseline: 188329a4eabe93072d3d18f740e4ce76ed4662da
Copyright (c) 2024-2026 Giovanne Luna. MIT License.

The full upstream notice is retained verbatim in LICENSE. The repository is a derivative work, not an independent from-scratch implementation. Inherited game systems must not be represented as new hackathon work.

## Assets: not cleared by the code license

Upstream documentation identifies Pokémon sprites/artwork/items from PMDCollab, PokeAPI, and pokemonAutoChess. The asset loader also references other game-derived effects and environment art. Tile themes include Emerald, FireRed, and Mystery Dungeon. No independent grant covering the underlying game IP was established in this pass.

These files remain in the migration checkout and are copied into the Vite build. They are not approved original Twitch Survivors assets. The migration must replace them or establish applicable permission before distribution/submission. Keeping map generation and layout does not require keeping the tile artwork.

## New work

The title-screen geometric preview is drawn directly with Phaser graphics and uses no external artwork. Package dependencies retain their respective upstream license files in their installed packages. The project root MIT notice must remain with redistributed substantial portions of the upstream code.
