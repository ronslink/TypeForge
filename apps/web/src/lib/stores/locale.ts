/**
 * TypeForge UI Locale Store
 *
 * Single source of truth for the active UI language.
 * - Reads from user DB preference (authenticated) or localStorage (anonymous)
 * - Org members inherit the org's default if they haven't set a personal override
 * - Provides a reactive `t(key, params?)` function via a Svelte derived store
 */

import { browser } from '$app/environment';
import {
  SUPPORTED_UI_LOCALES,
  UI_LOCALES,
  isRtlUiLocale,
  isUiLocale,
  type UiLocale,
} from '$lib/i18n/locales';
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
import id from '../../../messages/id.json';
import vi from '../../../messages/vi.json';
import pl from '../../../messages/pl.json';

// ── Types ────────────────────────────────────────────────────────────────────
export { SUPPORTED_UI_LOCALES, UI_LOCALES, type UiLocale } from '$lib/i18n/locales';

type Messages = typeof en;
type MessageKey = keyof Messages;

const MESSAGES: Record<UiLocale, Partial<Messages>> = {
  en,
  es,
  fr,
  de,
  pt,
  ja,
  ko,
  zh,
  ar,
  hi,
  tr,
  it,
  ru,
  id,
  vi,
  pl,
};

// ── Core writable store ───────────────────────────────────────────────────────
const STORAGE_KEY = 'tf_ui_locale';

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
    if (stored && isUiLocale(stored)) return stored;
  } catch { /* ignore */ }
  // Fall back to browser language matching
  for (const lang of navigator.languages ?? []) {
    const code = lang.split('-')[0]!.toLowerCase();
    if (isUiLocale(code)) return code;
  }
  return 'en';
}

/** Apply a locale: updates the store, localStorage, and document language/direction. */
export function setUiLocale(code: UiLocale) {
  uiLocale.set(code);
  if (!browser) return;
  try { localStorage.setItem(STORAGE_KEY, code); } catch { /* ignore */ }
  document.documentElement.lang = code;
  document.documentElement.dir = isRtlUiLocale(code) ? 'rtl' : 'ltr';
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

  if (dbLocale && isUiLocale(dbLocale)) {
    // Personal DB preference — highest priority
    resolved = dbLocale;
  } else if (orgLocale && isUiLocale(orgLocale) && !localStorage.getItem(STORAGE_KEY)) {
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
  } catch { /* ignore */ }
}
