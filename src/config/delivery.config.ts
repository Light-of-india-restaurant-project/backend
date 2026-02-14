// Delivery configuration for Rotterdam area

// Rotterdam postal codes range: 3000-3199
// Format: 4 digits + 2 letters (e.g., 3011 AB)
export const DELIVERY_CONFIG = {
  // Regex pattern for Rotterdam postal codes (3000-3199 with letters)
  postalCodePattern: /^(30[0-9]{2}|31[0-9]{2})\s?[A-Za-z]{2}$/i,
  
  // Valid postal code ranges (numeric part)
  validPostalCodeRanges: {
    min: 3000,
    max: 3199,
  },
  
  // Default city for delivery
  defaultCity: 'Rotterdam',
  
  // Dutch mobile number pattern (international format)
  // Accepts +31 followed by 9 digits, or 06 followed by 8 digits
  mobilePattern: /^(\+31[0-9]{9}|06[0-9]{8}|0031[0-9]{9})$/,
};

/**
 * Validate if a postal code is within Rotterdam delivery area
 * @param postalCode - The postal code to validate (e.g., "3011 AB" or "3011AB")
 * @returns boolean - true if valid Rotterdam postal code
 */
export const isValidRotterdamPostalCode = (postalCode: string): boolean => {
  if (!postalCode) return false;
  
  // Check format first
  if (!DELIVERY_CONFIG.postalCodePattern.test(postalCode)) {
    return false;
  }
  
  // Extract numeric part and validate range
  const numericPart = parseInt(postalCode.replace(/\s/g, '').substring(0, 4), 10);
  return (
    numericPart >= DELIVERY_CONFIG.validPostalCodeRanges.min &&
    numericPart <= DELIVERY_CONFIG.validPostalCodeRanges.max
  );
};

/**
 * Validate Dutch mobile number format
 * @param mobile - The mobile number to validate
 * @returns boolean - true if valid Dutch mobile number
 */
export const isValidDutchMobile = (mobile: string): boolean => {
  if (!mobile) return false;
  // Remove spaces and dashes for validation
  const cleanMobile = mobile.replace(/[\s-]/g, '');
  return DELIVERY_CONFIG.mobilePattern.test(cleanMobile);
};

/**
 * Format postal code to standard format (NNNN AA)
 * @param postalCode - The postal code to format
 * @returns string - Formatted postal code
 */
export const formatPostalCode = (postalCode: string): string => {
  if (!postalCode) return '';
  const clean = postalCode.replace(/\s/g, '').toUpperCase();
  if (clean.length === 6) {
    return `${clean.substring(0, 4)} ${clean.substring(4)}`;
  }
  return postalCode;
};
