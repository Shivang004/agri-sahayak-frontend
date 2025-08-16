import type { Locale } from 'date-fns';

const localize = {
  ordinalNumber: (n: number) => String(n),
  era: (n: number) => (n === 1 ? 'AD' : 'BC'),
  quarter: (n: number) => `Q${n}`,
  month: (n: number) => [
    'ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ',
    'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'
  ][n] || '',
  day: (n: number) => [
    'ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨੀਵਾਰ'
  ][n] || '',
  dayPeriod: (n: 'am' | 'pm' | 'midnight' | 'noon' | 'morning' | 'afternoon' | 'evening' | 'night') => {
    if (n === 'am') return 'ਸਵੇਰ';
    if (n === 'pm') return 'ਸ਼ਾਮ';
    return '';
  },
};

const formatLong = {
  date: () => 'dd/MM/yyyy',
  time: () => 'HH:mm',
  dateTime: () => 'dd/MM/yyyy HH:mm',
};

const monthValues = {
  narrow: ['ਜ', 'ਫ', 'ਮ', 'ਅ', 'ਮ', 'ਜ', 'ਜੁ', 'ਅ', 'ਸ', 'ਅ', 'ਨ', 'ਦ'] as const,
  abbreviated: ['ਜਨ', 'ਫ਼ਰ', 'ਮਾਰ', 'ਅਪ੍ਰੈ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾ', 'ਅਗ', 'ਸਤੰ', 'ਅਕਤੂ', 'ਨਵੰ', 'ਦਸੰ'] as const,
  wide: ['ਜਨਵਰੀ', 'ਫ਼ਰਵਰੀ', 'ਮਾਰਚ', 'ਅਪ੍ਰੈਲ', 'ਮਈ', 'ਜੂਨ', 'ਜੁਲਾਈ', 'ਅਗਸਤ', 'ਸਤੰਬਰ', 'ਅਕਤੂਬਰ', 'ਨਵੰਬਰ', 'ਦਸੰਬਰ'] as const,
};

const dayValues = {
  narrow: ['ਐ', 'ਸੋ', 'ਮੰ', 'ਬੁੱ', 'ਵੀ', 'ਸ਼ੁੱ', 'ਸ਼'] as const,
  short: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕ', 'ਸ਼ਨਿ'] as const,
  abbreviated: ['ਐਤ', 'ਸੋਮ', 'ਮੰਗ', 'ਬੁੱਧ', 'ਵੀਰ', 'ਸ਼ੁੱਕ', 'ਸ਼ਨਿ'] as const,
  wide: ['ਐਤਵਾਰ', 'ਸੋਮਵਾਰ', 'ਮੰਗਲਵਾਰ', 'ਬੁੱਧਵਾਰ', 'ਵੀਰਵਾਰ', 'ਸ਼ੁੱਕਰਵਾਰ', 'ਸ਼ਨੀਵਾਰ'] as const,
};

const dayPeriodValues = {
  narrow: { am: 'a', pm: 'p', midnight: 'mn', noon: 'n', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' } as const,
  abbreviated: { am: 'AM', pm: 'PM', midnight: 'midnight', noon: 'noon', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' } as const,
  wide: { am: 'a.m.', pm: 'p.m.', midnight: 'midnight', noon: 'noon', morning: 'morning', afternoon: 'afternoon', evening: 'evening', night: 'night' } as const,
};

const ordinalNumber = (n: number) => String(n);

const paLocale: Locale = {
  code: 'pa',
  localize,
  formatLong,
  formatDistance: (token, count) => `${count} ${token}`,
  formatRelative: (token) => token,
  match: {
    ordinalNumber: () => null,
    era: () => null,
    quarter: () => null,
    month: () => null,
    day: () => null,
    dayPeriod: () => null,
  },
  options: {
    weekStartsOn: 1,
    firstWeekContainsDate: 1,
  },
};

export default paLocale;
