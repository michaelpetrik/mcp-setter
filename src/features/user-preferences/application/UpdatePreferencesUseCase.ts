/**
 * Use Case: UpdatePreferencesUseCase
 * Update user preferences
 */

import { injectable, inject } from 'tsyringe';
import { IPreferencesService } from '../domain/IPreferencesService';
import { UserPreferences, UserPreferencesData } from '../../../shared/domain/entities/UserPreferences';

export interface UpdatePreferencesInput {
  updates: Partial<UserPreferencesData>;
}

export interface UpdatePreferencesOutput {
  success: boolean;
  preferences: UserPreferences;
}

/**
 * UpdatePreferencesUseCase
 * Updates user preferences
 *
 * SOLID Principles:
 * - SRP: Only responsible for updating preferences
 * - DIP: Depends on IPreferencesService interface
 */
@injectable()
export class UpdatePreferencesUseCase {
  constructor(
    @inject('IPreferencesService') private readonly preferencesService: IPreferencesService
  ) {}

  async execute(input: UpdatePreferencesInput): Promise<UpdatePreferencesOutput> {
    // Load current preferences
    const currentPreferences = await this.preferencesService.load();

    // Update preferences
    const updatedPreferences = currentPreferences.update(input.updates);

    // Save updated preferences
    await this.preferencesService.save(updatedPreferences);

    return {
      success: true,
      preferences: updatedPreferences,
    };
  }
}
