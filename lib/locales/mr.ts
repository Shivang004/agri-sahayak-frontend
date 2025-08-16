import type { Locale } from 'date-fns';

const localize = {
  ordinalNumber: (n: number) => String(n),
  era: (n: number) => (n === 1 ? 'AD' : 'BC'),
  quarter: (n: number) => `Q${n}`,
  month: (n: number) => [
    'जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून',
    'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'
  ][n] || '',
  day: (n: number) => [
    'रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'
  ][n] || '',
  dayPeriod: (n: 'am' | 'pm' | 'midnight' | 'noon' | 'morning' | 'afternoon' | 'evening' | 'night') => {
    if (n === 'am') return 'सकाळ';
    if (n === 'pm') return 'संध्याकाळ';
    return '';
  },
};

const formatLong = {
  date: () => 'dd/MM/yyyy',
  time: () => 'HH:mm',
  dateTime: () => 'dd/MM/yyyy HH:mm',
};

const monthValues = {
    narrow: ['जा', 'फे', 'मा', 'ए', 'मे', 'जू', 'जु', 'ऑ', 'स', 'ऑ', 'नो', 'डि'] as const,
    abbreviated: ['जाने', 'फेब्रु', 'मार्च', 'एप्रि', 'मे', 'जून', 'जुलै', 'ऑग', 'सप्टें', 'ऑक्टो', 'नोव्हें', 'डिसें'] as const,
    wide: ['जानेवारी', 'फेब्रुवारी', 'मार्च', 'एप्रिल', 'मे', 'जून', 'जुलै', 'ऑगस्ट', 'सप्टेंबर', 'ऑक्टोबर', 'नोव्हेंबर', 'डिसेंबर'] as const,
};

const dayValues = {
    narrow: ['र', 'सो', 'मं', 'बु', 'गु', 'शु', 'श'] as const,
    short: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'] as const,
    abbreviated: ['रवि', 'सोम', 'मंगळ', 'बुध', 'गुरु', 'शुक्र', 'शनि'] as const,
    wide: ['रविवार', 'सोमवार', 'मंगळवार', 'बुधवार', 'गुरुवार', 'शुक्रवार', 'शनिवार'] as const,
};

const dayPeriodValues = {
    narrow: { am: 'a', pm: 'p', midnight: 'mn', noon: 'n', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' } as const,
    abbreviated: { am: 'AM', pm: 'PM', midnight: 'midnight', noon: 'noon', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' } as const,
    wide: { am: 'a.m.', pm: 'p.m.', midnight: 'midnight', noon: 'noon', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' } as const,
};

const ordinalNumber = (n: number) => String(n);

const mrLocale: Locale = {
  code: 'mr',
  localize,
  formatLong,
  formatDistance: (token, count) => `${count} ${token}`,
  formatRelative: (token) => token,
  match: {
    ordinalNumber: (str) => /^\d+$/.test(str),
    era: (str) => /^(ad|bc)/i.test(str),
    quarter: (str) => /^q\d/i.test(str),
    month: (str) => monthValues.wide.find(m => m === str) ? 0 : -1,
    day: (str) => dayValues.wide.find(d => d === str) ? 0 : -1,
    dayPeriod: (str) => /^(a\.m\.|p\.m\.)/i.test(str),
  },
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1,
  },
};

export default mrLocale;
