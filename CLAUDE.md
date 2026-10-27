# Twitch Survivors

Browser survivor game being migrated to `JPTER78/pokesurvivor` at exact MIT commit `b29708900da26b34e70d2dc07ad1659a719f4a78`. The current Phaser/TypeScript checkout is a recoverable prototype built from the wrong similarly named upstream. The target architecture is the correct fork's dependency-free vanilla JavaScript, Canvas 2D, and `window.G` modules.

- Never stage, commit, push, rewrite history, or publish without explicit user instruction.
- Preserve the correct fork's working combat, procedural world, collision, spatial-query, and rendering systems during migration.
- Keep inherited assets only as development placeholders. Replace Pokémon identities and artwork in the final pre-release task, followed by release verification. Do not add Pokémon art or rip assets from other games.
- Preserve LICENSE and THIRD_PARTY_LICENSES.md. Code licensing does not establish rights to third-party artwork.
- Track remaining work in docs/migration-plan.md and Codex work in docs/hackathon.md.
- Gameplay must eventually consume generic audience events; Twitch API logic belongs in a provider.
- Implement first, then add meaningful tests. Do not use TDD.
- Run typecheck, build, and real-browser verification for visual/gameplay changes.
- No new frameworks or speculative refactors. Match the correct fork's browser-module conventions; do not convert it to Phaser, TypeScript, or Vite during the MVP rework.
- The inherited game-development skill is not installed in this workspace; use available tools and the project instructions above.
