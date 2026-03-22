import type { LanguageCode, UiTextSet } from '../types/wheel.types';

import ca from './locales/ca.json';
import en from './locales/en.json';
import es from './locales/es.json';

export const APP_TEXTS: Record<LanguageCode, UiTextSet> = {
  ca,
  es,
  en,
};
