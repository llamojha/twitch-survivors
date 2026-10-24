# Twitch Survivors

Phaser 3 + strict TypeScript + Vite survivor game, adapted from Giovanne Luna's MIT-licensed poke-survivors. The user's current direction supersedes the inherited Pokémon-specific authoring rules.

- Never stage, commit, push, rewrite history, or publish without explicit user instruction.
- Preserve the working combat, collision, pooling, and map systems during migration.
- Keep existing assets throughout gameplay development and testing. Replace Pokémon identities and artwork only in the final pre-release task, followed by release verification. Do not add Pokémon art or rip assets from other games.
- Preserve LICENSE and THIRD_PARTY_LICENSES.md. Code licensing does not establish rights to third-party artwork.
- Track remaining work in docs/migration-plan.md and Codex work in docs/hackathon.md.
- Gameplay must eventually consume generic audience events; Twitch API logic belongs in a provider.
- Implement first, then add meaningful tests. Do not use TDD.
- Run typecheck, build, and real-browser verification for visual/gameplay changes.
- No new frameworks or speculative refactors. Keep TypeScript strict; no explicit any.
- The inherited game-development skill is not installed in this workspace; use available tools and the project instructions above.
