import ui from './ui.json';

export type Lang = 'zh' | 'en';

export function getLang(url: URL): Lang {
  const segments = url.pathname.split('/').filter(Boolean);
  if (segments[0] === 'en') return 'en';
  return 'zh';
}

export function useTranslations(lang: Lang) {
  return function t(key: string): string {
    const keys = key.split('.');
    let value: unknown = (ui as Record<string, unknown>)[lang];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = (value as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }
    return typeof value === 'string' ? value : key;
  };
}

export function localizedPath(url: URL, path: string): string {
  const lang = getLang(url);
  return lang === 'en' ? `/en${path}` : path;
}

export function getCollectionName(base: string, lang: Lang): string {
  return lang === 'en' ? `${base}_en` : base;
}
