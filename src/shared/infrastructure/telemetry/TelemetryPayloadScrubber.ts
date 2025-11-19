/**
 * Telemetry Payload Scrubber
 * Ensures no sensitive data (API keys, secrets, paths, etc.) are sent to telemetry
 */

import { TelemetryEventPayload } from '../../domain/events/TelemetryEvents';

/**
 * Sensitive key patterns to scrub
 */
const SENSITIVE_KEY_PATTERNS = [
  /api[_-]?key/i,
  /secret/i,
  /token/i,
  /password/i,
  /credential/i,
  /auth/i,
  /bearer/i,
  /access[_-]?key/i,
  /private[_-]?key/i,
  /session/i,
  /cookie/i,
];

/**
 * Path-like patterns to scrub
 */
const PATH_PATTERNS = [
  /^\/.*/, // Unix paths
  /^[A-Za-z]:\\.*/, // Windows paths
  /^~\/.*/, // Home directory paths
  /\$\{.*\}/, // Environment variable references
];

/**
 * TelemetryPayloadScrubber
 * Sanitizes telemetry payloads to prevent accidental leakage of sensitive data
 *
 * SOLID Principles:
 * - SRP: Only responsible for scrubbing sensitive data
 * - OCP: Can be extended with new patterns
 */
export class TelemetryPayloadScrubber {
  /**
   * Scrub a telemetry payload, removing or redacting sensitive data
   * @param payload The payload to scrub
   * @returns Scrubbed payload safe for telemetry
   */
  static scrub(payload: TelemetryEventPayload): TelemetryEventPayload {
    if (!payload || typeof payload !== 'object') {
      return payload;
    }

    const scrubbed: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(payload)) {
      // Check if key itself is sensitive
      if (this.isSensitiveKey(key)) {
        // Redact the value but keep the key presence
        scrubbed[key] = '[REDACTED]';
        continue;
      }

      // Scrub the value
      scrubbed[key] = this.scrubValue(value);
    }

    return scrubbed;
  }

  /**
   * Check if a key name is sensitive
   */
  private static isSensitiveKey(key: string): boolean {
    return SENSITIVE_KEY_PATTERNS.some(pattern => pattern.test(key));
  }

  /**
   * Scrub a value recursively
   */
  private static scrubValue(value: unknown): unknown {
    // Null/undefined - pass through
    if (value == null) {
      return value;
    }

    // Boolean/number - pass through
    if (typeof value === 'boolean' || typeof value === 'number') {
      return value;
    }

    // String - check for sensitive patterns
    if (typeof value === 'string') {
      return this.scrubString(value);
    }

    // Array - recursively scrub elements
    if (Array.isArray(value)) {
      return value.map(item => this.scrubValue(item));
    }

    // Object - recursively scrub properties
    if (typeof value === 'object') {
      const scrubbed: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(value)) {
        if (this.isSensitiveKey(k)) {
          scrubbed[k] = '[REDACTED]';
        } else {
          scrubbed[k] = this.scrubValue(v);
        }
      }
      return scrubbed;
    }

    // Unknown type - redact
    return '[REDACTED]';
  }

  /**
   * Scrub sensitive content from strings
   */
  private static scrubString(value: string): string {
    // Check for path-like strings
    if (this.looksLikePath(value)) {
      // Redact paths but keep basename for debugging
      const basename = value.split(/[/\\]/).pop();
      return basename ? `[PATH]/${basename}` : '[PATH]';
    }

    // Check for long strings that might be tokens/keys
    if (value.length > 100) {
      return `[LONG_STRING:${value.length}]`;
    }

    // Check for common secret patterns
    if (this.looksLikeSecret(value)) {
      return '[SECRET]';
    }

    return value;
  }

  /**
   * Check if a string looks like a file path
   */
  private static looksLikePath(value: string): boolean {
    return PATH_PATTERNS.some(pattern => pattern.test(value));
  }

  /**
   * Check if a string looks like a secret/token
   */
  private static looksLikeSecret(value: string): boolean {
    // Typical secret patterns:
    // - Base64-like strings longer than 32 chars
    // - Hex strings longer than 32 chars
    // - JWT tokens (three base64 parts separated by dots)

    // JWT pattern
    if (/^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+$/.test(value)) {
      return true;
    }

    // Long alphanumeric strings (likely keys)
    if (value.length > 32 && /^[A-Za-z0-9+/=_-]+$/.test(value)) {
      return true;
    }

    return false;
  }

  /**
   * Validate that a payload is safe (for testing)
   * Returns true if payload appears safe, false otherwise
   */
  static validate(payload: TelemetryEventPayload): {
    safe: boolean;
    violations: string[];
  } {
    const violations: string[] = [];

    const checkValue = (value: unknown, path: string) => {
      if (typeof value === 'string') {
        if (this.looksLikePath(value)) {
          violations.push(`Path detected at ${path}: ${value}`);
        }
        if (this.looksLikeSecret(value)) {
          violations.push(`Secret-like string at ${path}`);
        }
      } else if (Array.isArray(value)) {
        value.forEach((item, index) => checkValue(item, `${path}[${index}]`));
      } else if (value && typeof value === 'object') {
        for (const [key, val] of Object.entries(value)) {
          if (this.isSensitiveKey(key)) {
            violations.push(`Sensitive key detected: ${path}.${key}`);
          }
          checkValue(val, `${path}.${key}`);
        }
      }
    };

    checkValue(payload, 'root');

    return {
      safe: violations.length === 0,
      violations,
    };
  }
}
