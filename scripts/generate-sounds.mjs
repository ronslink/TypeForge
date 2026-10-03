#!/usr/bin/env node
/**
 * Generates the typing-feedback audio assets.
 *
 * The sounds are synthesised from scratch — no external samples, no licensing
 * questions, and byte-identical output on every run — then encoded to MP3 with
 * ffmpeg. The spec they must satisfy is documented in
 * `packages/assets/static/sounds/README.md`: 44.1kHz, 128kbps for keystrokes and
 * 192kbps elsewhere, normalised to -3dBFS peak, with per-category durations.
 *
 *   node scripts/generate-sounds.mjs           # write (idempotent)
 *   node scripts/generate-sounds.mjs --check   # fail if the files on disk drift
 *
 * Output: apps/web/static/assets/sounds/<category>/<theme>.mp3
 *
 * That is the location the application can actually serve: SvelteKit serves
 * `apps/web/static` at the site root, so these land on exactly the
 * `/assets/sounds/...` URLs declared in `packages/assets/src/sounds/index.ts`.
 * `custom` is deliberately not generated — it is the slot the user fills via
 * settings.
 *
 * Requires ffmpeg with libmp3lame on PATH.
 */
import { execSync } from 'node:child_process';
import { mkdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const SAMPLE_RATE = 44_100;
const PEAK_DBFS = -3;
const OUT_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/web/static/assets/sounds');
const CHECK_ONLY = process.argv.includes('--check');

const THEMES = ['mechanical', 'soft', 'retro'];

// ---------------------------------------------------------------------------
// DSP primitives
// ---------------------------------------------------------------------------

/** Deterministic PRNG, so a regenerated file is identical to the committed one. */
function createRandom(seed) {
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    return (state / 0xffffffff) * 2 - 1;
  };
}

const toSamples = (milliseconds) => Math.round((milliseconds / 1000) * SAMPLE_RATE);

function bufferFor(milliseconds) {
  return new Float32Array(toSamples(milliseconds));
}

/** Exponential decay starting at `startMs`, silent before it. */
function decayAt(t, startSeconds, tau) {
  if (t < startSeconds) return 0;
  return Math.exp(-(t - startSeconds) / tau);
}

function addSine(out, { freq, amp, startMs = 0, tau = null, phase = 0 }) {
  const start = startMs / 1000;
  for (let i = 0; i < out.length; i += 1) {
    const t = i / SAMPLE_RATE;
    if (t < start) continue;
    const envelope = tau === null ? 1 : decayAt(t, start, tau);
    if (envelope < 1e-5) continue;
    out[i] += amp * envelope * Math.sin(2 * Math.PI * freq * (t - start) + phase);
  }
}

/** Band-limited-ish square: the fundamental plus the first few odd harmonics. */
function addSquare(out, { freq, amp, startMs = 0, tau = null, harmonics = 5 }) {
  for (let h = 1; h <= harmonics; h += 2) {
    addSine(out, { freq: freq * h, amp: (amp * 4) / (Math.PI * h), startMs, tau });
  }
}

function addNoise(out, { amp, startMs = 0, tau, seed }) {
  const random = createRandom(seed);
  const start = startMs / 1000;
  for (let i = 0; i < out.length; i += 1) {
    const t = i / SAMPLE_RATE;
    if (t < start) continue;
    const envelope = decayAt(t, start, tau);
    if (envelope < 1e-5) continue;
    out[i] += amp * envelope * random();
  }
}

/** One-pole low-pass, for turning a noise burst into a soft "thock". */
function lowpass(out, cutoffHz) {
  const alpha = 1 - Math.exp((-2 * Math.PI * cutoffHz) / SAMPLE_RATE);
  let previous = 0;
  for (let i = 0; i < out.length; i += 1) {
    previous += alpha * (out[i] - previous);
    out[i] = previous;
  }
}

/** One-pole high-pass, for thinning a click. */
function highpass(out, cutoffHz) {
  const alpha = 1 - Math.exp((-2 * Math.PI * cutoffHz) / SAMPLE_RATE);
  let previousIn = 0;
  let previousOut = 0;
  for (let i = 0; i < out.length; i += 1) {
    const value = out[i];
    previousOut = alpha * (previousOut + value - previousIn);
    previousIn = value;
    out[i] = previousOut;
  }
}

/**
 * Slow amplitude movement that starts and ends at exactly the same value, so an
 * ambient loop has no seam. `cycles` must be an integer number of cycles across
 * the whole buffer, which is why every ambient component is built to divide the
 * loop length exactly.
 */
function amplitudeLfo(out, { cycles, depth }) {
  if (!Number.isInteger(cycles)) throw new Error(`LFO cycles must be an integer, got ${cycles}`);
  for (let i = 0; i < out.length; i += 1) {
    const phase = (2 * Math.PI * cycles * i) / out.length;
    out[i] *= 1 - depth + depth * (0.5 + 0.5 * Math.cos(phase));
  }
}

