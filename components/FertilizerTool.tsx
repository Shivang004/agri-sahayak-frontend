"use client";

import { useLanguage } from '@/lib/LanguageContext';

export default function FertilizerTool() {
  const { t } = useLanguage();
  
  return (
    <div className="rounded-lg border bg-white">
      <div className="border-b p-4">
        <h3 className="text-sm font-semibold">{t('fertilizerTool')}</h3>
      </div>
      <div className="h-[480px] w-full">
        <iframe
          className="h-full w-full"
          src="https://soilhealth.dac.gov.in/fertilizer-dosage"
          title="Fertilizer Dosage Tool"
          loading="lazy"
        />
      </div>
    </div>
  );
}

