/**
 * Text normalisation and grapheme segmentation used by committed-text scoring.
 *
 * `Intl.Segmenter` is the authoritative implementation when it is available.
 * The fallback is intentionally conservative: it keeps common combining,
 * Indic-conjunct, emoji-ZWJ, regional-indicator and Hangul sequences together
 * rather than reverting to UTF-16 or code-point splitting.
 */

export const TEXT_NORMALIZATION_VERSION = 'normalization-v1' as const;
export const GRAPHEME_SEGMENTATION_VERSION = 'grapheme-v1' as const;

export type NormalizationPolicy = 'NFC' | 'none';

export interface GraphemeSegmentOptions {
  normalization?: NormalizationPolicy;
  locale?: string;
  /** Exercise the deterministic fallback in tests and constrained runtimes. */
  forceFallback?: boolean;
}

interface SegmenterLike {
  segment(input: string): Iterable<{ segment: string }>;
}

interface SegmenterConstructor {
  new (locale?: string, options?: { granularity: 'grapheme' }): SegmenterLike;
}

const markPattern = /^\p{M}$/u;

export function normalizeText(text: string, policy: NormalizationPolicy = 'NFC'): string {
  return policy === 'NFC' ? text.normalize('NFC') : text;
}

function codePoint(character: string): number {
  return character.codePointAt(0) ?? 0;
}

function isMark(character: string): boolean {
  return markPattern.test(character);
}

function isVariationSelector(value: number): boolean {
  return (value >= 0xfe00 && value <= 0xfe0f) || (value >= 0xe0100 && value <= 0xe01ef);
}

function isEmojiModifier(value: number): boolean {
  return value >= 0x1f3fb && value <= 0x1f3ff;
}

function isEmojiTag(value: number): boolean {
  return value >= 0xe0020 && value <= 0xe007f;
}

function isExtend(character: string): boolean {
  const value = codePoint(character);
  return isMark(character) || isVariationSelector(value) || isEmojiModifier(value) || isEmojiTag(value);
}

function isRegionalIndicator(character: string): boolean {
  const value = codePoint(character);
  return value >= 0x1f1e6 && value <= 0x1f1ff;
}

function isControl(character: string): boolean {
  const value = codePoint(character);
  return (
    value === 0x000a ||
    value === 0x000d ||
    (value >= 0x0000 && value <= 0x001f) ||
    (value >= 0x007f && value <= 0x009f)
  );
}

type HangulType = 'L' | 'V' | 'T' | 'LV' | 'LVT' | null;

function hangulType(character: string): HangulType {
  const value = codePoint(character);
  if ((value >= 0x1100 && value <= 0x115f) || (value >= 0xa960 && value <= 0xa97c)) {
    return 'L';
  }
  if ((value >= 0x1160 && value <= 0x11a7) || (value >= 0xd7b0 && value <= 0xd7c6)) {
    return 'V';
  }
  if ((value >= 0x11a8 && value <= 0x11ff) || (value >= 0xd7cb && value <= 0xd7fb)) {
    return 'T';
  }
  if (value >= 0xac00 && value <= 0xd7a3) {
    return (value - 0xac00) % 28 === 0 ? 'LV' : 'LVT';
  }
  return null;
}

function joinsHangul(previous: string, current: string): boolean {
  const previousType = hangulType(previous);
  const currentType = hangulType(current);
  return (
    (previousType === 'L' &&
      (currentType === 'L' || currentType === 'V' || currentType === 'LV' || currentType === 'LVT')) ||
    ((previousType === 'LV' || previousType === 'V') &&
      (currentType === 'V' || currentType === 'T')) ||
    ((previousType === 'LVT' || previousType === 'T') && currentType === 'T')
  );
}

const indicLinkers = new Set([
  0x094d, 0x09cd, 0x0a4d, 0x0acd, 0x0b4d, 0x0bcd, 0x0c4d, 0x0ccd, 0x0d3b,
  0x0d3c, 0x0d4d, 0x0dca, 0x1039, 0x103a, 0x1714, 0x1734, 0x17d2, 0x1a60,
  0x1b44, 0xa9c0, 0xaaf6, 0x10a3f, 0x11046, 0x11133, 0x1134d,
]);

function clusterEndsWithLinker(cluster: string): boolean {
  const characters = Array.from(cluster);
  for (let index = characters.length - 1; index >= 0; index -= 1) {
    const character = characters[index];
    if (character === undefined) continue;
    const value = codePoint(character);
    if (value === 0x200d || isExtend(character)) {
      if (indicLinkers.has(value)) return true;
      continue;
    }
    return indicLinkers.has(value);
  }
  return false;
}

/**
 * A deterministic fallback for environments without `Intl.Segmenter`.
 * It is not advertised as a complete replacement for the current Unicode
 * grapheme algorithm, so platform qualification must still require Segmenter.
 */
export function segmentGraphemesFallback(text: string): string[] {
  const characters = Array.from(text);
  const clusters: string[] = [];
  let regionalIndicatorCount = 0;

  for (const character of characters) {
    const previousCluster = clusters.at(-1);
    if (previousCluster === undefined) {
      clusters.push(character);
      regionalIndicatorCount = isRegionalIndicator(character) ? 1 : 0;
      continue;
    }

    const previousCharacter = Array.from(previousCluster).at(-1) ?? '';
    const isCrLf = previousCharacter === '\r' && character === '\n';
    const joinsPrevious =
      isCrLf ||
      (!isControl(previousCharacter) &&
        !isControl(character) &&
        (isExtend(character) ||
          character === '\u200d' ||
          previousCharacter === '\u200d' ||
          clusterEndsWithLinker(previousCluster) ||
          joinsHangul(previousCharacter, character) ||
          (isRegionalIndicator(previousCharacter) &&
            isRegionalIndicator(character) &&
            regionalIndicatorCount % 2 === 1)));

    if (joinsPrevious) {
      clusters[clusters.length - 1] = `${previousCluster}${character}`;
    } else {
      clusters.push(character);
    }

    regionalIndicatorCount = isRegionalIndicator(character)
      ? isRegionalIndicator(previousCharacter)
        ? regionalIndicatorCount + 1
        : 1
      : 0;
  }

  return clusters;
}

export function segmentGraphemes(text: string, options: GraphemeSegmentOptions = {}): string[] {
  const normalized = normalizeText(text, options.normalization);
  const segmenterConstructor =
    typeof Intl === 'undefined'
      ? undefined
      : (Intl as typeof Intl & { Segmenter?: SegmenterConstructor }).Segmenter;

  if (!options.forceFallback && segmenterConstructor !== undefined) {
    const segmenter = new segmenterConstructor(options.locale, { granularity: 'grapheme' });
    return Array.from(segmenter.segment(normalized), ({ segment }) => segment);
  }

  return segmentGraphemesFallback(normalized);
}
