import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const LOCALES = ['es', 'fr', 'de', 'pt', 'ja', 'ko', 'zh', 'ar', 'hi', 'tr', 'it', 'ru', 'id', 'vi', 'pl'] as const;
const catalogDirectory = fileURLToPath(new URL('../../../messages/', import.meta.url));

const globallyInvariantKeys = new Set([
  'learn_pro_badge',
  'lesson_wpm',
  'lang_selector_rtl_badge',
  'pricing_plan_power_user',
  'pricing_feature_school_6',
  'billing_annual_discount',
  'org_wpm',
]);

const localeInvariantKeys: Record<(typeof LOCALES)[number], string[]> = {
  es: ['pricing_plan_individual', 'school_plan_flexible', 'billing_plan_pro', 'billing_plan_free_price', 'org_accuracy_short'],
  fr: ['learn_diff_expert', 'learn_tag_endurance', 'progress_sessions', 'progress_date', 'lesson_focus', 'finger_index', 'footer_curriculum', 'company_contact', 'mkt_region_europe', 'school_plan_flexible', 'school_total_label', 'org_action_col', 'billing_plan_pro', 'billing_plan_free_price', 'billing_col_date', 'org_accuracy_short'],
  de: ['lesson_layout', 'lesson_hand', 'settings_preview_layout', 'mkt_demo_wpm', 'school_plan_semester', 'nav_dashboard', 'billing_plan_pro', 'billing_plan_team', 'billing_plan_free_price', 'billing_col_status', 'org_accuracy_short', 'org_dashboard_title'],
  pt: ['settings_preview_layout', 'footer_legal', 'pricing_plan_individual', 'school_total_label', 'billing_plan_pro', 'billing_plan_free_price', 'org_accuracy_short'],
  ja: [],
  ko: [],
  zh: [],
  ar: [],
  hi: ['billing_plan_free_price'],
  tr: ['billing_plan_pro', 'billing_plan_free_price', 'org_accuracy_short'],
  it: ['lesson_layout', 'lesson_focus', 'settings_preview_rtl', 'settings_preview_layout', 'settings_preview_script', 'footer_curriculum', 'billing_plan_pro', 'billing_plan_free_price', 'org_accuracy_short'],
  ru: [],
  id: ['school_plan_semester', 'school_total_label'],
  vi: [],
  pl: [],
};

function loadCatalog(locale: string): Record<string, string> {
  return JSON.parse(readFileSync(`${catalogDirectory}${locale}.json`, 'utf8'));
}

function placeholderNames(value: string): string[] {
  const ranges: string[] = [];
  const stack: number[] = [];
  for (let index = 0; index < value.length; index += 1) {
    if (value[index] === '{') stack.push(index);
    if (value[index] === '}' && stack.length > 0) {
      const start = stack.pop();
      if (start !== undefined && stack.length === 0) {
        const name = value.slice(start + 1, index).match(/^\s*([\w.-]+)/)?.[1];
        if (name) ranges.push(name);
      }
    }
  }
  return ranges.sort();
}

function templateTokens(value: string): string[] {
  return [...value.matchAll(/\$?\{[A-Za-z_][\w.-]*\}/g)].map((match) => match[0]).sort();
}

function htmlTags(value: string): string[] {
  return [...value.matchAll(/<\/?[A-Za-z][^>]*>/g)].map((match) => match[0]).sort();
}

describe('translation catalogs', () => {
  const english = loadCatalog('en');

  for (const locale of LOCALES) {
    it(`${locale} has complete keys, intact placeholders, clean Unicode, and no unapproved English copy`, () => {
      const catalog = loadCatalog(locale);
      expect(Object.keys(catalog)).toEqual(Object.keys(english));

      const allowedUnchanged = new Set([...globallyInvariantKeys, ...localeInvariantKeys[locale]]);
      for (const [key, source] of Object.entries(english)) {
        const translation = catalog[key] ?? '';
        expect(translation, `${locale}.${key} must be non-empty`).toBeTruthy();
        expect(placeholderNames(translation), `${locale}.${key} changed its placeholders`).toEqual(placeholderNames(source));
        if (key !== 'adaptive_banner_body') {
          expect(templateTokens(translation), `${locale}.${key} changed its template tokens`).toEqual(templateTokens(source));
        }
        expect(htmlTags(translation), `${locale}.${key} changed its HTML tags`).toEqual(htmlTags(source));
        expect(translation, `${locale}.${key} contains mojibake`).not.toMatch(/(?:Ã[\u00A0-\u00BF]|Â[\u00A0-\u00BF]|â€|ðŸ|ï¸|�)/);
        if (!allowedUnchanged.has(key)) {
          expect(translation, `${locale}.${key} is still English`).not.toBe(source);
        }
      }
    });
  }
});
