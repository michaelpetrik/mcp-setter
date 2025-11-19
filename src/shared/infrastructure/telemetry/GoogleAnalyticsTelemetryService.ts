/**
 * Google Analytics Telemetry Service
 * Implements telemetry using Google Analytics 4 Measurement Protocol
 */

import { injectable, inject } from 'tsyringe';
import * as crypto from 'crypto';
import * as os from 'os';
import { ITelemetryService, UserProperties } from './ITelemetryService';
import {
  TelemetryEventCategory,
  TelemetryEventPayload,
  BaseTelemetryProperties,
} from '../../domain/events/TelemetryEvents';
import { IHttpClient } from '../http/IHttpClient';
import { TelemetryPayloadScrubber } from './TelemetryPayloadScrubber';
import { OperatingSystem } from '../../domain/value-objects/OperatingSystem';

/**
 * Google Analytics 4 Measurement Protocol configuration
 */
interface GA4Config {
  measurementId: string; // G-XXXXXXXXXX
  apiSecret: string;
  enabled: boolean;
}

/**
 * GA4 Event structure
 * https://developers.google.com/analytics/devguides/collection/protocol/ga4
 */
interface GA4Event {
  name: string; // Event name (max 40 chars)
  params: Record<string, string | number | boolean>; // Event parameters
}

/**
 * GA4 Measurement Protocol payload
 */
interface GA4Payload {
  client_id: string; // Anonymous client identifier
  user_id?: string; // Anonymous user identifier
  events: GA4Event[];
  user_properties?: Record<string, { value: string | number | boolean }>;
}

/**
 * GoogleAnalyticsTelemetryService
 * Sends telemetry to Google Analytics 4 using Measurement Protocol
 *
 * SOLID Principles:
 * - SRP: Only responsible for GA4 telemetry
 * - DIP: Depends on IHttpClient interface
 * - LSP: Substitutable for ITelemetryService
 */
@injectable()
export class GoogleAnalyticsTelemetryService implements ITelemetryService {
  private readonly config: GA4Config;
  private readonly clientId: string;
  private readonly sessionId: string;
  private readonly baseProperties: BaseTelemetryProperties;
  private readonly eventQueue: GA4Event[] = [];
  private userProperties: UserProperties = {};
  private flushTimeout?: NodeJS.Timeout;

  // GA4 Measurement Protocol endpoint
  private readonly GA4_ENDPOINT = 'https://www.google-analytics.com/mp/collect';

  // Batch settings
  private readonly BATCH_SIZE = 25; // Max events per batch
  private readonly FLUSH_INTERVAL_MS = 10000; // Flush every 10 seconds

  constructor(@inject('IHttpClient') private readonly httpClient: IHttpClient) {
    // Load GA4 configuration
    this.config = this.loadConfig();

    // Generate client ID (anonymous, persistent per machine)
    this.clientId = this.generateClientId();

    // Generate session ID (unique per app launch)
    this.sessionId = this.generateSessionId();

    // Set base properties
    this.baseProperties = this.createBaseProperties();

    // Start auto-flush timer
    if (this.config.enabled) {
      this.startAutoFlush();
    }
  }

  async trackEvent(
    category: TelemetryEventCategory,
    payload: TelemetryEventPayload = {}
  ): Promise<void> {
    if (!this.config.enabled) {
      return;
    }

    try {
      // Scrub payload for safety
      const scrubbedPayload = TelemetryPayloadScrubber.scrub(payload);

      // Create GA4 event
      const event: GA4Event = {
        name: this.sanitizeEventName(category),
        params: {
          ...this.baseProperties,
          ...this.flattenPayload(scrubbedPayload),
        },
      };

      // Add to queue
      this.eventQueue.push(event);

      // Flush if batch size reached
      if (this.eventQueue.length >= this.BATCH_SIZE) {
        await this.flush();
      }
    } catch (error) {
      // Never throw from telemetry - fail silently
      console.error('Telemetry error:', error instanceof Error ? error.message : 'Unknown error');
    }
  }

  async trackError(
    category: TelemetryEventCategory,
    payload: TelemetryEventPayload
  ): Promise<void> {
    // Errors are just events with error flag
    await this.trackEvent(category, {
      ...payload,
      is_error: true,
    });
  }

  async setUserProperties(properties: UserProperties): Promise<void> {
    this.userProperties = { ...this.userProperties, ...properties };
  }