function normalisePeak(out, targetDbfs = PEAK_DBFS) {
  let peak = 0;
  for (const sample of out) peak = Math.max(peak, Math.abs(sample));
  if (peak === 0) throw new Error('refusing to normalise a silent buffer');
  const gain = 10 ** (targetDbfs / 20) / peak;
  for (let i = 0; i < out.length; i += 1) out[i] *= gain;
  return out;
}

/** Fade the tail out so a cut-off decay cannot click. */
function fadeOut(out, milliseconds) {
  const tail = Math.min(toSamples(milliseconds), out.length);
  for (let i = 0; i < tail; i += 1) out[out.length - tail + i] *= 1 - i / tail;
}

function toInt16Le(samples) {
  const buffer = Buffer.alloc(samples.length * 2);
  for (let i = 0; i < samples.length; i += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), i * 2);
  }
  return buffer;
}

// ---------------------------------------------------------------------------
// Sound design
// ---------------------------------------------------------------------------

/** Short and subtle: a noise transient for the switch plus a low body for the case. */
const keystroke = {
  mechanical() {
    const out = bufferFor(70);
    addNoise(out, { amp: 0.9, tau: 0.0025, seed: 11 });
    highpass(out, 1800);
    const body = bufferFor(70);
    addSine(body, { freq: 175, amp: 0.8, tau: 0.012 });
    addSine(body, { freq: 350, amp: 0.25, tau: 0.009 });
    for (let i = 0; i < out.length; i += 1) out[i] += body[i];
    fadeOut(out, 5);
    return out;
  },
  soft() {
    const out = bufferFor(60);
    addNoise(out, { amp: 0.5, tau: 0.006, seed: 23 });
    lowpass(out, 900);
    addSine(out, { freq: 120, amp: 0.9, tau: 0.01 });
    fadeOut(out, 6);
    return out;
  },
  retro() {
    const out = bufferFor(90);
    addNoise(out, { amp: 0.8, tau: 0.002, seed: 37 });
    highpass(out, 2500);
    // Inharmonic partials for the metal type-bar ring, rather than a tone.
    addSine(out, { freq: 2480, amp: 0.5, tau: 0.02 });
    addSine(out, { freq: 3710, amp: 0.3, tau: 0.016 });
    addSine(out, { freq: 190, amp: 0.5, tau: 0.01 });
    fadeOut(out, 8);
    return out;
  },
};

const error = {
  mechanical() {
    const out = bufferFor(180);
    addSquare(out, { freq: 140, amp: 0.7, tau: 0.055, harmonics: 7 });
    addSine(out, { freq: 70, amp: 0.4, tau: 0.07 });
    fadeOut(out, 10);
    return out;
  },
  soft() {
    const out = bufferFor(200);
    addSine(out, { freq: 233, amp: 0.7, tau: 0.05 });
    addSine(out, { freq: 196, amp: 0.7, startMs: 70, tau: 0.06 });
    fadeOut(out, 20);
    return out;
  },
  retro() {
    const out = bufferFor(220);
    // A descending two-step "denied" figure.
    addSquare(out, { freq: 440, amp: 0.5, tau: 0.05, harmonics: 5 });
    addSquare(out, { freq: 220, amp: 0.5, startMs: 90, tau: 0.06, harmonics: 5 });
    fadeOut(out, 15);
    return out;
  },
};

const success = {
  mechanical() {
    const out = bufferFor(450);
    [523.25, 659.25, 783.99].forEach((freq, index) => {
      addSine(out, { freq, amp: 0.6, startMs: index * 90, tau: 0.12 });
      addSine(out, { freq: freq * 2, amp: 0.15, startMs: index * 90, tau: 0.08 });
    });
    fadeOut(out, 20);
    return out;
  },
  soft() {
    const out = bufferFor(700);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      addSine(out, { freq, amp: 0.55, startMs: index * 120, tau: 0.25 });
      addSine(out, { freq: freq * 2, amp: 0.12, startMs: index * 120, tau: 0.18 });
    });
    fadeOut(out, 50);
    return out;
  },
  retro() {
    const out = bufferFor(500);
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, index) => {
      addSquare(out, { freq, amp: 0.4, startMs: index * 70, tau: 0.09, harmonics: 5 });
    });
    fadeOut(out, 20);
    return out;
  },
};

