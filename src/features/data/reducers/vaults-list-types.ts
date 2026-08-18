export type VaultsViewMode = 'pro' | 'simplified';

export type VaultsListState = {
  vaultsLast: string | undefined;
  dashboardLast: string | undefined;
  viewMode: VaultsViewMode;
};
