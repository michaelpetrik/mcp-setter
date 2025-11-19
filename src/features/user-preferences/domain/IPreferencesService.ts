/**
 * Feature: User Preferences
 * Domain Interface: IPreferencesService
 */

import { UserPreferences } from '../../../shared/domain/entities/UserPreferences';

/**
 * IPreferencesService Interface
 * Abstract user preferences persistence
 *
 * SOLID Principles:
 * - DIP: Application layer depends on this abstraction
 * - ISP: Small, focused interface
 */
export interface IPreferencesService {
  /**
   * Load user preferences from storage
   * Returns default preferences if none exist
   */
  load(): Promise<UserPreferences>;

  /**
   * Save user preferences to storage
   */
  save(preferences: UserPreferences): Promise<void>;

  /**
   * Check if preferences file exists
   */
  exists(): Promise<boolean>;

  /**
   * Delete preferences file
   */
  delete(): Promise<void>;

  /**
   * Get the path to the preferences file
   */
  getPreferencesPath(): string;
}
