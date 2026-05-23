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

type ScriptFamily =
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

const AMERICAS: Language[] = [
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
    nativeName: 'EspaÃ±ol',
    englishName: 'Spanish (Latin America)',
    region: 'Americas',
    script: 'Latin',
    keyboard: 'QWERTY (LA)',
    rtl: false,
    sampleText: 'El veloz murciÃ©lago hindÃº comÃ­a feliz cardillo y kiwi.',
  },
  {
    code: 'pt',
    nativeName: 'PortuguÃªs',
    englishName: 'Portuguese (Brazil)',
    region: 'Americas',
    script: 'Latin',
    keyboard: 'ABNT2',
    rtl: false,
    sampleText: 'Ã€ noite, vovÃ´ Kowalsky vÃª o Ã­mÃ£ cair junto ao junco.',
  },
];

const EUROPE: Language[] = [
  {
    code: 'de',
    nativeName: 'Deutsch',
    englishName: 'German',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTZ',
    rtl: false,
    sampleText: 'Falsches Ãœben von Xylophonmusik quÃ¤lt jeden grÃ¶ÃŸeren Zwerg.',
  },
  {
    code: 'fr',
    nativeName: 'FranÃ§ais',
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
    sampleText: 'PchnÄ…Ä‡ w tÄ™ Å‚Ã³dÅº jeÅ¼a lub oÅ›m skrzyÅ„ fig.',
  },
  {
    code: 'cs',
    nativeName: 'ÄŒeÅ¡tina',
    englishName: 'Czech',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTZ',
    rtl: false,
    sampleText: 'PÅ™Ã­liÅ¡ Å¾luÅ¥ouÄkÃ½ kÅ¯Åˆ ÃºpÄ›l ÄÃ¡belskÃ© kÃ³dy.',
  },
  {
    code: 'hu',
    nativeName: 'Magyar',
    englishName: 'Hungarian',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTZ',
    rtl: false,
    sampleText: 'ÃrvÃ­zi tÃ¶lgyÃ©rt bolygott sÃ­rkÃ¶vet dÃ¶ngetett.',
  },
  {
    code: 'el',
    nativeName: 'Î•Î»Î»Î·Î½Î¹ÎºÎ¬',
    englishName: 'Greek',
    region: 'Europe',
    script: 'Greek' as unknown as ScriptFamily,
    keyboard: 'Greek',
    rtl: false,
    sampleText: 'Î¤Î¿ Î»Î±Î³ÏŒÏ‚ ÎºÎ±Î¹ Î· Ï‡ÎµÎ»ÏŽÎ½Î± Î­Ï„ÏÎµÎ¾Î±Î½ Î³ÏÎ®Î³Î¿ÏÎ±.',
  },
  {
    code: 'sv',
    nativeName: 'Svenska',
    englishName: 'Swedish',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY (SE)',
    rtl: false,
    sampleText: 'GÃ¤dda prygelnÃ¤bba fyrskrift vÃ¤xer franskt.',
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
    sampleText: 'Quizdeltagerne spiste jordbÃ¦r med flÃ¸de mens cirkusklovnen.',
  },
  {
    code: 'fi',
    nativeName: 'Suomi',
    englishName: 'Finnish',
    region: 'Europe',
    script: 'Latin',
    keyboard: 'QWERTY (FI)',
    rtl: false,
    sampleText: 'FyrvÃ¤skÃ¤rjÃ¤yhtymÃ¤n takaa lÃ¶ytyy vanha virolainen sauna.',
  },
];

const MIDDLE_EAST_AFRICA: Language[] = [
  {
    code: 'ar',
    nativeName: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
    englishName: 'Arabic',
    region: 'Middle East & Africa',
    script: 'Arabic',
    keyboard: 'Arabic',
    rtl: true,
    sampleText: 'Ù†Øµ Ø­ÙƒÙŠÙ… Ù„Ù‡ Ø³Ø±Ø¹Ø§Ù† ØªØ³Ø±ÙŠ Ø¨Ù‡ï¼Œå°±åƒæ˜¯ç‡ƒç¯é±¼.',
  },
  {
    code: 'he',
    nativeName: '×¢×‘×¨×™×ª',
    englishName: 'Hebrew',
    region: 'Middle East & Africa',
    script: 'Hebrew',
    keyboard: 'Hebrew',
    rtl: true,
    sampleText: '××™×š ×‘×œ×©×•×Ÿ ×”×§×•×“×©, ×¡×¤×¨ ×¦×œ×—×ª ×¤×¡×™×§',
  },
  {
    code: 'sw',
    nativeName: 'Kiswahili',
    englishName: 'Swahili',
    region: 'Middle East & Africa',
    script: 'Latin',
    keyboard: 'QWERTY',
    rtl: false,
    sampleText: 'Fisi wa jua huamka mapema kula nyama.',
  },
];

