"use client";

import { useLanguage } from '@/lib/LanguageContext';

export default function FertilizerTool() {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h3 className="text-sm font-semibold">{t('fertilizerTool')}</h3>
      </div>
      <div className="p-6">
        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <svg 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" 
              />
            </svg>
          </div>
          <h4 className="mb-2 text-lg font-medium text-gray-900">
            {t('fertilizerDosageCalculator') || 'Fertilizer Dosage Calculator'}
          </h4>
          <p className="mb-6 text-sm text-gray-600">
            {t('fertilizerToolDescription') || 'Calculate the right amount of fertilizers for your crops using the official soil health portal tool.'}
          </p>
          <a
            href="https://www.soilhealth.dac.gov.in/fertilizer-dosage"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center rounded-lg bg-green-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors duration-200"
          >
            <svg 
              className="mr-2 h-4 w-4" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" 
              />
            </svg>
            {t('openFertilizerTool') || 'Open Fertilizer Tool'}
          </a>
          <p className="mt-3 text-xs text-gray-500">
            {t('opensInNewTab') || 'Opens in a new tab'}
          </p>
        </div>
      </div>
    </div>
  );
}

