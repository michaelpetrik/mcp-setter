/**
 * Telemetry Service Factory
 * Creates the appropriate telemetry service based on user preferences
 */

import { container } from 'tsyringe';
import { ITelemetryService } from './ITelemetryService';
import { GoogleAnalyticsTelemetryService } from './GoogleAnalyticsTelemetryService';
import { NoOpTelemetryService } from './NoOpTelemetryService';

/**
 * TelemetryServiceFactory
 * Creates telemetry service based on:
 * 1. Environment variables (MCP_SETTER_NO_TELEMETRY, DO_NOT_TRACK)
 * 2. User preferences (if available)
 * 3. GA4 configuration availability
 *
 * SOLID Principles:
 * - SRP: Only responsible for creating telemetry services
 * - OCP: Can be extended with new telemetry backends
 */
export class TelemetryServiceFactory {
  /**
   * Create telemetry service
   * @param telemetryEnabled User preference (if available)
   * @returns ITelemetryService instance
   */
  static create(telemetryEnabled?: boolean): ITelemetryService {
    // Check environment variables first
    const envDisabled =
      process.env.MCP_SETTER_NO_TELEMETRY === 'true' ||
      process.env.MCP_SETTER_NO_TELEMETRY === '1' ||
      process.env.DO_NOT_TRACK === '1' ||
      process.env.DO_NOT_TRACK === 'true';

    if (envDisabled) {
      return container.resolve(NoOpTelemetryService);
    }

    // Check user preference
    if (telemetryEnabled === false) {
      return container.resolve(NoOpTelemetryService);
    }

    // Check if GA4 credentials are available
    const measurementId = process.env.GA4_MEASUREMENT_ID || '';
    const apiSecret = process.env.GA4_API_SECRET || '';

    if (!measurementId || !apiSecret || measurementId === 'G-XXXXXXXXXX') {
      // No GA4 credentials - use no-op
      return container.resolve(NoOpTelemetryService);
    }

    // All checks passed - use Google Analytics
    return container.resolve(GoogleAnalyticsTelemetryService);
  }

  /**
   * Create telemetry service asynchronously (loads user preferences)
   * @returns ITelemetryService instance
   */
  static async createAsync(): Promise<ITelemetryService> {
    try {
      // Try to load user preferences
      const preferencesService = container.resolve('IPreferencesService');
      if (preferencesService && typeof preferencesService.load === 'function') {
        const preferences = await preferencesService.load();
        return this.create(preferences.isTelemetryEnabled());
      }
    } catch (error) {
      // If preferences not available, use default
      console.warn('Failed to load preferences for telemetry:', error);
    }

    // Fallback to synchronous creation
    return this.create();
  }
}
