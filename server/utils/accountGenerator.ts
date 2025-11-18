import { randomBytes } from 'crypto';

// Generate a random account number (12-16 digits, non-sequential)
export function generateAccountNumber(): string {
  const digits = [];
  for (let i = 0; i < 12; i++) {
    // Generate random digits, avoid simple patterns
    const digit = Math.floor(Math.random() * 10);
    digits.push(digit);
  }
  return digits.join('');
}

// Generate Australian BSB (6 digits, realistic format XXX-XXX)
export function generateBSB(): string {
  // First 3 digits: bank code (062-999)
  const bankCode = 62 + Math.floor(Math.random() * 937);
  // Last 3 digits: branch code  
  const branchCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${bankCode}${branchCode}`;
}

// Generate US routing number (9 digits, valid ABA format)
export function generateRoutingNumber(): string {
  // Format: XXXX XXXX C where C is checksum
  const digits = [];
  for (let i = 0; i < 8; i++) {
    digits.push(Math.floor(Math.random() * 10));
  }
  
  // Calculate checksum (simplified)
  const weights = [3, 7, 1, 3, 7, 1, 3, 7];
  let sum = 0;
  for (let i = 0; i < 8; i++) {
    sum += digits[i] * weights[i];
  }
  const checksum = (10 - (sum % 10)) % 10;
  digits.push(checksum);
  
  return digits.join('');
}

// Generate SWIFT code (11 characters)
export function generateSwiftCode(region: string): string {
  const bankCodes = ['FFCR', 'FUND', 'FINC', 'CRED'];
  const bankCode = bankCodes[Math.floor(Math.random() * bankCodes.length)];
  const countryCode = region === 'AU' ? 'AU' : region === 'US' ? 'US' : 'NZ';
  const locationCode = String.fromCharCode(65 + Math.floor(Math.random() * 26)) + 
                       String.fromCharCode(65 + Math.floor(Math.random() * 26));
  const branchCode = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  
  return `${bankCode}${countryCode}${locationCode}${branchCode}`;
}

// Generate card number (16 digits, Luhn algorithm compliant)
export function generateCardNumber(): string {
  // Start with BIN (Bank Identification Number) - using 4xxx for Visa-like
  const bin = '4' + Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  const account = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
  const partial = bin + account;
  
  // Calculate Luhn checksum
  let sum = 0;
  let isEven = true;
  
  for (let i = partial.length - 1; i >= 0; i--) {
    let digit = parseInt(partial[i]);
    if (isEven) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    isEven = !isEven;
  }
  
  const checksum = (10 - (sum % 10)) % 10;
  return partial + checksum;
}

// Generate CVV (3 digits)
export function generateCVV(): string {
  return Math.floor(100 + Math.random() * 900).toString();
}

// Generate expiry date (2-5 years from now)
export function generateExpiryDate(): { month: string; year: string } {
  const month = (1 + Math.floor(Math.random() * 12)).toString().padStart(2, '0');
  const currentYear = new Date().getFullYear();
  const year = (currentYear + 2 + Math.floor(Math.random() * 3)).toString();
  return { month, year };
}
