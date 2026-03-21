/**
 * TypeForge Language Registry
 * 29 languages organized by region, with native script rendering
 */

export type Region =
  | 'Americas'
  | 'Europe'
  | 'Middle East & Africa'
  | 'East Asia'
  | 'South & Southeast Asia'
  | 'Central & Eastern Europe';

export type ScriptFamily =
  | 'Latin'
  | 'Arabic'
  | 'Hebrew'
  | 'Cyrillic'
  | 'CJK'
  | 'Thai'
  | 'Korean'
  | 'Devanagari';

export interface Language {
  code: string;
  nativeName: string;
  englishName: string;
  region: Region;
  script: ScriptFamily;
  keyboard: string;
  rtl: boolean;
  sampleText: string;
}

export const AMERICAS: Language[] = [
  {
    code: 'en',
    nativeName: 'English',
    englishName: 'English (US)',
    region: 'Americas',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: 'The quick brown fox jumps over the lazy dog.',
  },
  {
    code: 'es',
    nativeName: 'Español',
    englishName: 'Spanish (Latin America)',
    region: 'Americas',
    script: 'Latin',
    keyboard: 'QWERTY (LA)',
    rtl: false,
    sampleText: 'El veloz murciélago hindú comía feliz cardillo y kiwi.',
  },
  {
    code: 'pt',
    nativeName: 'Português',
    englishName: 'Portuguese (Brazil)',
    region: 'Americas',
    script: 'Latin',
    keyboard: 'ABNT2',
    rtl: false,
    sampleText: 'À noite, vovô Kowalsky vê o ímã cair junto ao junco.',
  },
];

export const EUROPE: Language[] = [
  {
    code: 'de',
    nativeName: 'Deutsch',
    englishName: 'German',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTZ',
    rtl: false,
    sampleText: 'Falsches Üben von Xylophonmusik quält jeden größeren Zwerg.',
  },
  {
    code: 'fr',
    nativeName: 'Français',
    englishName: 'French',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'AZERTY',
    rtl: false,
    sampleText: "Portez ce vieux whisky au juge blond qui fume.",
  },
  {
    code: 'it',
    nativeName: 'Italiano',
    englishName: 'Italian',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: "Ma la volpe, con il suo balzo, raggiunse il quieto fiume.",
  },
  {
    code: 'nl',
    nativeName: 'Nederlands',
    englishName: 'Dutch',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: "Pa's wijsje: fox lyophiliseert glad jodiumacetylide.",
  },
  {
    code: 'pl',
    nativeName: 'Polski',
    englishName: 'Polish',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY (PL)',
    rtl: false,
    sampleText: 'Pchnąć w tę łódź jeża lub ośm skrzyń fig.',
  },
  {
    code: 'cs',
    nativeName: 'Čeština',
    englishName: 'Czech',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTZ',
    rtl: false,
    sampleText: 'Příliš žluťoučký kůň úpěl ďábelské kódy.',
  },
  {
    code: 'hu',
    nativeName: 'Magyar',
    englishName: 'Hungarian',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTZ',
    rtl: false,
    sampleText: 'Árvízi tölgyért bolygott sírkövet döngetett.',
  },
  {
    code: 'el',
    nativeName: 'Ελληνικά',
    englishName: 'Greek',
    region: 'Europe',
    script: 'Greek' as unknown as ScriptFamily,
    keyboard: 'Greek',
    rtl: false,
    sampleText: 'Το λαγός και η χελώνα έτρεξαν γρήγορα.',
  },
  {
    code: 'sv',
    nativeName: 'Svenska',
    englishName: 'Swedish',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY (SE)',
    rtl: false,
    sampleText: 'Gädda prygelnäbba fyrskrift växer franskt.',
  },
  {
    code: 'no',
    nativeName: 'Norsk',
    englishName: 'Norwegian',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: 'Kjevveisk mot tre, eg snur og vinker til hunden.',
  },
  {
    code: 'da',
    nativeName: 'Dansk',
    englishName: 'Danish',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY (DK)',
    rtl: false,
    sampleText: 'Quizdeltagerne spiste jordbær med fløde mens cirkusklovnen.',
  },
  {
    code: 'fi',
    nativeName: 'Suomi',
    englishName: 'Finnish',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY (FI)',
    rtl: false,
    sampleText: 'Fyrväskärjäyhtymän takaa löytyy vanha virolainen sauna.',
  },
];

export const MIDDLE_EAST_AFRICA: Language[] = [
  {
    code: 'ar',
    nativeName: 'العربية',
    englishName: 'Arabic',
    region: 'Middle East & Africa',
    script: 'Arabic',
    keyboard: 'Arabic',
    rtl: true,
    sampleText: 'نص حكيم له سرعان تسري به，就像是燃灯鱼.',
  },
  {
    code: 'he',
    nativeName: 'עברית',
    englishName: 'Hebrew',
    region: 'Middle East & Africa',
    script: 'Hebrew',
    keyboard: 'Hebrew',
    rtl: true,
    sampleText: 'איך בלשון הקודש, ספר צלחת פסיק',
  },
];

export const EAST_ASIA: Language[] = [
  {
    code: 'ja',
    nativeName: '日本語',
    englishName: 'Japanese',
    region: 'East Asia',
    script: 'CJK',
    keyboard: 'Romaji + Kana',
    rtl: false,
    sampleText: 'いろはにほへとちりぬるを わかよたれそつねならむ',
  },
  {
    code: 'zh',
    nativeName: '简体中文',
    englishName: 'Chinese (Mandarin)',
    region: 'East Asia',
    script: 'CJK',
    keyboard: 'Pinyin',
    rtl: false,
    sampleText: '天地玄黄，宇宙洪荒。日月盈昃，辰宿列张。',
  },
  {
    code: 'ko',
    nativeName: '한국어',
    englishName: 'Korean',
    region: 'East Asia',
    script: 'Korean',
    keyboard: 'Dubeolsik',
    rtl: false,
    sampleText: '다람쥐 헌 쳇바퀴에 타고파.',
  },
];

