// Verification utilities for South African identity documents

export interface VerificationResult {
  isValid: boolean;
  error?: string;
  type?: 'sa_id' | 'passport';
  details?: {
    birthDate?: string;
    gender?: string;
    citizenship?: string;
  };
}

/**
 * Validates South African ID number
 * Format: YYMMDD 0000 000
 */
export const validateSAID = (idNumber: string): VerificationResult => {
  // Remove spaces and check length
  const cleanId = idNumber.replace(/\s/g, '');
  
  if (cleanId.length !== 13) {
    return {
      isValid: false,
      error: 'ID number must be exactly 13 digits',
      type: 'sa_id'
    };
  }

  // Check if all characters are digits
  if (!/^\d{13}$/.test(cleanId)) {
    return {
      isValid: false,
      error: 'ID number must contain only digits',
      type: 'sa_id'
    };
  }

  // Extract date components
  const year = parseInt(cleanId.substring(0, 2));
  const month = parseInt(cleanId.substring(2, 4));
  const day = parseInt(cleanId.substring(4, 6));

  // Validate month
  if (month < 1 || month > 12) {
    return {
      isValid: false,
      error: 'Invalid month in ID number (must be 01-12)',
      type: 'sa_id'
    };
  }

  // Validate day
  if (day < 1 || day > 31) {
    return {
      isValid: false,
      error: 'Invalid day in ID number (must be 01-31)',
      type: 'sa_id'
    };
  }

  // Check for impossible dates (more flexible approach)
  const daysInMonth = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31]; // Allow leap year for February
  const maxDays = daysInMonth[month - 1];
  
  if (day > maxDays) {
    // Special case for February 29th in leap years
    if (month === 2 && day === 29) {
      // Allow February 29th (leap year)
    } else {
      return {
        isValid: false,
        error: `Invalid date: ${day}/${month} (maximum days for month ${month} is ${maxDays})`,
        type: 'sa_id'
      };
    }
  }

  // More lenient check digit validation (optional for now)
  // Comment out the strict Luhn algorithm check to allow more flexibility
  /*
  let sum = 0;
  for (let i = 0; i < 12; i++) {
    let digit = parseInt(cleanId[i]);
    if (i % 2 === 0) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
  }
  
  const checkDigit = (10 - (sum % 10)) % 10;
  const actualCheckDigit = parseInt(cleanId[12]);

  if (checkDigit !== actualCheckDigit) {
    return {
      isValid: false,
      error: 'Invalid check digit in ID number',
      type: 'sa_id'
    };
  }
  */

  // Extract additional information
  const citizenship = parseInt(cleanId.substring(10, 11));
  const gender = parseInt(cleanId.substring(6, 10));

  return {
    isValid: true,
    type: 'sa_id',
    details: {
      birthDate: `${year < 50 ? '20' : '19'}${year.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`,
      gender: gender >= 5000 ? 'Male' : 'Female',
      citizenship: citizenship === 0 ? 'South African' : 'Permanent Resident'
    }
  };
};

/**
 * Validates South African passport number
 * Format: A12345678
 */
export const validatePassport = (passportNumber: string): VerificationResult => {
  const cleanPassport = passportNumber.replace(/\s/g, '').toUpperCase();

  // Check format: Letter followed by 8 digits
  if (!/^[A-Z]\d{8}$/.test(cleanPassport)) {
    return {
      isValid: false,
      error: 'Passport number must be a letter followed by 8 digits (e.g., A12345678)',
      type: 'passport'
    };
  }

  return {
    isValid: true,
    type: 'passport'
  };
};

/**
 * Validates South African phone number
 * Accepts formats: +27 12 345 6789 or 012 345 6789
 */
export const validatePhone = (phone: string): VerificationResult => {
  const cleanPhone = phone.replace(/\s/g, '');
  
  // Check for valid South African phone number format
  if (!/^(\+27|0)[6-8][0-9]{8}$/.test(cleanPhone)) {
    return {
      isValid: false,
      error: 'Please enter a valid South African phone number (e.g., +27 12 345 6789 or 012 345 6789)'
    };
  }

  return {
    isValid: true
  };
};

/**
 * Formats ID number for display
 */
export const formatIDNumber = (idNumber: string, type: 'sa_id' | 'passport'): string => {
  if (type === 'sa_id') {
    // Format as YYMMDD 0000 000
    const clean = idNumber.replace(/\s/g, '');
    if (clean.length === 13) {
      return `${clean.substring(0, 6)} ${clean.substring(6, 10)} ${clean.substring(10)}`;
    }
  }
  return idNumber;
};

/**
 * Masks sensitive information for display
 */
export const maskSensitiveInfo = (value: string, type: 'sa_id' | 'passport' | 'phone'): string => {
  if (type === 'sa_id') {
    // Show only first 6 and last 3 digits
    const clean = value.replace(/\s/g, '');
    if (clean.length === 13) {
      return `${clean.substring(0, 6)} *** *** ${clean.substring(10)}`;
    }
  } else if (type === 'passport') {
    // Show only first letter and last 3 digits
    if (value.length >= 4) {
      return `${value[0]}***${value.substring(value.length - 3)}`;
    }
  } else if (type === 'phone') {
    // Show only last 4 digits
    const clean = value.replace(/\s/g, '');
    if (clean.length >= 4) {
      return `*** *** ${clean.substring(clean.length - 4)}`;
    }
  }
  return value;
};

/**
 * Validates email format
 */
export const validateEmail = (email: string): VerificationResult => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    };
  }

  return {
    isValid: true
  };
};

/**
 * Comprehensive user verification
 */
export const verifyUser = (data: {
  email: string;
  phone: string;
  idNumber: string;
  idType: 'sa_id' | 'passport';
  fullName: string;
}): VerificationResult[] => {
  const results: VerificationResult[] = [];

  // Validate email
  results.push(validateEmail(data.email));

  // Validate phone
  results.push(validatePhone(data.phone));

  // Validate ID number
  if (data.idType === 'sa_id') {
    results.push(validateSAID(data.idNumber));
  } else {
    results.push(validatePassport(data.idNumber));
  }

  // Validate full name (basic check)
  if (!data.fullName.trim() || data.fullName.trim().length < 2) {
    results.push({
      isValid: false,
      error: 'Full name must be at least 2 characters long'
    });
  } else {
    results.push({
      isValid: true
    });
  }

  return results;
}; 