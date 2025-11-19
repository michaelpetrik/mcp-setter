/**
 * CLI Command: Preferences
 * Manage user preferences
 */

import { container } from 'tsyringe';
import { GetPreferencesUseCase } from '@/features/user-preferences/application/GetPreferencesUseCase';
import { UpdatePreferencesUseCase } from '@/features/user-preferences/application/UpdatePreferencesUseCase';
import * as output from '../utils/output';

interface PreferencesShowOptions {
  json?: boolean;
}

interface PreferencesSetOptions {
  telemetry?: boolean;
  defaultClient?: string;
  autoBackup?: boolean;
  verbose?: boolean;
  theme?: 'light' | 'dark' | 'system';
  json?: boolean;
}

/**
 * Show current preferences
 */
export async function preferencesShowCommand(options: PreferencesShowOptions): Promise<void> {
  try {
    const getPreferencesUseCase = container.resolve(GetPreferencesUseCase);
    const preferences = await getPreferencesUseCase.execute();

    if (options.json) {
      output.json(preferences.toJSON());
    } else {
      output.info('Current Preferences:');
      output.table([
        { Setting: 'Telemetry Enabled', Value: preferences.isTelemetryEnabled() ? 'Yes' : 'No' },
        {
          Setting: 'Default Client',
          Value: preferences.getDefaultClient() || '(not set)',
        },
        { Setting: 'Auto Backup', Value: preferences.isAutoBackupEnabled() ? 'Yes' : 'No' },
        {
          Setting: 'Verbose Output',
          Value: preferences.isVerboseOutputEnabled() ? 'Yes' : 'No',
        },
        { Setting: 'Theme', Value: preferences.getTheme() },
        {
          Setting: 'First Install',
          Value: preferences.getFirstInstallDate() || '(not set)',
        },
      ]);
    }
  } catch (error) {
    output.error(
      `Failed to show preferences: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}

/**
 * Update preferences
 */
export async function preferencesSetCommand(options: PreferencesSetOptions): Promise<void> {
  try {
    const updatePreferencesUseCase = container.resolve(UpdatePreferencesUseCase);

    // Build updates object
    const updates: Record<string, unknown> = {};

    if (options.telemetry !== undefined) {
      updates['telemetryEnabled'] = options.telemetry;
    }

    if (options.defaultClient !== undefined) {
      updates['defaultClient'] = options.defaultClient;
    }

    if (options.autoBackup !== undefined) {
      updates['autoBackup'] = options.autoBackup;
    }

    if (options.verbose !== undefined) {
      updates['verboseOutput'] = options.verbose;
    }

    if (options.theme !== undefined) {
      updates['theme'] = options.theme;
    }

    if (Object.keys(updates).length === 0) {
      output.error('No preferences specified to update');
      process.exit(1);
    }

    // Update preferences
    const result = await updatePreferencesUseCase.execute({ updates });

    if (options.json) {
      output.json({ success: result.success, preferences: result.preferences.toJSON() });
    } else {
      output.success('Preferences updated successfully');

      // Show what changed
      output.info('\nUpdated settings:');
      const changes = Object.keys(updates).map(key => {
        const prettyKey = key
          .replace(/([A-Z])/g, ' $1')
          .toLowerCase()
          .trim()
          .replace(/^./, str => str.toUpperCase());
        return { Setting: prettyKey, Value: String(updates[key]) };
      });
      output.table(changes);
    }
  } catch (error) {
    output.error(
      `Failed to update preferences: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
    process.exit(1);
  }
}