export const SOUTH_SOUTHEAST_ASIA: Language[] = [
  {
    code: 'hi',
    nativeName: 'हिन्दी',
    englishName: 'Hindi',
    region: 'South & Southeast Asia',
    script: 'Devanagari',
    keyboard: 'QWERTY (IN)',
    rtl: false,
    sampleText: 'क ख ग घ ङ च छ ज झ ञ ट ठ ड ढ ण त थ द ध न प फ ब भ म य र ल व श ष स ह',
  },
  {
    code: 'th',
    nativeName: 'ไทย',
    englishName: 'Thai',
    region: 'South & Southeast Asia',
    script: 'Thai',
    keyboard: 'Kedmanee',
    rtl: false,
    sampleText: 'กีฬาวิ่งเร็วสุดในงานแข่งขันระดับนานาชาติ',
  },
  {
    code: 'vi',
    nativeName: 'Tiếng Việt',
    englishName: 'Vietnamese',
    region: 'South & Southeast Asia',
    script: 'Latin',
    keyboard: 'Telex / VNI',
    rtl: false,
    sampleText: 'Con gà trốn đẹp trai bay qua vịnh Hạ Long.',
  },
  {
    code: 'id',
    nativeName: 'Indonesia',
    englishName: 'Indonesian',
    region: 'South & Southeast Asia',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: 'MuhammadJKataquez fox bermimpi stimieg dengan wajar.',
  },
  {
    code: 'ms',
    nativeName: 'Bahasa Melayu',
    englishName: 'Malay',
    region: 'South & Southeast Asia',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: 'Lebuh rayanya berliku-liku di antara pokok hujan.',
  },
  {
    code: 'tl',
    nativeName: 'Tagalog',
    englishName: 'Tagalog',
    region: 'South & Southeast Asia',
    script: 'Latin',
    keyboard: 'QWERTY (PH)',
    rtl: false,
    sampleText: 'Ang magandang paruparo ay lumilipad sa halamanan.',
  },
];

export const CENTRAL_EASTERN_EUROPE: Language[] = [
  {
    code: 'ru',
    nativeName: 'Русский',
    englishName: 'Russian',
    region: 'Central & Eastern Europe',
    script: 'Cyrillic',
    keyboard: 'ЙЦУКЕН',
    rtl: false,
    sampleText: 'Эй, жлоб! Где туз? Прячь юных съёмных.',
  },
  {
    code: 'uk',
    nativeName: 'Українська',
    englishName: 'Ukrainian',
    region: 'Central & Eastern Europe',
    script: 'Cyrillic',
    keyboard: 'ЙЦУКЕН',
    rtl: false,
    sampleText: "Ей, барсу! Блискавично ховай юних оленят.",
  },
  {
    code: 'tr',
    nativeName: 'Türkçe',
    englishName: 'Turkish',
    region: 'Central & Eastern Europe',
    script: 'Latin',
    keyboard: 'QWERTY (TR)',
    rtl: false,
    sampleText: 'Vakif bank fırtınası, mahsur kaldıkları gemiyi yuttu.',
  },
];

export const ALL_LANGUAGES: Language[] = [
  ...AMERICAS,
  ...EUROPE,
  ...MIDDLE_EAST_AFRICA,
  ...EAST_ASIA,
  ...SOUTH_SOUTHEAST_ASIA,
  ...CENTRAL_EASTERN_EUROPE,
];

export const RTL_LANGUAGES = ALL_LANGUAGES.filter((l) => l.rtl);

export const REGIONS: Region[] = [
  'Americas',
  'Europe',
  'Middle East & Africa',
  'East Asia',
  'South & Southeast Asia',
  'Central & Eastern Europe',
];

export function getLanguagesByRegion(region: Region): Language[] {
  switch (region) {
    case 'Americas': return AMERICAS;
    case 'Europe': return EUROPE;
    case 'Middle East & Africa': return MIDDLE_EAST_AFRICA;
    case 'East Asia': return EAST_ASIA;
    case 'South & Southeast Asia': return SOUTH_SOUTHEAST_ASIA;
    case 'Central & Eastern Europe': return CENTRAL_EASTERN_EUROPE;
  }
}

export function getLanguageByCode(code: string): Language | undefined {
  return ALL_LANGUAGES.find((l) => l.code === code);
}

export const SCRIPT_GROUPS = [
  { name: 'Latin', samples: ['Aa', 'Mm', 'Rr'], color: '#ffc56c' },
  { name: 'Arabic', samples: ['أب', 'تث'], color: '#41e4c0', rtl: true },
  { name: 'Cyrillic', samples: ['Аа', 'Мм'], color: '#ffb4ab' },
  { name: 'CJK', samples: ['中文', '日本語'], color: '#ffc56c' },
  { name: 'Hebrew', samples: ['אב', 'גד'], color: '#41e4c0', rtl: true },
  { name: 'Thai', samples: ['กา', 'ไทย'], color: '#ffb4ab' },
  { name: 'Korean', samples: ['한글', '한국어'], color: '#ffc56c' },
  { name: 'Devanagari', samples: ['हिन', 'हिन्दी'], color: '#41e4c0' },
];