const notification = {
  mechanical() {
    const out = bufferFor(300);
    addNoise(out, { amp: 0.5, tau: 0.002, seed: 71 });
    addSine(out, { freq: 880, amp: 0.7, tau: 0.075 });
    fadeOut(out, 10);
    return out;
  },
  soft() {
    const out = bufferFor(400);
    // Simple bell: fundamental with quiet partials.
    addSine(out, { freq: 660, amp: 0.7, tau: 0.16 });
    addSine(out, { freq: 1320, amp: 0.25, tau: 0.12 });
    addSine(out, { freq: 1976, amp: 0.12, tau: 0.09 });
    fadeOut(out, 30);
    return out;
  },
  retro() {
    const out = bufferFor(280);
    addSquare(out, { freq: 1046.5, amp: 0.45, tau: 0.05, harmonics: 5 });
    addSquare(out, { freq: 1318.5, amp: 0.45, startMs: 80, tau: 0.06, harmonics: 5 });
    fadeOut(out, 15);
    return out;
  },
};

/**
 * Ambient beds. Built only from partials and LFOs that complete a whole number
 * of cycles across the buffer, so the loop point is inaudible. Noise is
 * deliberately absent for the same reason.
 */
const AMBIENT_MS = 30_000;

const ambient = {
  mechanical() {
    const out = bufferFor(AMBIENT_MS);
    addSine(out, { freq: 55, amp: 0.5 });
    addSine(out, { freq: 82.5, amp: 0.28 });
    addSine(out, { freq: 110, amp: 0.16 });
    amplitudeLfo(out, { cycles: 3, depth: 0.18 });
    return out;
  },
  soft() {
    const out = bufferFor(AMBIENT_MS);
    addSine(out, { freq: 110, amp: 0.42 });
    addSine(out, { freq: 110.5, amp: 0.36 }); // slow beating, still loop-exact
    addSine(out, { freq: 165, amp: 0.2 });
    addSine(out, { freq: 220, amp: 0.12 });
    amplitudeLfo(out, { cycles: 2, depth: 0.22 });
    return out;
  },
  retro() {
    const out = bufferFor(AMBIENT_MS);
    addSquare(out, { freq: 55, amp: 0.26, harmonics: 3 });
    addSquare(out, { freq: 82.5, amp: 0.14, harmonics: 3 });
    amplitudeLfo(out, { cycles: 5, depth: 0.26 });
    return out;
  },
};

const CATEGORIES = [
  { name: 'keystroke', bitrate: '128k', build: keystroke, minMs: 50, maxMs: 150 },
  { name: 'error', bitrate: '192k', build: error, minMs: 100, maxMs: 300 },
  { name: 'success', bitrate: '192k', build: success, minMs: 300, maxMs: 1000 },
  { name: 'notification', bitrate: '192k', build: notification, minMs: 200, maxMs: 500 },
  { name: 'ambient', bitrate: '192k', build: ambient, minMs: 30_000, maxMs: 60_000 },
];

// ---------------------------------------------------------------------------
// Encoding and verification
// ---------------------------------------------------------------------------

