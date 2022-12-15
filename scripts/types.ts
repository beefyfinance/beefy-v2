export interface IPool {
  earnContractAddress: string;
  strategy: any;
}

export interface IVaultData {
  strategy: any;
  vaultOwner: string;
  totalSupply: any;
  earnContractAddress?: any;
}

export interface IStrategyData {
  keeper: any;
  beefyFeeRecipient: string;
  beefyFeeConfig: any;
  owner?: string;
  strategy?: any;
  earnContractAddress?: any;
  stratOwner?: string;
}

export interface IVault {
  id: string;
  name: string;
  token: string;
  tokenDecimals: number;
  tokenAddress: string;
  earnedToken: string;
  earnedTokenDecimals: number;
  earnedTokenAddress: string;
  earnContractAddress: string;
  isGovVault: boolean;
  oracle: string;
  oracleId: string;
  status: string;
  platformId: string;
  assets: Array<string>;
  strategyTypeId: string;
  risks: Array<string>;
  callFee: number;
  createdAt: number;
  network: string;
}

export type IUpdates = Record<
  string,
  Record<
    string,
    {
      emptyVault: any[];
    }
  >
>;
