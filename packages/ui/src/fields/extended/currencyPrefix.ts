const CURRENCY_SYMBOLS: Record<string, string> = {
    AUD: '$', CAD: '$', CNY: '¥', EUR: '€', GBP: '£', HKD: '$', JPY: '¥', NZD: '$', SGD: '$', USD: '$',
};

export function getCurrencyPrefix(currency: unknown, symbols?: Record<string, string>, fallback = ''): string {
    const raw = currency && typeof currency === 'object' && 'value' in currency ? currency.value : currency;
    const code = String(raw ?? '').trim().toUpperCase();
    return code ? symbols?.[code] ?? CURRENCY_SYMBOLS[code] ?? fallback : fallback;
}
