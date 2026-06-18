import { createContext, useCallback, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { IntlProvider } from 'react-intl'
import { useLocation, useNavigate } from 'react-router-dom'
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

// The active locale is the first URL segment (e.g. /ar/register -> "ar").
function localeFromPath(pathname: string): Locale | null {
  const seg = pathname.split('/')[1];
  return seg && seg in CATALOGS ? (seg as Locale) : null;
}

export function LocaleProvider({ children }: { children: ReactNode }) {
  const location = useLocation();
  const navigate = useNavigate();

  // URL is the source of truth; fall back to the stored/default locale.
  const locale = localeFromPath(location.pathname) ?? readStoredLocale();

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, locale);
    document.documentElement.lang = locale;
    document.documentElement.dir = RTL_LOCALES.includes(locale) ? 'rtl' : 'ltr';
  }, [locale]);

  // Switching locale rewrites the first path segment so URLs stay shareable.
  const setLocale = useCallback((next: Locale) => {
    const segments = location.pathname.split('/');
    if (segments[1] && segments[1] in CATALOGS) {
      segments[1] = next;
    } else {
      segments.splice(1, 0, next);
    }
    navigate(segments.join('/') + location.search);
  }, [location.pathname, location.search, navigate]);

  const value = useMemo(() => ({ locale, setLocale }), [locale, setLocale]);

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