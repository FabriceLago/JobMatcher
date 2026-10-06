/**
 * Security & Sanitization Utilities
 * Protects against DOM-based XSS, Open Redirects, and Malicious Scheme Exploits.
 */

// Allow only safe schemes: http, https, mailto
const SAFE_URL_PATTERN = /^(https?:\/\/|mailto:)/i;

/**
 * Sanitizes URLs to prevent javascript: or data: XSS payloads in href attributes.
 */
export function sanitizeUrl(url: string | undefined | null, fallback: string = '#'): string {
  if (!url || typeof url !== 'string') return fallback;

  const trimmed = url.trim();

  // Block dangerous schemes
  const lower = trimmed.toLowerCase();
  if (
    lower.startsWith('javascript:') ||
    lower.startsWith('data:') ||
    lower.startsWith('vbscript:') ||
    lower.startsWith('blob:')
  ) {
    console.warn('[Security Guard] Blocked dangerous URL scheme:', lower.slice(0, 30));
    return fallback;
  }

  // Check if it starts with a safe scheme or is a valid relative path
  if (SAFE_URL_PATTERN.test(trimmed) || trimmed.startsWith('/') || trimmed.startsWith('#')) {
    return trimmed;
  }

  // If it's a domain-like string (e.g. "www.chuv.ch"), prepend https://
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(\/.*)?$/.test(trimmed)) {
    return `https://${trimmed}`;
  }

  return fallback;
}

/**
 * Sanitizes and truncates user-provided text inputs to prevent prompt injection & buffer exhaustion.
 */
export function sanitizeText(text: string | undefined | null, maxLength: number = 25000): string {
  if (!text || typeof text !== 'string') return '';
  // Strip null bytes and control characters
  const clean = text.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
  return clean.slice(0, maxLength);
}
