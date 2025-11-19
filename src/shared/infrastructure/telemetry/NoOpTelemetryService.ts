/**
 * No-Op Telemetry Service
 * Used when telemetry is disabled
 */

import { injectable } from 'tsyringe';
import { ITelemetryService, UserProperties } from './ITelemetryService';
import { TelemetryEventCategory, TelemetryEventPayload } from '../../domain/events/TelemetryEvents';

/**
 * NoOpTelemetryService
 * Does nothing - used when telemetry is disabled
 *
 * SOLID Principles:
 * - LSP: Substitutable for ITelemetryService
 * - SRP: Only responsible for being a no-op
 */
@injectable()
export class NoOpTelemetryService implements ITelemetryService {
  async trackEvent(
    _category: TelemetryEventCategory,
    _payload?: TelemetryEventPayload
  ): Promise<void> {
    // No-op
  }

  async trackError(
    _category: TelemetryEventCategory,
    _payload: TelemetryEventPayload
  ): Promise<void> {
    // No-op
  }

  async setUserProperties(_properties: UserProperties): Promise<void> {
    // No-op
  }

  async flush(): Promise<void> {
    // No-op
  }

  isEnabled(): boolean {
    return false;
  }
}
