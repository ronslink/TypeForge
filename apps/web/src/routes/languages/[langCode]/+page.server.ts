import { error } from '@sveltejs/kit';
import { getLanguageByCode } from '$lib/i18n/languages';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
  const { langCode } = params;
  const language = getLanguageByCode(langCode);
  
  if (!language) {
    throw error(404, {
      message: `Language ${langCode} is not supported yet.`
    });
  }
  
  return {
    language
  };
};
