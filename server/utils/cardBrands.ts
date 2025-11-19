/**
 * Card brand detection based on BIN (Bank Identification Number) prefixes
 */

export type CardBrand = 'visa' | 'mastercard' | 'amex' | 'discover' | 'unknown';

/**
 * Detect card brand from card number based on industry-standard BIN ranges
 */
export function detectCardBrand(cardNumber: string): CardBrand {
  // Remove any spaces or dashes
  const cleaned = cardNumber.replace(/[\s-]/g, '');
  
  // Visa: starts with 4
  if (/^4/.test(cleaned)) {
    return 'visa';
  }
  
  // Mastercard: starts with 51-55 or 2221-2720
  if (/^5[1-5]/.test(cleaned)) {
    return 'mastercard';
  }
  
  const firstSix = parseInt(cleaned.substring(0, 6));
  if (firstSix >= 222100 && firstSix <= 272099) {
    return 'mastercard';
  }
  
  // American Express: starts with 34 or 37
  if (/^3[47]/.test(cleaned)) {
    return 'amex';
  }
  
  // Discover: starts with 6011, 622126-622925, 644-649, or 65
  if (/^6011/.test(cleaned) || /^65/.test(cleaned)) {
    return 'discover';
  }
  
  const firstSixDiscover = parseInt(cleaned.substring(0, 6));
  if (firstSixDiscover >= 622126 && firstSixDiscover <= 622925) {
    return 'discover';
  }
  
  if (/^64[4-9]/.test(cleaned)) {
    return 'discover';
  }
  
  return 'unknown';
}

/**
 * Generate a card number with a specific brand prefix
 */
export function generateCardNumberWithBrand(brand: CardBrand = 'visa'): string {
  let prefix: string;
  
  switch (brand) {
    case 'visa':
      prefix = '4';
      break;
    case 'mastercard':
      // Use 51-55 range for Mastercard
      prefix = `5${Math.floor(Math.random() * 5) + 1}`;
      break;
    case 'amex':
      // Use 34 or 37 for Amex
      prefix = Math.random() < 0.5 ? '34' : '37';
      break;
    case 'discover':
      // Use 6011 for Discover
      prefix = '6011';
      break;
    default:
      prefix = '4'; // Default to Visa
  }
  
  // Generate remaining digits
  const remainingLength = 16 - prefix.length;
  let cardNumber = prefix;
  
  for (let i = 0; i < remainingLength; i++) {
    cardNumber += Math.floor(Math.random() * 10);
  }
  
  return cardNumber;
}

/**
 * Get card brand display name
 */
export function getCardBrandName(brand: CardBrand): string {
  const names: Record<CardBrand, string> = {
    visa: 'Visa',
    mastercard: 'Mastercard',
    amex: 'American Express',
    discover: 'Discover',
    unknown: 'Unknown',
  };
  
  return names[brand] || 'Unknown';
}

/**
 * Get card brand color theme
 */
export function getCardBrandTheme(brand: CardBrand): { gradient: string; textColor: string } {
  const themes: Record<CardBrand, { gradient: string; textColor: string }> = {
    visa: {
      gradient: 'linear-gradient(135deg, #1A1F71 0%, #0F3460 100%)',
      textColor: '#FFFFFF',
    },
    mastercard: {
      gradient: 'linear-gradient(135deg, #EB001B 0%, #F79E1B 100%)',
      textColor: '#FFFFFF',
    },
    amex: {
      gradient: 'linear-gradient(135deg, #006FCF 0%, #00A2E5 100%)',
      textColor: '#FFFFFF',
    },
    discover: {
      gradient: 'linear-gradient(135deg, #FF6000 0%, #FFA500 100%)',
      textColor: '#FFFFFF',
    },
    unknown: {
      gradient: 'linear-gradient(135deg, #424242 0%, #616161 100%)',
      textColor: '#FFFFFF',
    },
  };
  
  return themes[brand] || themes.unknown;
}
