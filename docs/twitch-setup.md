# Twitch chat setup (milestone 1)

This browser-only integration reads one channel through Twitch's documented authenticated IRC WebSocket transport. Twitch recommends EventSub for fuller chatbot integrations; IRC keeps this read-only milestone small. No backend, client secret, anonymous login, or chat sending is involved.

1. Obtain a Twitch **user access token** for your own bot or broadcaster account with the `chat:read` scope. Use a trusted OAuth flow associated with your registered Twitch application. Twitch's [implicit grant flow](https://dev.twitch.tv/docs/authentication/getting-tokens-oauth/#implicit-grant-flow) supports browser applications without a client secret. This milestone accepts an existing token and does not implement an OAuth redirect flow.
2. Select Twitch in the audience panel. Enter the target channel's login, the token owner's login (these can differ), and the access token. An `oauth:` prefix is accepted.
3. Connect and wait for the connected status confirming the channel. A viewer sends exactly `!join` (case insensitive; surrounding whitespace is allowed). Their Twitch user ID becomes `twitch:<user-id>` and their display name is sent into the shared viewer queue.
4. Disconnect to close the socket and discard the provider's token. Tokens are held only in memory; do not paste one into source files, URLs, logs, screenshots, or shared recordings. Re-enter the token for a new provider after disconnecting.

The connection requests Twitch tags, commands, and membership capabilities and answers PING with PONG. Authentication/channel failures, network errors, a 15-second connection timeout, and Twitch RECONNECT requests appear as errors. Reconnect explicitly after correcting the issue; there is no automatic retry loop. User-facing errors never include raw server messages or credentials. Tokens are validated before connecting and at least hourly (sooner when nearing expiry), including token-owner login, user ID, chat:read scope, and expiry. Invalid or revoked tokens end the connection. Expired tokens require a new token; automatic token refresh is outside this prototype.

The provider emits normalized events only. Queue deduplication, capacity, and gameplay spawning belong to the shared consumer, so repeated chat messages and mock events use the same rules. Channel presence alone does not enqueue a viewer.

Verification covers simulated WebSockets and tagged IRC messages. Live Twitch verification requires a consenting channel and valid credentials and has not been performed by automated tests.

Official references:

- [IRC connection, authentication, capabilities, channel joins and keepalive](https://dev.twitch.tv/docs/chat/irc/)
- [IRC read scope](https://dev.twitch.tv/docs/authentication/scopes/#irc-chat-scopes)
- [Required startup and hourly token validation](https://dev.twitch.tv/docs/authentication/validate-tokens/)
- [Twitch authentication and token handling](https://dev.twitch.tv/docs/authentication/)
- [Preferred EventSub chat architecture](https://dev.twitch.tv/docs/chat/)

## Step 2 live acceptance checklist

Start the base game first, because starting a run clears its queue. Open Audience, choose Twitch chat, enter connection details locally and connect. Do not share or record the token.

- [ ] Connected status names the intended channel.
- [ ] Send !join in that channel; the viewer appears in the game queue.
- [ ] Send !join again from the same account; queue count stays unchanged.
- [ ] If available, a second account joins and appears after the first.
- [ ] Switch to Local simulation; the old queue clears and Alice can join without Twitch credentials.
- [ ] Record date, browser, observed counts and pass/fail, without credentials or unrelated chat contents.

Automated integration coverage exercises both providers through the same session. This is protocol simulation, not evidence of real Twitch delivery. Live acceptance is still pending.
