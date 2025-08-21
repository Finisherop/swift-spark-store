export function formatCurrency(amount: number, currency: string = "INR") {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount}`;
  }
}

// Convert price from product currency to user's preferred currency
export function convertAndFormatPrice(
  price: number, 
  productCurrency: string, 
  userCurrency: string, 
  exchangeRates: Record<string, number>
): string {
  try {
    let convertedPrice = price;
    
    // If currencies are different, convert the price
    if (productCurrency !== userCurrency) {
      // Convert to USD first (base currency), then to user currency
      if (productCurrency !== 'USD') {
        // Convert from product currency to USD
        const usdRate = exchangeRates[productCurrency];
        if (usdRate) {
          convertedPrice = price / usdRate;
        }
      }
      
      // Convert from USD to user currency
      if (userCurrency !== 'USD') {
        const targetRate = exchangeRates[userCurrency];
        if (targetRate) {
          convertedPrice = convertedPrice * targetRate;
        }
      }
    }
    
    return formatCurrency(convertedPrice, userCurrency);
  } catch (error) {
    console.error('Currency conversion error:', error);
    // Fallback to original formatting
    return formatCurrency(price, productCurrency);
  }
}