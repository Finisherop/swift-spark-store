// Country code to currency mapping
export const COUNTRY_TO_CURRENCY: Record<string, string> = {
  // North America
  US: 'USD', CA: 'CAD', MX: 'MXN',
  
  // Europe
  GB: 'GBP', DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', 
  NL: 'EUR', BE: 'EUR', AT: 'EUR', PT: 'EUR', IE: 'EUR',
  CH: 'CHF', NO: 'NOK', SE: 'SEK', DK: 'DKK', PL: 'PLN',
  
  // Asia Pacific
  IN: 'INR', CN: 'CNY', JP: 'JPY', KR: 'KRW', AU: 'AUD',
  NZ: 'NZD', SG: 'SGD', HK: 'HKD', TH: 'THB', MY: 'MYR',
  ID: 'IDR', PH: 'PHP', VN: 'VND',
  
  // Middle East & Africa
  AE: 'AED', SA: 'SAR', ZA: 'ZAR', EG: 'EGP', NG: 'NGN',
  
  // South America
  BR: 'BRL', AR: 'ARS', CL: 'CLP', CO: 'COP',
  
  // Default fallback
  DEFAULT: 'USD'
};

// Currency symbols mapping
export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$', EUR: '€', GBP: '£', JPY: '¥', CNY: '¥',
  INR: '₹', KRW: '₩', AUD: 'A$', CAD: 'C$', CHF: 'Fr',
  SEK: 'kr', NOK: 'kr', DKK: 'kr', PLN: 'zł', BRL: 'R$',
  AED: 'د.إ', SAR: '﷼', ZAR: 'R', HKD: 'HK$', SGD: 'S$',
  THB: '฿', MYR: 'RM', IDR: 'Rp', PHP: '₱', VND: '₫',
  MXN: '$', ARG: '$', CLP: '$', COP: '$', EGP: '£',
  NGN: '₦', NZD: 'NZ$'
};