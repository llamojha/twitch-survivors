# Current Codex handoff

Updated: 2026-10-24 (Europe/Madrid).

## Current state
MVP step 1 is implemented: local simulation and authenticated Twitch input share a normalized event, FIFO queue and duplicate protection. The audience panel supports named joins, adding ten viewers, mode switching, reset and disconnect. New runs clear the queue while retaining the connection. Play starts the inherited game immediately.

## Verified
- 12 audience/protocol tests, TypeScript check and production build passed during step 1.
- Browser: local joins, duplicate suppression, switching modes, Enter isolation in the panel, queue reset on game start and a local join during gameplay.
- Existing large-bundle warning remains. Evidence: `../docs/audience-inputs.png`.

## Next action
Continue step 2 of [the implementation plan](../docs/implementation-plan.md): verify an actual Twitch !join reaches the game using an authorized channel. Follow [Twitch setup](../docs/twitch-setup.md). Authorization details belong in the local UI, never chat or project notes. Local development remains available without Twitch.

## Limitations and decisions
- Live Twitch authorization/delivery has NOT been verified. Mock protocol tests do not establish live acceptance.
- Connection currently takes an existing user access token; integrated OAuth login is not implemented.
- Viewer companions, recruitment modes and contribution stats are future milestones.
- Keep existing assets until step 6, then replace them and verify release.
- Recruitment credit/empty-queue tuning remains undecided.
- The user authorized creating a private GitHub repository and committing/pushing this work. Destination: `llamojha/twitch-survivors` (`origin`); branch: `feat/twitch-survivors-mvp`. The initial repository was empty, with no base branch. Preserve the upstream history and attribution.

## Latest maintenance
Added project AGENTS.md and this .codex handoff structure at the user's request. The existing implementation plan and hackathon log remain authoritative; do not create competing task lists.
