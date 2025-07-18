/**
 * Sanitize HTML content to prevent XSS attacks
 * This is a simple sanitizer - for production use, consider using DOMPurify
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') return '';
  
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize text content by removing dangerous characters
 */
export function sanitizeText(input: string): string {
  if (typeof input !== 'string') return '';
  
  // Remove control characters and normalize whitespace
  return input
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
}

/**
 * Sanitize email input
 */
export function sanitizeEmail(email: string): string {
  if (typeof email !== 'string') return '';
  
  return email
    .toLowerCase()
    .trim()
    .replace(/[^\w\-@.]/g, ''); // Only allow word chars, hyphens, @ and dots
}

/**
 * Sanitize CSV values to prevent CSV injection
 */
export function sanitizeCSVValue(value: string): string {
  if (typeof value !== 'string') return '';
  
  // Escape formula injection characters
  if (value.startsWith('=') || value.startsWith('+') || value.startsWith('-') || value.startsWith('@')) {
    return `'${value}`;
  }
  
  return value;
}

/**
 * Validate and sanitize user name input
 */
export function sanitizeName(name: string): string {
  if (typeof name !== 'string') return '';
  
  return name
    .replace(/[<>\"'&]/g, '') // Remove HTML-dangerous characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .substring(0, 100); // Limit length
}

/**
 * Validate date string format (YYYY-MM-DD)
 */
export function validateDate(date: string): boolean {
  if (typeof date !== 'string') return false;
  
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  
  // Validate it's a real date
  const parsedDate = new Date(date);
  return parsedDate instanceof Date && !isNaN(parsedDate.getTime());
}

/**
 * Validate and sanitize numeric input
 */
export function validateNumber(value: any): { isValid: boolean; value: number } {
  const num = parseFloat(value);
  
  if (isNaN(num) || !isFinite(num) || num < 0) {
    return { isValid: false, value: 0 };
  }
  
  return { isValid: true, value: num };
} 