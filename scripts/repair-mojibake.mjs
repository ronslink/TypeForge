import { readdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const WRITE = process.argv.includes('--write');
const CHECK = process.argv.includes('--check');
const ROOTS = ['apps', 'packages'];
const TEXT_EXTENSIONS = new Set(['.css', '.html', '.js', '.json', '.md', '.mjs', '.svelte', '.ts']);
const SKIPPED_DIRECTORIES = new Set([
  '.git',
  '.svelte-kit',
  '.turbo',
  '.vercel',
  'coverage',
  'dist',
  'node_modules',
]);

const windows1252 = new TextDecoder('windows-1252');
const utf8 = new TextDecoder('utf-8', { fatal: true });
const byteByCharacter = new Map();

for (let byte = 0; byte <= 0xff; byte += 1) {
  const character = windows1252.decode(Uint8Array.of(byte));
  byteByCharacter.set(character, byte);
}

const windows1252Punctuation = {
  0x80: '€', 0x82: '‚', 0x83: 'ƒ', 0x84: '„', 0x85: '…', 0x86: '†', 0x87: '‡',
  0x88: 'ˆ', 0x89: '‰', 0x8a: 'Š', 0x8b: '‹', 0x8c: 'Œ', 0x8e: 'Ž', 0x91: '‘',
  0x92: '’', 0x93: '“', 0x94: '”', 0x95: '•', 0x96: '–', 0x97: '—', 0x98: '˜',
  0x99: '™', 0x9a: 'š', 0x9b: '›', 0x9c: 'œ', 0x9e: 'ž', 0x9f: 'Ÿ',
};

for (const [byte, character] of Object.entries(windows1252Punctuation)) {
  byteByCharacter.set(character, Number(byte));
}

// Some source files preserve undefined Windows-1252 bytes as C1 controls.
for (const byte of [0x81, 0x8d, 0x8f, 0x90, 0x9d]) {
  byteByCharacter.set(String.fromCodePoint(byte), byte);
}

function expectedUtf8Length(firstByte) {
  if (firstByte >= 0xc2 && firstByte <= 0xdf) return 2;
  if (firstByte >= 0xe0 && firstByte <= 0xef) return 3;
  if (firstByte >= 0xf0 && firstByte <= 0xf4) return 4;
  return 0;
}

function repairOnePass(input) {
  const characters = Array.from(input);
  let output = '';
  let replacements = 0;

  for (let index = 0; index < characters.length;) {
    const firstByte = byteByCharacter.get(characters[index]);
    const length = expectedUtf8Length(firstByte);

    if (length > 0 && index + length <= characters.length) {
      const bytes = [];
      let valid = true;

      for (let offset = 0; offset < length; offset += 1) {
        const byte = byteByCharacter.get(characters[index + offset]);
        if (byte === undefined || (offset > 0 && (byte < 0x80 || byte > 0xbf))) {
          valid = false;
          break;
        }
        bytes.push(byte);
      }

      if (valid) {
        try {
          const decoded = utf8.decode(Uint8Array.from(bytes));
          output += decoded;
          replacements += 1;
          index += length;
          continue;
        } catch {
          // Leave invalid byte sequences untouched.
        }
      }
    }

    output += characters[index];
    index += 1;
  }

  return { output, replacements };
}

function repair(input) {
  let output = input;
  let replacements = 0;

  for (let pass = 0; pass < 3; pass += 1) {
    const result = repairOnePass(output);
    output = result.output;
    replacements += result.replacements;
    if (result.replacements === 0) break;
  }

  return { output, replacements };
}

async function* filesUnder(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    if (SKIPPED_DIRECTORIES.has(entry.name)) continue;
    const filePath = path.join(directory, entry.name);
    if (entry.isDirectory()) yield* filesUnder(filePath);
    else if (entry.isFile() && TEXT_EXTENSIONS.has(path.extname(entry.name))) yield filePath;
  }
}

const changes = [];

for (const root of ROOTS) {
  for await (const filePath of filesUnder(root)) {
    const input = await readFile(filePath, 'utf8');
    const { output, replacements } = repair(input);
    if (output === input) continue;

    changes.push({ filePath, replacements });
    if (WRITE) await writeFile(filePath, output, 'utf8');
  }
}

for (const { filePath, replacements } of changes) {
  console.log(`${WRITE ? 'repaired' : 'would repair'} ${filePath} (${replacements})`);
}

console.log(`${changes.length} file(s) ${WRITE ? 'repaired' : 'need repair'}.`);
if (CHECK && changes.length > 0) process.exitCode = 1;
