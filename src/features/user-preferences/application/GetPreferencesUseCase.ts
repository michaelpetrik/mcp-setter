/**
 * Use Case: GetPreferencesUseCase
 * Retrieve user preferences
 */

import { injectable, inject } from 'tsyringe';
import { IPreferencesService } from '../domain/IPreferencesService';
import { UserPreferences } from '../../../shared/domain/entities/UserPreferences';

/**
 * GetPreferencesUseCase
 * Retrieves current user preferences
 *
 * SOLID Principles:
 * - SRP: Only responsible for getting preferences
 * - DIP: Depends on IPreferencesService interface
 */
@injectable()
export class GetPreferencesUseCase {
  constructor(
    @inject('IPreferencesService') private readonly preferencesService: IPreferencesService
  ) {}

  async execute(): Promise<UserPreferences> {
    return this.preferencesService.load();
  }
}
