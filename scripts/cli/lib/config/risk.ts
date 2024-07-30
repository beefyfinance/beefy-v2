import { CATEGORIES, RISKS } from '../../../../src/config/risk';
import { useTranslation } from './locale';
import { mapValues, orderBy } from 'lodash';
import { Prettify } from 'viem/chains';
import { ExtractStartsWith } from '../../utils/types';
import { createFactory } from '../../utils/factory';

type ConfigRiskCategoriesById = typeof CATEGORIES;
export type RiskCategoryId = keyof ConfigRiskCategoriesById;
type RiskCategoriesById = {
  [K in RiskCategoryId]: { id: K; score: number; title: string };
};
export type RiskCategory = Prettify<RiskCategoriesById[RiskCategoryId]>;

type BaseConfigRisksById = typeof RISKS;
export type RiskId = keyof BaseConfigRisksById;
type BaseConfigRisk = BaseConfigRisksById[RiskId];
export type VaultRiskId = {
  [K in RiskId]: BaseConfigRisksById[K] extends { category: string } ? K : never;
}[RiskId];
type NonVaultRiskId = Exclude<RiskId, VaultRiskId>;
export type PlatformRiskId = ExtractStartsWith<NonVaultRiskId, 'PLATFORM_'>;
export type TokenRiskId = ExtractStartsWith<NonVaultRiskId, 'TOKEN_'>;
export type TokensRiskId = ExtractStartsWith<NonVaultRiskId, 'TOKENS_'>;

type EnhanceConfigRisk<R extends RiskId, T extends string> = BaseConfigRisksById[R] & {
  id: R;
  type: T;
};
type PlatformConfigRisk = EnhanceConfigRisk<PlatformRiskId, 'platform'>;
type TokenConfigRisk = EnhanceConfigRisk<TokenRiskId, 'token'>;
type TokensConfigRisk = EnhanceConfigRisk<TokensRiskId, 'tokens'>;
type VaultConfigRisk = Omit<BaseConfigRisksById[VaultRiskId], 'category'> & {
  id: VaultRiskId;
  type: 'vault';
  category: RiskCategoryId;
};
type ConfigRisk = PlatformConfigRisk | TokenConfigRisk | TokensConfigRisk | VaultConfigRisk;

const vaultRiskGroups = {
  complexity: ['COMPLEXITY_LOW', 'COMPLEXITY_MID', 'COMPLEXITY_HIGH'],
  strategy: ['BATTLE_TESTED', 'NEW_STRAT', 'EXPERIMENTAL_STRAT'],
  il: ['IL_NONE', 'IL_LOW', 'IL_HIGH'],
  stable: ['ALGO_STABLE', 'PARTIAL_COLLAT_ALGO_STABLECOIN', 'OVER_COLLAT_ALGO_STABLECOIN'],
  liquidity: ['LIQ_HIGH', 'LIQ_LOW'],
  mcap: ['MCAP_LARGE', 'MCAP_MEDIUM', 'MCAP_SMALL', 'MCAP_MICRO'],
  platform: ['PLATFORM_ESTABLISHED', 'PLATFORM_NEW'],
  audit: ['NO_AUDIT', 'AUDIT'],
  contracts: ['CONTRACTS_VERIFIED', 'CONTRACTS_UNVERIFIED'],
  timelock: ['ADMIN_WITH_TIMELOCK', 'ADMIN_WITH_SHORT_TIMELOCK', 'ADMIN_WITHOUT_TIMELOCK'],
} as const satisfies Record<string, VaultRiskId[]>;

export type VaultRiskGroup = keyof typeof vaultRiskGroups;

const vaultRiskToGroup = Object.keys(vaultRiskGroups).reduce((acc, group: VaultRiskGroup) => {
  for (const risk of vaultRiskGroups[group]) {
    acc[risk] = group;
  }
  return acc;
}, {} as Record<VaultRiskId, VaultRiskGroup | undefined>);

export type VaultRisk = Omit<VaultConfigRisk, 'category'> & {
  category: RiskCategory;
  group: VaultRiskGroup | undefined;
};

const getRiskCategoriesById = createFactory(async () => {
  const { t } = await useTranslation();
  const tOptions = { ns: 'risks' };

  return mapValues(CATEGORIES, (score, id: RiskCategoryId) => ({
    id,
    score,
    title: t(id, tOptions),
  })) as RiskCategoriesById;
});

const getConfigRisks = createFactory(async (): Promise<ConfigRisk[]> => {
  return Object.entries(RISKS).map(([id, risk]: [RiskId, BaseConfigRisk]) => {
    if (id.startsWith('PLATFORM_')) {
      return { ...risk, id, type: 'platform' } as PlatformConfigRisk;
    } else if (id.startsWith('TOKEN_')) {
      return { ...risk, id, type: 'token' } as TokenConfigRisk;
    } else if (id.startsWith('TOKENS_')) {
      return { ...risk, id, type: 'tokens' } as TokensConfigRisk;
    } else if ('category' in risk) {
      return { ...risk, id, type: 'vault', category: risk.category } as VaultConfigRisk;
    } else {
      throw new Error(`Unknown risk type for risk ${id}`);
    }
  });
});

function isVaultConfigRisk(risk: ConfigRisk): risk is VaultConfigRisk {
  return risk.type === 'vault';
}

export const getVaultRisks = createFactory(async (): Promise<VaultRisk[]> => {
  const allRisks = await getConfigRisks();
  const categoriesById = await getRiskCategoriesById();
  const { t } = await useTranslation();
  const tOptions = { ns: 'risks' };
  return orderBy(
    allRisks.filter(isVaultConfigRisk).map(risk => ({
      ...risk,
      category: categoriesById[risk.category],
      condition: t(risk.condition, tOptions),
      explanation: t(risk.explanation, tOptions),
      title: t(risk.title, tOptions),
      group: vaultRiskToGroup[risk.id],
    })),
    [r => r.category, r => r.group, r => r.score],
    ['asc', 'asc', 'asc']
  );
});

export function getVaultRiskGroupRisks(group: VaultRiskGroup): VaultRiskId[] {
  return vaultRiskGroups[group];
}
