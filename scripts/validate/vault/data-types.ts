import { VaultCowcentratedConfig, VaultGovConfig, VaultStandardConfig } from './config-types';

export type VaultData = {
  vaultWant: string;
  strategy: string;
  vaultOwner: string;
  totalSupply: string;
};

export type StrategyData = {
  keeper: string | undefined;
  feeRecipient: string | undefined;
  beefyFeeConfig: string | undefined;
  strategyOwner: string | undefined;
  harvestOnDeposit: boolean | undefined;
};

export type StandardWithData = VaultStandardConfig & VaultData & StrategyData;

export type RewardPoolData = {
  rewardPoolOwner: string | undefined;
  totalSupply: string | undefined;
};

export type GovWithData = VaultGovConfig & RewardPoolData;

export type CowcentratedVaultData = VaultData & {
  vaultWant: string;
  wants: [string, string];
};

export type CowcentratedOracleData = {
  subOracle0: string | undefined;
  subOracle1: string | undefined;
  subOracle0FromZero: string | undefined;
  subOracle1FromZero: string | undefined;
};

export type CowcentratedWithData = VaultCowcentratedConfig &
  CowcentratedVaultData &
  StrategyData &
  CowcentratedOracleData;

export type AnyVaultWithData = StandardWithData | GovWithData | CowcentratedWithData;

export type VaultGroups = {
  all: AnyVaultWithData[];
  allStandard: StandardWithData[];
  allGov: GovWithData[];
  allCowcentrated: CowcentratedWithData[];
  baseStandard: StandardWithData[];
  baseGov: GovWithData[];
  cowcentratedStandard: StandardWithData[];
  cowcentratedGov: GovWithData[];
};
