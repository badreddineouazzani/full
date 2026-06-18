import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import fr from '../../translations/fr.json'
import en from '../../translations/en.json'
import ar from '../../translations/ar.json'

export type Locale = 'fr' | 'en' | 'ar'

const CATALOGS: Record<Locale, Record<string, string>> = { fr, en, ar }
const RTL_LOCALES: Locale[] = ['ar']
const STORAGE_KEY = 'locale'
const DEFAULT_LOCALE: Locale = 'fr'

interface LocaleContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
}

const LocaleContext = createContext<LocaleContextValue | null>(null);

function readStoredLocale(): Locale {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored && stored in CATALOGS ? (stored as Locale) : DEFAULT_LOCALE;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(readStoredLocale);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return (
    <LocaleContext.Provider value={value}>
      <IntlProvider locale={locale} defaultLocale={DEFAULT_LOCALE} messages={CATALOGS[locale]}>
        {children}
      </IntlProvider>
    </LocaleContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LocaleContext);
  if (!ctx) throw new Error('useLocale must be used within a LocaleProvider');
  return ctx;
}
