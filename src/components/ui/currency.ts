// src/utils/currency.ts
export async function getUserCurrencyRate(baseCurrency: string = "INR") {
  try {
    // User country detect using ipapi
    const locationRes = await fetch("https://ipapi.co/json/");
    const locationData = await locationRes.json();
    const userCurrency = locationData.currency || "INR";

    // Get conversion rate
    const res = await fetch(
      `https://api.exchangerate.host/latest?base=${baseCurrency}&symbols=${userCurrency}`
    );
    const data = await res.json();

    return {
      currency: userCurrency,
      rate: data.rates[userCurrency] || 1,
    };
  } catch (err) {
    console.error("Currency fetch failed", err);
    return { currency: baseCurrency, rate: 1 };
  }
}

export function formatPrice(amount: number, currency: string) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(amount);
}