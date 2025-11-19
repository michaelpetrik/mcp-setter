/**
 * Domain Entity: UserPreferences
 * Represents user preferences and settings
 */

import { z } from 'zod';

/**
 * User Preferences Schema
 * Validates user preferences structure
 */
export const UserPreferencesSchema = z.object({
  /** Whether telemetry is enabled */
  telemetryEnabled: z.boolean().default(true),

  /** Anonymous user ID for telemetry (hashed) */
  anonymousUserId: z.string().optional(),

  /** Default client for operations */
  defaultClient: z.string().optional(),

  /** Whether to create backups before operations */
  autoBackup: z.boolean().default(true),

  /** Whether to show verbose output */
  verboseOutput: z.boolean().default(false),

  /** Theme preference (for desktop app) */
  theme: z.enum(['light', 'dark', 'system']).default('system'),

  /** First install timestamp */
  firstInstallDate: z.string().optional(),

  /** Last updated timestamp */
  lastUpdated: z.string().optional(),
});

export type UserPreferencesData = z.infer<typeof UserPreferencesSchema>;

/**
 * UserPreferences Entity
 * Encapsulates user preferences with validation
 *
 * SOLID Principles:
 * - SRP: Only responsible for user preferences
 * - OCP: Can be extended with new preferences
 */
export class UserPreferences {
  private readonly data: UserPreferencesData;

  constructor(data: Partial<UserPreferencesData> = {}) {
    // Validate and set defaults
    this.data = UserPreferencesSchema.parse({
      telemetryEnabled: true,
      autoBackup: true,
      verboseOutput: false,
      theme: 'system',
      ...data,
    });

    // Set lastUpdated if not present
    if (!this.data.lastUpdated) {
      this.data.lastUpdated = new Date().toISOString();
    }

    // Set firstInstallDate if not present
    if (!this.data.firstInstallDate) {
      this.data.firstInstallDate = new Date().toISOString();
    }
  }

  /**
   * Create default preferences
   */
  static createDefault(): UserPreferences {
    return new UserPreferences();
  }

  /**
   * Create from JSON data
   */
  static fromJSON(json: unknown): UserPreferences {
    try {
      const data = UserPreferencesSchema.parse(json);
      return new UserPreferences(data);
    } catch (error) {
      // If invalid, return defaults
      console.warn('Invalid preferences data, using defaults:', error);
      return UserPreferences.createDefault();
    }
  }

  // Getters

  isTelemetryEnabled(): boolean {
    return this.data.telemetryEnabled;
  }

  getAnonymousUserId(): string | undefined {
    return this.data.anonymousUserId;
  }

  getDefaultClient(): string | undefined {
    return this.data.defaultClient;
  }

  isAutoBackupEnabled(): boolean {
    return this.data.autoBackup;
  }

  isVerboseOutputEnabled(): boolean {
    return this.data.verboseOutput;
  }

  getTheme(): 'light' | 'dark' | 'system' {
    return this.data.theme;
  }

  getFirstInstallDate(): string | undefined {
    return this.data.firstInstallDate;
  }

  getLastUpdated(): string | undefined {
    return this.data.lastUpdated;
  }

  // Setters (return new instance - immutability)

  setTelemetryEnabled(enabled: boolean): UserPreferences {
    return new UserPreferences({
      ...this.data,
      telemetryEnabled: enabled,
      lastUpdated: new Date().toISOString(),
    });
  }

  setAnonymousUserId(userId: string): UserPreferences {
    return new UserPreferences({
      ...this.data,
      anonymousUserId: userId,
      lastUpdated: new Date().toISOString(),
    });
  }

  setDefaultClient(client: string): UserPreferences {
    return new UserPreferences({
      ...this.data,
      defaultClient: client,
      lastUpdated: new Date().toISOString(),
    });
  }

  setAutoBackupEnabled(enabled: boolean): UserPreferences {
    return new UserPreferences({
      ...this.data,
      autoBackup: enabled,
      lastUpdated: new Date().toISOString(),
    });
  }

  setVerboseOutputEnabled(enabled: boolean): UserPreferences {
    return new UserPreferences({
      ...this.data,
      verboseOutput: enabled,
      lastUpdated: new Date().toISOString(),
    });
  }

  setTheme(theme: 'light' | 'dark' | 'system'): UserPreferences {
    return new UserPreferences({
      ...this.data,
      theme,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Update multiple preferences at once
   */
  update(updates: Partial<UserPreferencesData>): UserPreferences {
    return new UserPreferences({
      ...this.data,
      ...updates,
      lastUpdated: new Date().toISOString(),
    });
  }

  /**
   * Convert to JSON
   */
  toJSON(): UserPreferencesData {
    return { ...this.data };
  }

  /**
   * Convert to plain object for serialization
   */
  toObject(): UserPreferencesData {
    return this.toJSON();
  }
}
