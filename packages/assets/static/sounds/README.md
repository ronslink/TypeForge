# Sound Assets

Audio feedback for typing: one sound per category and theme, synthesised and
encoded by a script rather than recorded — see [Regenerating](#regenerating).

## Where the files live

```
apps/web/static/assets/sounds/     <- the files that are actually served
├── keystroke/{mechanical,soft,retro}.mp3
├── error/{mechanical,soft,retro}.mp3
├── success/{mechanical,soft,retro}.mp3
├── notification/{mechanical,soft,retro}.mp3
└── ambient/{mechanical,soft,retro}.mp3
```

SvelteKit serves `apps/web/static` at the site root, so these land on exactly the
`/assets/sounds/...` URLs declared in `packages/assets/src/sounds/index.ts`. That
is why the files live there rather than here: a file this package cannot serve is
a file the application cannot play.

## Regenerating

```bash
pnpm sounds:generate   # synthesise and encode; idempotent
pnpm sounds:check      # fail if the committed files drift from the generator
```

`scripts/generate-sounds.mjs` synthesises every sound from scratch — no external
samples and no licensing questions — and encodes it with `ffmpeg`/`libmp3lame`.
Requires `ffmpeg` on `PATH`. Output is deterministic: regenerating without
touching the script rewrites nothing.

`--check` compares against a fresh encode. That is a reliable guard on one
machine; libmp3lame output is not guaranteed byte-identical across ffmpeg
versions, so it is deliberately not wired into CI.

## The `custom` slot

`custom.mp3` is **not** generated. It is the slot a user fills:

1. Place your MP3 in the appropriate category folder as `custom.mp3`
2. Users can otherwise upload their own sound via settings

Until then, selecting a `custom` theme finds no file; the loader logs a warning
and plays nothing rather than failing.

## Requirements

| Property | Value |
| --- | --- |
| Format | MP3, mono, 44.1kHz |
| Bit rate | 128kbps keystroke, 192kbps others |
| Peak level | −3dBFS |
| Keystroke | 50–150ms |
| Error | 100–300ms |
| Success | 300–1000ms |
| Notification | 200–500ms |
| Ambient | 30–60s, seamless loop |

The generator enforces all of the above and exits non-zero if a file is out of
spec, so these numbers are a contract rather than a suggestion.

### Two notes on how these are measured

- **Measured bit rate exceeds the target on keystrokes.** An MP3 frame is ~26ms,
  so a 60–90ms file is only a few frames and its *average* bit rate lands at
  220–280kbps even though the encoder is set to 128kbps. Nothing is wrong; the
  requested setting is what matters.
- **Ambient beds are loop-exact by construction.** Every partial and LFO
  completes a whole number of cycles across the buffer, and no noise is used, so
  the seam is inaudible. This is verified against the decoded audio rather than
  assumed: the sample-to-sample jump across the loop point is smaller than the
  steepest slope inside the loop.

## Quality and replacing them

These are synthesised tones, not recordings. They are clean, level-matched and
consistent, and they read correctly as mechanical / soft / retro — but they are
not sampled from a real keyboard. If the product wants recorded switch sounds,
drop replacements at the same paths and keep the same spec; nothing else needs to
change.

## Preloading

Keystroke sounds are intended to be preloaded once via the Web Audio API so
playback has no decode cost at typing time.
