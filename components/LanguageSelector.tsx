"use client";

import { useLanguage } from '@/lib/LanguageContext';
import { Language } from '@/lib/translations';

export default function LanguageSelector() {
  const { language, setLanguage, availableLanguages, t } = useLanguage();

  return (
    <div className="relative">
      <label htmlFor="language-select" className="block text-sm font-medium text-gray-700 mb-1">
        {t('language')}
      </label>
      <select
        id="language-select"
        value={language}
        onChange={(e) => setLanguage(e.target.value as Language)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white text-sm"
      >
        {Object.entries(availableLanguages).map(([code, lang]) => (
          <option key={code} value={code}>
            {lang.nativeName} ({lang.name})
          </option>
        ))}
      </select>
    </div>
  );
}
