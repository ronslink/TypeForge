/**
 * TypeForge UI Locale Store
 *
 * Single source of truth for the active UI language.
 * - Reads from user DB preference (authenticated) or localStorage (anonymous)
 * - Org members inherit the org's default if they haven't set a personal override
 * - Provides a reactive `t(key, params?)` function via a Svelte derived store
 */

import { browser } from '$app/environment';
import { writable, derived } from 'svelte/store';

// â”€â”€ Message imports â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
// Bundled at build time â€” small JSON files (~5 KB each), tree-shakeable later
// when migrating to full Paraglide codegen.
import en from '../../../messages/en.json';
import es from '../../../messages/es.json';
import fr from '../../../messages/fr.json';
import de from '../../../messages/de.json';
import pt from '../../../messages/pt.json';
import ja from '../../../messages/ja.json';
import ko from '../../../messages/ko.json';
import zh from '../../../messages/zh.json';
import ar from '../../../messages/ar.json';
import hi from '../../../messages/hi.json';
import tr from '../../../messages/tr.json';
import it from '../../../messages/it.json';
import ru from '../../../messages/ru.json';

// â”€â”€ Types â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const SUPPORTED = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'it', 'ru'] as const;
export type UiLocale = (typeof SUPPORTED)[number];

type Messages = typeof en;
type MessageKey = keyof Messages;

const MESSAGES: Record<UiLocale, Partial<Messages>> = { en, es, fr, de, pt, ja, ko, zh, ar, hi, tr, it, ru } as any;

export const UI_LOCALES: { code: UiLocale; nativeName: string; englishName: string }[] = [
  { code: 'en', nativeName: 'English',   englishName: 'English'    },
  { code: 'es', nativeName: 'EspaÃ±ol',   englishName: 'Spanish'    },
  { code: 'fr', nativeName: 'FranÃ§ais',  englishName: 'French'     },
  { code: 'de', nativeName: 'Deutsch',   englishName: 'German'     },
  { code: 'pt', nativeName: 'PortuguÃªs', englishName: 'Portuguese' },
  { code: 'ja', nativeName: 'æ—¥æœ¬èªž',    englishName: 'Japanese'   },
  { code: 'ko', nativeName: 'í•œêµ­ì–´',    englishName: 'Korean'     },
  { code: 'zh', nativeName: 'ä¸­æ–‡',      englishName: 'Chinese'    },
  { code: 'ar', nativeName: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',   englishName: 'Arabic'     },
  { code: 'hi', nativeName: 'à¤¹à¤¿à¤¨à¥à¤¦à¥€',    englishName: 'Hindi'      },
  { code: 'tr', nativeName: 'TÃ¼rkÃ§e',    englishName: 'Turkish'    },
  { code: 'it', nativeName: 'Italiano',  englishName: 'Italian'    },
  { code: 'ru', nativeName: 'Ð ÑƒÑÑÐºÐ¸Ð¹',   englishName: 'Russian'    },
];

// â”€â”€ Core writable store â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
const STORAGE_KEY = 'tf_ui_locale';

function isSupported(code: string): code is UiLocale {
  return SUPPORTED.includes(code as UiLocale);
}

/** The active UI locale â€” reactive Svelte store. */
export const uiLocale = writable<UiLocale>('en');

// â”€â”€ Reactive translation function â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
/**
 * `$t` â€” reactive translation derived store.
 *
 * Usage in Svelte templates:
 *   import { t } from '$lib/stores/locale';
 *   <h1>{$t('learn_heading')}</h1>
 *   <p>{$t('learn_modules_conquered', { completed: 3, total: 10 })}</p>
 */
export const t = derived(uiLocale, ($locale) => {
  const msgs = MESSAGES[$locale] ?? MESSAGES.en;

  return function translate(
    key: MessageKey | string,
    params?: Record<string, string | number>
  ): string {
    let msg: string = (msgs as Record<string, string>)[key]
      ?? (en as Record<string, string>)[key]
      ?? key;

    if (params) {
      for (const [k, v] of Object.entries(params)) {
        msg = msg.replaceAll(`{${k}}`, String(v));
      }
    }
    return msg;
  };
});

// â”€â”€ Locale management â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

/** Read persisted locale from localStorage (browser only). */
export function getPersistedLocale(): UiLocale {
  if (!browser) return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSupported(stored)) return stored;
  } catch { /* ignore */ }
  // Fall back to browser language matching
  for (const lang of navigator.languages ?? []) {
    const code = lang.split('-')[0]!.toLowerCase();
    if (isSupported(code)) return code;
  }
  return 'en';
}

/** Apply a locale: updates the store, localStorage, and <html lang>. */
export function setUiLocale(code: UiLocale) {
  uiLocale.set(code);
  if (!browser) return;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  document.documentElement.lang = code;
}

/**
 * Initialise locale on app boot.
 * Priority: DB personal â†’ org default â†’ localStorage â†’ browser language â†’ 'en'
 */
export function initLocale(
  dbLocale: string | null = null,
  orgLocale: string | null = null
): UiLocale {
  let resolved: UiLocale = 'en';

  if (dbLocale && isSupported(dbLocale)) {
    // Personal DB preference â€” highest priority
    resolved = dbLocale;
  } else if (orgLocale && isSupported(orgLocale) && !localStorage.getItem(STORAGE_KEY)) {
    // Org default â€” only when no personal override stored
    resolved = orgLocale;
  } else {
    resolved = getPersistedLocale();
  }

  setUiLocale(resolved);
  return resolved;
}

/**
 * Persist the locale to the user's DB profile via PATCH /users/me/locale.
 * Fire-and-forget â€” non-critical.
 */
export async function saveLocaleToApi(code: UiLocale, token: string | null) {
  if (!token) return;
  try {
    await fetch('/api/v1/users/me/locale', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ locale: code }),
    });
  } catch { /* ignore */ }
}
