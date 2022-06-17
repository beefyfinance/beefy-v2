import { IStrategyTypesApi, StrategyTypeConfig } from './strategy-type-types';

export class StrategyTypesApi implements IStrategyTypesApi {
  public async fetchStrategyTypes(): Promise<StrategyTypeConfig[]> {
    return (await import('../../../../config/strategy-types.json')).default;
  }
}