function quote(value) {
  return /[\s"]/.test(value) ? `"${String(value).replace(/"/g, '\\"')}"` : value;
}

function encodeMp3(samples, bitrate, destination) {
  const command = [
    'ffmpeg',
    '-hide_banner',
    '-loglevel',
    'error',
    '-y',
    '-f',
    's16le',
    '-ar',
    String(SAMPLE_RATE),
    '-ac',
    '1',
    '-i',
    '-',
    '-codec:a',
    'libmp3lame',
    '-b:a',
    bitrate,
    '-ar',
    String(SAMPLE_RATE),
    '-ac',
    '1',
    quote(destination),
  ].join(' ');

  execSync(command, {
    input: toInt16Le(samples),
    stdio: ['pipe', 'pipe', 'pipe'],
    maxBuffer: 64 * 1024 * 1024,
  });
}

/** Decode the written file back and report what it actually is. */
function probe(file) {
  const json = execSync(
    `ffprobe -v error -show_entries stream=codec_name,sample_rate,channels -show_entries format=duration,bit_rate -of json ${quote(file)}`,
    { encoding: 'utf8' }
  );
  const parsed = JSON.parse(json);
  const stream = parsed.streams?.[0] ?? {};
  return {
    codec: stream.codec_name,
    sampleRate: Number(stream.sample_rate),
    channels: Number(stream.channels),
    durationMs: Math.round(Number(parsed.format?.duration ?? 0) * 1000),
    bitRate: Number(parsed.format?.bit_rate ?? 0),
  };
}

/** Peak level of the decoded audio, per ffmpeg rather than our own arithmetic. */
function measuredPeakDbfs(file) {
  const output = execSync(`ffmpeg -hide_banner -i ${quote(file)} -af volumedetect -f null - 2>&1`, {
    encoding: 'utf8',
  });
  const match = /max_volume:\s*(-?[\d.]+) dB/.exec(output);
  if (!match) throw new Error(`could not measure peak for ${file}`);
  return Number(match[1]);
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const failures = [];
const rows = [];for (const category of CATEGORIES) {
  for (const theme of THEMES) {
    const builder = category.build[theme];
    if (!builder) throw new Error(`no ${category.name}.${theme} builder`);

    const samples = normalisePeak(builder());
    const destination = join(OUT_ROOT, category.name, `${theme}.mp3`);
    mkdirSync(dirname(destination), { recursive: true });

    // Always encode to a temp file first, so a normal run is idempotent (an
    // unchanged file is not rewritten) and --check is the same code path with
    // the write withheld.
    const staging = join(tmpdir(), `typeforge-sound-${category.name}-${theme}.mp3`);
    encodeMp3(samples, category.bitrate, staging);
    const fresh = readFileSync(staging);
    rmSync(staging, { force: true });

    const existing = statSync(destination, { throwIfNoEntry: false })
      ? readFileSync(destination)
      : null;

    let action;
    if (existing?.equals(fresh)) {
      action = 'unchanged';
    } else if (CHECK_ONLY) {
      action = 'DRIFT';
      failures.push(
        `${category.name}/${theme}.mp3 differs from a fresh generation — run: node scripts/generate-sounds.mjs`
      );
    } else {
      writeFileSync(destination, fresh);
      action = existing ? 'updated' : 'created';
    }

    const info = probe(destination);
    const peak = measuredPeakDbfs(destination);

    rows.push({
      file: `${category.name}/${theme}.mp3`,
      action,
      rate: info.sampleRate,
      ms: info.durationMs,
      kbps: Math.round(info.bitRate / 1000),
      peak,
      kb: Math.round(statSync(destination).size / 1024),
    });

    if (info.codec !== 'mp3') failures.push(`${destination}: codec is ${info.codec}, not mp3`);
    if (info.sampleRate !== SAMPLE_RATE) failures.push(`${destination}: ${info.sampleRate}Hz`);
    if (info.channels !== 1) failures.push(`${destination}: ${info.channels} channels`);
    if (info.durationMs < category.minMs || info.durationMs > category.maxMs) {
      failures.push(
        `${category.name}/${theme}.mp3 is ${info.durationMs}ms, spec is ${category.minMs}-${category.maxMs}ms`
      );
    }
    if (Math.abs(peak - PEAK_DBFS) > 0.6) {
      failures.push(`${category.name}/${theme}.mp3 peaks at ${peak}dB, want ${PEAK_DBFS}dB`);
    }
  }
}

// ---------------------------------------------------------------------------
// Cross-check the declared assets
//
// `packages/assets/src/sounds/index.ts` is what the application will request.
// Every path it names must exist, or the gap between "declared" and "shipped"
// reopens silently — which is exactly how these files came to be missing.
// ---------------------------------------------------------------------------

const soundsIndex = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../packages/assets/src/sounds/index.ts'
);
const STATIC_ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '../apps/web/static');

const declared = [
  ...new Set(
    [...readFileSync(soundsIndex, 'utf8').matchAll(/['"](\/assets\/sounds\/[^'"]+)['"]/g)].map(
      (match) => match[1]
    )
  ),
];
const declaredMissing = declared.filter((url) => {
  if (url.endsWith('/custom.mp3')) return false; // user-supplied slot
  return !statSync(join(STATIC_ROOT, url.replace(/^\//, '')), { throwIfNoEntry: false });
});
for (const url of declaredMissing) {
  failures.push(`${url} is declared in sounds/index.ts but no file exists for it`);
}

console.log(`\n${CHECK_ONLY ? 'checked' : 'generated'} ${rows.length} files in ${OUT_ROOT}\n`);
const table = [
  ['file', 'action', 'rate', 'ms', 'kbps', 'peak_dB', 'size_kB'],
  ...rows.map((row) => [row.file, row.action, row.rate, row.ms, row.kbps, row.peak, row.kb]),
];
console.log(
  table
    .map((line) => line.map((cell, i) => String(cell).padEnd(i === 0 ? 26 : 11)).join(''))
    .join('\n')
);

const customSlots = declared.filter((url) => url.endsWith('/custom.mp3'));
console.log(
  `\nDeclared in sounds/index.ts: ${declared.length} paths — ` +
    `${declared.length - customSlots.length - declaredMissing.length} resolve on disk, ` +
    `${customSlots.length} custom slots intentionally absent, ` +
    `${declaredMissing.length} missing`
);

if (failures.length > 0) {
  console.error(`\n${failures.length} problem(s):`);
  for (const failure of failures) console.error(`  - ${failure}`);
  process.exit(1);
}

console.log('\nAll files meet the spec in packages/assets/static/sounds/README.md');
console.log('Not generated (by design): */custom.mp3 — that slot is user-supplied.');
