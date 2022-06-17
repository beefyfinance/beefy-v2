export interface IStrategyTypesApi {
  fetchStrategyTypes(): Promise<StrategyTypeConfig[]>;
}

export type StrategyTypeConfig = {
  id: string;
  name: string;
};
