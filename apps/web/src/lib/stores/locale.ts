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

// ── Message imports ──────────────────────────────────────────────────────────
// Bundled at build time — small JSON files (~5 KB each), tree-shakeable later
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

// ── Types ────────────────────────────────────────────────────────────────────
const SUPPORTED = ['en', 'es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'it', 'ru'] as const;
export type UiLocale = (typeof SUPPORTED)[number];

type Messages = typeof en;
type MessageKey = keyof Messages;

const MESSAGES: Record<UiLocale, Partial<Messages>> = { en, es, fr, de, pt, ja, ko, zh, ar, hi, tr, it, ru } as any;

export const UI_LOCALES: { code: UiLocale; nativeName: string; englishName: string }[] = [
  { code: 'en', nativeName: 'English',   englishName: 'English'    },
  { code: 'es', nativeName: 'Español',   englishName: 'Spanish'    },
  { code: 'fr', nativeName: 'Français',  englishName: 'French'     },
  { code: 'de', nativeName: 'Deutsch',   englishName: 'German'     },
  { code: 'pt', nativeName: 'Português', englishName: 'Portuguese' },
  { code: 'ja', nativeName: '日本語',    englishName: 'Japanese'   },
  { code: 'ko', nativeName: '한국어',    englishName: 'Korean'     },
  { code: 'zh', nativeName: '中文',      englishName: 'Chinese'    },
  { code: 'ar', nativeName: 'العربية',   englishName: 'Arabic'     },
  { code: 'hi', nativeName: 'हिन्दी',    englishName: 'Hindi'      },
  { code: 'tr', nativeName: 'Türkçe',    englishName: 'Turkish'    },
  { code: 'it', nativeName: 'Italiano',  englishName: 'Italian'    },
  { code: 'ru', nativeName: 'Русский',   englishName: 'Russian'    },
];

// ── Core writable store ───────────────────────────────────────────────────────
const STORAGE_KEY = 'tf_ui_locale';

function isSupported(code: string): code is UiLocale {
  return SUPPORTED.includes(code as UiLocale);
}

/** The active UI locale — reactive Svelte store. */
export const uiLocale = writable<UiLocale>('en');

// ── Reactive translation function ────────────────────────────────────────────
/**
 * `$t` — reactive translation derived store.
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

// ── Locale management ─────────────────────────────────────────────────────────

/** Read persisted locale from localStorage (browser only). */
export function getPersistedLocale(): UiLocale {
  if (!browser) return 'en';
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored && isSupported(stored)) return stored;
  } catch {}
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
  try { localStorage.setItem(STORAGE_KEY, code); } catch {}
  document.documentElement.lang = code;
}

/**
 * Initialise locale on app boot.
 * Priority: DB personal → org default → localStorage → browser language → 'en'
 */
export function initLocale(
  dbLocale: string | null = null,
  orgLocale: string | null = null
): UiLocale {
  let resolved: UiLocale = 'en';

  if (dbLocale && isSupported(dbLocale)) {
    // Personal DB preference — highest priority
    resolved = dbLocale;
  } else if (orgLocale && isSupported(orgLocale) && !localStorage.getItem(STORAGE_KEY)) {
    // Org default — only when no personal override stored
    resolved = orgLocale;
  } else {
    resolved = getPersistedLocale();
  }

  setUiLocale(resolved);
  return resolved;
}

/**
 * Persist the locale to the user's DB profile via PATCH /users/me/locale.
 * Fire-and-forget — non-critical.
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
  } catch {}
}
