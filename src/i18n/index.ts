import { create } from 'zustand';
import { translations, TranslationKey } from './translations';

export type Language = 'zh' | 'en';

interface I18nState {
  lang: Language;
  setLang: (lang: Language | string) => void;
  t: (key: TranslationKey) => string;
}

function getInitialLang(): Language {
  try {
    const params = new URLSearchParams(window.location.search);
    const urlLang = params.get('b0_lang');
    const saved = urlLang || localStorage.getItem('b0_lang');
    if (saved && saved.toLowerCase().startsWith('en')) {
      return 'en';
    }
  } catch (e) {}
  return 'zh';
}

export const useI18n = create<I18nState>((set, get) => {
  const initial = getInitialLang();

  // Set document attribute and title on initialization
  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('lang', initial === 'zh' ? 'zh-CN' : 'en');
    if (initial === 'en') {
      document.title = 'NetBOM — Enterprise Network Equipment Sizing & Intelligent BOM CPQ Studio';
    }
  }

  return {
    lang: initial,
    setLang: (newLang) => {
      const norm: Language = newLang.toLowerCase().startsWith('en') ? 'en' : 'zh';
      set({ lang: norm });
      try {
        localStorage.setItem('b0_lang', norm === 'zh' ? 'zh-CN' : 'en');
        document.documentElement.setAttribute('lang', norm === 'zh' ? 'zh-CN' : 'en');
        document.title = norm === 'zh'
          ? 'NetBOM — 企业级网络设备选型与智能物料报价工作台'
          : 'NetBOM — Enterprise Network Equipment Sizing & Intelligent BOM CPQ Studio';
      } catch (e) {}
    },
    t: (key: TranslationKey) => {
      const lang = get().lang;
      return translations[lang][key] || translations['zh'][key] || (key as string);
    },
  };
});

// Setup global message & storage listeners
if (typeof window !== 'undefined') {
  window.addEventListener('message', (e) => {
    if (!e.data) return;
    if (e.data.type === 'B0_LANG_CHANGE') {
      useI18n.getState().setLang(e.data.lang);
    }
  });

  window.addEventListener('b0-lang-change', (e: any) => {
    if (e.detail?.lang) {
      useI18n.getState().setLang(e.detail.lang);
    }
  });

  window.addEventListener('storage', (e) => {
    if (e.key === 'b0_lang' && e.newValue) {
      useI18n.getState().setLang(e.newValue);
    }
  });
}