const EAST_ASIA: Language[] = [
  {
    code: 'ja',
    nativeName: 'æ—¥æœ¬èªž',
    englishName: 'Japanese',
    region: 'East Asia',
    script: 'CJK',
    keyboard: 'Romaji + Kana',
    rtl: false,
    sampleText: 'ã„ã‚ã¯ã«ã»ã¸ã¨ã¡ã‚Šã¬ã‚‹ã‚’ ã‚ã‹ã‚ˆãŸã‚Œãã¤ã­ãªã‚‰ã‚€',
  },
  {
    code: 'zh',
    nativeName: 'ç®€ä½“ä¸­æ–‡',
    englishName: 'Chinese (Mandarin)',
    region: 'East Asia',
    script: 'CJK',
    keyboard: 'Pinyin',
    rtl: false,
    sampleText: 'å¤©åœ°çŽ„é»„ï¼Œå®‡å®™æ´ªè’ã€‚æ—¥æœˆç›ˆæ˜ƒï¼Œè¾°å®¿åˆ—å¼ ã€‚',
  },
  {
    code: 'ko',
    nativeName: 'í•œêµ­ì–´',
    englishName: 'Korean',
    region: 'East Asia',
    script: 'Korean',
    keyboard: 'Dubeolsik',
    rtl: false,
    sampleText: 'ë‹¤ëžŒì¥ í—Œ ì³‡ë°”í€´ì— íƒ€ê³ íŒŒ.',
  },
];

const SOUTH_SOUTHEAST_ASIA: Language[] = [
  {
    code: 'hi',
    nativeName: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€',
    englishName: 'Hindi',
    region: 'South & Southeast Asia',
    script: 'Devanagari',
    keyboard: 'QWERTY (IN)',
    rtl: false,
    sampleText: 'à¤• à¤– à¤— à¤˜ à¤™ à¤š à¤› à¤œ à¤ à¤ž à¤Ÿ à¤  à¤¡ à¤¢ à¤£ à¤¤ à¤¥ à¤¦ à¤§ à¤¨ à¤ª à¤« à¤¬ à¤­ à¤® à¤¯ à¤° à¤² à¤µ à¤¶ à¤· à¤¸ à¤¹',
  },
  {
    code: 'th',
    nativeName: 'à¹„à¸—à¸¢',
    englishName: 'Thai',
    region: 'South & Southeast Asia',
    script: 'Thai',
    keyboard: 'Kedmanee',
    rtl: false,
    sampleText: 'à¸à¸µà¸¬à¸²à¸§à¸´à¹ˆà¸‡à¹€à¸£à¹‡à¸§à¸ªà¸¸à¸”à¹ƒà¸™à¸‡à¸²à¸™à¹à¸‚à¹ˆà¸‡à¸‚à¸±à¸™à¸£à¸°à¸”à¸±à¸šà¸™à¸²à¸™à¸²à¸Šà¸²à¸•à¸´',
  },
  {
    code: 'vi',
    nativeName: 'Tiáº¿ng Viá»‡t',
    englishName: 'Vietnamese',
    region: 'South & Southeast Asia',
    script: 'Latin',
    keyboard: 'Telex / VNI',
    rtl: false,
    sampleText: 'Con gÃ  trá»‘n Ä‘áº¹p trai bay qua vá»‹nh Háº¡ Long.',
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

const CENTRAL_EASTERN_EUROPE: Language[] = [
  {
    code: 'ru',
    nativeName: 'Ð ÑƒÑÑÐºÐ¸Ð¹',
    englishName: 'Russian',
    region: 'Central & Eastern Europe',
    script: 'Cyrillic',
    keyboard: 'Ð™Ð¦Ð£ÐšÐ•Ð',
    rtl: false,
    sampleText: 'Ð­Ð¹, Ð¶Ð»Ð¾Ð±! Ð“Ð´Ðµ Ñ‚ÑƒÐ·? ÐŸÑ€ÑÑ‡ÑŒ ÑŽÐ½Ñ‹Ñ… ÑÑŠÑ‘Ð¼Ð½Ñ‹Ñ….',
  },
  {
    code: 'uk',
    nativeName: 'Ð£ÐºÑ€Ð°Ñ—Ð½ÑÑŒÐºÐ°',
    englishName: 'Ukrainian',
    region: 'Central & Eastern Europe',
    script: 'Cyrillic',
    keyboard: 'Ð™Ð¦Ð£ÐšÐ•Ð',
    rtl: false,
    sampleText: "Ð•Ð¹, Ð±Ð°Ñ€ÑÑƒ! Ð‘Ð»Ð¸ÑÐºÐ°Ð²Ð¸Ñ‡Ð½Ð¾ Ñ…Ð¾Ð²Ð°Ð¹ ÑŽÐ½Ð¸Ñ… Ð¾Ð»ÐµÐ½ÑÑ‚.",
  },
  {
    code: 'tr',
    nativeName: 'TÃ¼rkÃ§e',
    englishName: 'Turkish',
    region: 'Central & Eastern Europe',
    script: 'Latin',
    keyboard: 'QWERTY (TR)',
    rtl: false,
    sampleText: 'Vakif bank fÄ±rtÄ±nasÄ±, mahsur kaldÄ±klarÄ± gemiyi yuttu.',
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
