export const SUPPORTED_UI_LOCALES = [
  'en',
  'es',
  'fr',
  'de',
  'pt',
  'ja',
  'ko',
  'zh',
  'ar',
  'hi',
  'tr',
  'it',
  'ru',
  'id',
  'vi',
  'pl',
] as const;

export type UiLocale = (typeof SUPPORTED_UI_LOCALES)[number];

export const UI_LOCALES: { code: UiLocale; nativeName: string; englishName: string }[] = [
  { code: 'en', nativeName: 'English', englishName: 'English' },
  { code: 'es', nativeName: 'Español', englishName: 'Spanish' },
  { code: 'fr', nativeName: 'Français', englishName: 'French' },
  { code: 'de', nativeName: 'Deutsch', englishName: 'German' },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'ja', nativeName: '日本語', englishName: 'Japanese' },
  { code: 'ko', nativeName: '한국어', englishName: 'Korean' },
  { code: 'zh', nativeName: '中文', englishName: 'Chinese' },
  { code: 'ar', nativeName: 'العربية', englishName: 'Arabic' },
  { code: 'hi', nativeName: 'हिन्दी', englishName: 'Hindi' },
  { code: 'tr', nativeName: 'Türkçe', englishName: 'Turkish' },
  { code: 'it', nativeName: 'Italiano', englishName: 'Italian' },
  { code: 'ru', nativeName: 'Русский', englishName: 'Russian' },
  { code: 'id', nativeName: 'Bahasa Indonesia', englishName: 'Indonesian' },
  { code: 'vi', nativeName: 'Tiếng Việt', englishName: 'Vietnamese' },
  { code: 'pl', nativeName: 'Polski', englishName: 'Polish' },
];

const RTL_UI_LOCALES = new Set<UiLocale>(['ar']);

export function isUiLocale(code: string): code is UiLocale {
  return SUPPORTED_UI_LOCALES.includes(code as UiLocale);
}

export function isRtlUiLocale(code: string): boolean {
  return isUiLocale(code) && RTL_UI_LOCALES.has(code);
}