  async flush(): Promise<void> {
    if (!this.config.enabled || this.eventQueue.length === 0) {
      return;
    }

    try {
      // Take events from queue
      const events = this.eventQueue.splice(0, this.BATCH_SIZE);

      // Build GA4 payload
      const payload: GA4Payload = {
        client_id: this.clientId,
        user_id: this.userProperties.user_id,
        events,
      };

      // Add user properties if present
      if (Object.keys(this.userProperties).length > 0) {
        payload.user_properties = {};
        for (const [key, value] of Object.entries(this.userProperties)) {
          if (value !== undefined) {
            payload.user_properties[key] = { value };
          }
        }
      }

      // Send to GA4
      const url = `${this.GA4_ENDPOINT}?measurement_id=${this.config.measurementId}&api_secret=${this.config.apiSecret}`;

      await this.httpClient.post(url, {
        body: JSON.stringify(payload),
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000, // 5 second timeout
      });
    } catch (error) {
      // Never throw from telemetry - fail silently
      console.error('Failed to flush telemetry:', error instanceof Error ? error.message : 'Unknown error');

      // Put events back in queue if network error (will retry)
      // But don't retry indefinitely to avoid memory leak
      if (this.eventQueue.length < 100) {
        // Max 100 queued events
        // Events were already removed, so they're lost - acceptable for telemetry
      }
    }
  }

  isEnabled(): boolean {
    return this.config.enabled;
  }

  /**
   * Load GA4 configuration from environment variables
   */
  private loadConfig(): GA4Config {
    // Check if telemetry is explicitly disabled
    const disabled =
      process.env.MCP_SETTER_NO_TELEMETRY === 'true' ||
      process.env.MCP_SETTER_NO_TELEMETRY === '1' ||
      process.env.DO_NOT_TRACK === '1' ||
      process.env.DO_NOT_TRACK === 'true';

    if (disabled) {
      return {
        measurementId: '',
        apiSecret: '',
        enabled: false,
      };
    }

    // Load GA4 credentials (should be set by installer or defaults)
    const measurementId = process.env.GA4_MEASUREMENT_ID || 'G-XXXXXXXXXX'; // TODO: Set real ID
    const apiSecret = process.env.GA4_API_SECRET || '';

    // Telemetry is enabled if credentials are provided
    const enabled = !!(measurementId && apiSecret && measurementId !== 'G-XXXXXXXXXX');

    return {
      measurementId,
      apiSecret,
      enabled,
    };
  }

  /**
   * Generate anonymous client ID (persistent per machine)
   */
  private generateClientId(): string {
    // Use machine ID if available, otherwise generate from hostname + username
    const machineInfo = `${os.hostname()}-${os.userInfo().username}`;
    return crypto.createHash('sha256').update(machineInfo).digest('hex');
  }

  /**
   * Generate session ID (unique per app launch)
   */
  private generateSessionId(): string {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Create base telemetry properties
   */
  private createBaseProperties(): BaseTelemetryProperties {
    const operatingSystem = OperatingSystem.detect();
    const osRelease = os.release();
    const appVersion = process.env.npm_package_version || '0.1.0';
    const installChannel = process.env.MCP_SETTER_INSTALL_CHANNEL || 'direct';
    const interfaceType = process.env.MCP_SETTER_INTERFACE || 'cli';

    return {
      os: operatingSystem.getType() as 'windows' | 'macos' | 'linux',
      os_version: osRelease,
      app_version: appVersion,
      install_channel: installChannel,
      interface_type: interfaceType as 'cli' | 'desktop',
      session_id: this.sessionId,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Sanitize event name for GA4
   * GA4 event names must be <= 40 chars and alphanumeric + underscore
   */
  private sanitizeEventName(category: TelemetryEventCategory): string {
    return category.toString().substring(0, 40);
  }

  /**
   * Flatten nested payload into GA4 parameters
   * GA4 params can only be 1-level deep
   */
  private flattenPayload(
    payload: TelemetryEventPayload,
    prefix = ''
  ): Record<string, string | number | boolean> {
    const flattened: Record<string, string | number | boolean> = {};

    for (const [key, value] of Object.entries(payload)) {
      const paramKey = prefix ? `${prefix}_${key}` : key;

      if (value == null) {
        continue;
      }

      if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        flattened[paramKey] = value;
      } else if (Array.isArray(value)) {
        // Convert arrays to comma-separated strings
        flattened[paramKey] = value.join(',');
      } else if (typeof value === 'object') {
        // Recursively flatten objects
        Object.assign(flattened, this.flattenPayload(value as Record<string, unknown>, paramKey));
      }
    }

    return flattened;
  }

  /**
   * Start auto-flush timer
   */
  private startAutoFlush(): void {
    this.flushTimeout = setInterval(() => {
      void this.flush();
    }, this.FLUSH_INTERVAL_MS);

    // Don't keep process alive just for telemetry
    if (this.flushTimeout.unref) {
      this.flushTimeout.unref();
    }
  }

  /**
   * Stop auto-flush timer
   */
  private stopAutoFlush(): void {
    if (this.flushTimeout) {
      clearInterval(this.flushTimeout);
      this.flushTimeout = undefined;
    }
  }
}
