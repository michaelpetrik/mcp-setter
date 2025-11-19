/**
 * Shared Infrastructure Interface: ITelemetryService
 * Abstract telemetry operations following DIP
 */

import { TelemetryEventCategory, TelemetryEventPayload } from '../../domain/events/TelemetryEvents';

/**
 * User properties set once per session
 */
export interface UserProperties {
  user_id?: string; // Anonymous user ID (hashed)
  install_channel?: string; // homebrew, npm, direct, etc.
  first_install_date?: string; // ISO date
}

/**
 * ITelemetryService Interface
 * Abstraction for telemetry/analytics operations
 *
 * Implementations:
 * - GoogleAnalyticsTelemetryService: Sends to GA4
 * - NoOpTelemetryService: Does nothing (when telemetry disabled)
 */
export interface ITelemetryService {
  /**
   * Track an event
   * @param category Event category
   * @param payload Event-specific payload (MUST NOT contain secrets)
   */
  trackEvent(category: TelemetryEventCategory, payload?: TelemetryEventPayload): Promise<void>;

  /**
   * Track an error
   * @param category Event category
   * @param payload Error payload (MUST NOT contain raw error messages with secrets)
   */
  trackError(category: TelemetryEventCategory, payload: TelemetryEventPayload): Promise<void>;

  /**
   * Set user properties (called once per session)
   * @param properties User properties to set
   */
  setUserProperties(properties: UserProperties): Promise<void>;

  /**
   * Flush any pending events (called on app shutdown)
   */
  flush(): Promise<void>;

  /**
   * Check if telemetry is enabled
   */
  isEnabled(): boolean;
}
