/**
 * Feature: User Preferences
 * Infrastructure: JsonPreferencesStorage
 * Stores preferences in a JSON file
 */

import * as path from 'path';
import { injectable, inject } from 'tsyringe';
import { IPreferencesService } from '../domain/IPreferencesService';
import { UserPreferences } from '../../../shared/domain/entities/UserPreferences';
import { IFileSystem } from '../../../shared/infrastructure/file-system/IFileSystem';
import { OperatingSystem } from '../../../shared/domain/value-objects/OperatingSystem';

/**
 * JsonPreferencesStorage
 * Stores user preferences in a JSON file in the OS-appropriate config directory
 *
 * SOLID Principles:
 * - SRP: Only responsible for preferences storage
 * - DIP: Depends on IFileSystem interface
 */
@injectable()
export class JsonPreferencesStorage implements IPreferencesService {
  private readonly preferencesPath: string;

  constructor(@inject('IFileSystem') private readonly fileSystem: IFileSystem) {
    // Determine preferences path based on OS
    const os = OperatingSystem.detect();
    const configDir = os.getAppDataDirectory();

    // Store preferences in MCP Setter config directory
    const mcpSetterConfigDir = path.join(configDir, 'mcp-setter');
    this.preferencesPath = path.join(mcpSetterConfigDir, 'preferences.json');
  }

  async load(): Promise<UserPreferences> {
    try {
      // Check if file exists
      const exists = await this.fileSystem.exists(this.preferencesPath);

      if (!exists) {
        // Return default preferences
        return UserPreferences.createDefault();
      }

      // Read file
      const content = await this.fileSystem.readFile(this.preferencesPath, 'utf-8');

      // Parse JSON
      const data = JSON.parse(content);

      // Create UserPreferences from data
      return UserPreferences.fromJSON(data);
    } catch (error) {
      // If any error, return defaults
      console.warn(
        `Failed to load preferences from ${this.preferencesPath}:`,
        error instanceof Error ? error.message : 'Unknown error'
      );
      return UserPreferences.createDefault();
    }
  }

  async save(preferences: UserPreferences): Promise<void> {
    try {
      // Ensure directory exists
      const dir = path.dirname(this.preferencesPath);
      await this.fileSystem.ensureDir(dir);

      // Convert to JSON
      const data = preferences.toJSON();
      const content = JSON.stringify(data, null, 2);

      // Write file
      await this.fileSystem.writeFile(this.preferencesPath, content, 'utf-8');
    } catch (error) {
      throw new Error(
        `Failed to save preferences to ${this.preferencesPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  async exists(): Promise<boolean> {
    return this.fileSystem.exists(this.preferencesPath);
  }

  async delete(): Promise<void> {
    try {
      const exists = await this.fileSystem.exists(this.preferencesPath);
      if (exists) {
        await this.fileSystem.remove(this.preferencesPath);
      }
    } catch (error) {
      throw new Error(
        `Failed to delete preferences at ${this.preferencesPath}: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  getPreferencesPath(): string {
    return this.preferencesPath;
  }
}
