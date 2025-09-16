/**
 * Utility function to format phone numbers for VoiceGenie API
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number in international format
 */
export function formatPhoneNumberForVoiceGenie(phoneNumber: string): string {
  // Remove all non-digit characters except +
  let cleaned = phoneNumber.replace(/[^\d+]/g, '');
  
  // If it already starts with +91, return as is
  if (cleaned.startsWith('+91') && cleaned.length === 12) {
    return cleaned;
  }
  
  // If it starts with 91 and has 12 digits, add +
  if (cleaned.startsWith('91') && cleaned.length === 12) {
    return '+' + cleaned;
  }
  
  // If it's 10 digits and starts with 6,7,8,9 (Indian mobile format), add +91
  if (cleaned.length === 10 && /^[6-9]/.test(cleaned)) {
    return '+91' + cleaned;
  }
  
  // If it's 11 digits and starts with 0, remove 0 and add +91
  if (cleaned.length === 11 && cleaned.startsWith('0')) {
    return '+91' + cleaned.substring(1);
  }
  
  // If it already has +91 but wrong length, try to fix
  if (cleaned.startsWith('+91') && cleaned.length !== 12) {
    const numberPart = cleaned.substring(3);
    if (numberPart.length === 10 && /^[6-9]/.test(numberPart)) {
      return '+91' + numberPart;
    }
  }
  
  // If we can't format it properly, return as is
  // but log a warning in development
  if (process.env.NODE_ENV === 'development') {
    console.warn('Unable to properly format phone number for VoiceGenie:', phoneNumber);
  }
  
  return cleaned;
}