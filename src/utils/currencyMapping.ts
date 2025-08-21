// Country code to currency mapping (ISO 3166-1 alpha-2 to ISO 4217)
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  US: 'USD', CA: 'CAD', MX: 'USD',
  
  // Europe
  GB: 'GBP', IE: 'EUR', FR: 'EUR', DE: 'EUR', IT: 'EUR', ES: 'EUR',
  NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', FI: 'EUR', GR: 'EUR',
  LU: 'EUR', MT: 'EUR', CY: 'EUR', SI: 'EUR', SK: 'EUR', EE: 'EUR',
  LV: 'EUR', LT: 'EUR', CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK',
  PL: 'PLN', CZ: 'CZK', HU: 'HUF', RO: 'RON', BG: 'BGN', HR: 'HRK',
  
  // Asia Pacific
  IN: 'INR', CN: 'CNY', JP: 'JPY', KR: 'KRW', SG: 'SGD', HK: 'HKD',
  AU: 'AUD', NZ: 'NZD', TH: 'THB', MY: 'MYR', ID: 'IDR', PH: 'PHP',
  VN: 'VND', BD: 'BDT', LK: 'LKR', PK: 'PKR', NP: 'NPR',
  
  // Middle East
  AE: 'AED', SA: 'SAR', QA: 'QAR', KW: 'KWD', BH: 'BHD', OM: 'OMR',
  IL: 'ILS', TR: 'TRY', EG: 'EGP', JO: 'JOD', LB: 'LBP',
  
  // Africa
  ZA: 'ZAR', NG: 'NGN', KE: 'KES', GH: 'GHS', UG: 'UGX', TZ: 'TZS',
  MA: 'MAD', DZ: 'DZD', TN: 'TND', ET: 'ETB', ZW: 'USD',
  
  // South America
  BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN', UY: 'UYU',
  PY: 'PYG', BO: 'BOB', EC: 'USD', VE: 'USD',
  
  // Others
  RU: 'RUB', UA: 'UAH', BY: 'BYN', KZ: 'KZT', UZ: 'UZS',
};

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', INR: '₹', CAD: 'C$', AUD: 'A$',
  CHF: 'CHF', CNY: '¥', KRW: '₩', SGD: 'S$', HKD: 'HK$', NZD: 'NZ$',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', CZK: 'Kč', HUF: 'Ft',
  RUB: '₽', BRL: 'R$', ARS: '$', CLP: '$', MXN: '$', THB: '฿',
  MYR: 'RM', IDR: 'Rp', PHP: '₱', VND: '₫', AED: 'د.إ', SAR: 'ر.س',
  QAR: 'ر.ق', KWD: 'د.ك', BHD: '.د.ب', OMR: 'ر.ع.', ILS: '₪',
  TRY: '₺', EGP: 'ج.م', ZAR: 'R', NGN: '₦', KES: 'KSh', GHS: '₵',
  MAD: 'د.م.', DZD: 'د.ج', TND: 'د.ت', ETB: 'Br', UGX: 'USh',
  TZS: 'TSh', RON: 'lei', BGN: 'лв', HRK: 'kn', UAH: '₴', BYN: 'Br',
  KZT: '₸', UZS: 'soʻm', BDT: '৳', LKR: '₨', PKR: '₨', NPR: '₨'
};

// Get currency symbol with fallback
export function getCurrencySymbol(currencyCode: string): string {
  return CURRENCY_SYMBOLS[currencyCode] || currencyCode;
}

// Get currency from country code with fallback to USD
export function getCurrencyFromCountry(countryCode: string): string {
  return COUNTRY_TO_CURRENCY[countryCode] || 'USD';
}