import { createCachedFactory, createFactory } from '../features/data/utils/factory-utils';
import type {
  TotalApyComponent,
  TotalApyDailyComponent,
  TotalApyKey,
  TotalApyYearlyComponent,
} from '../features/data/reducers/apy';
import { isCowcentratedGovVault, type VaultEntity } from '../features/data/entities/vault';
import { fromKeysMapper } from './object';
import { ucFirstLetter } from './string';
import type { ApiApyDataAprComponents } from '../features/data/apis/beefy/beefy-api-types';

const DISPLAY_ORDER = ((i = 0) =>
  ({
    vault: i++,
    clm: i++,
    rewardPoolTrading: i++,
    rewardPool: i++,
    trading: i++,
    merkl: i++,
    stellaSwap: i++,
    liquidStaking: i++,
    composablePool: i++,
    boost: i++,
    merklBoost: i++,
  } satisfies Record<TotalApyComponent, number>))();

/**
 * Components are the individual parts that make up `totalApy` in `TotalApy`
 */
export const getApyComponents = createFactory(() => {
  const { allComponents: baseAll } = getApiApyDataComponents();
  const components = [
    ...baseAll,
    'boost' as const,
    'merklBoost' as const,
  ] as const satisfies TotalApyComponent[];

  components.sort((a, b) => DISPLAY_ORDER[a] - DISPLAY_ORDER[b]);

  const daily = components.map(c => `${c}Daily` as const satisfies TotalApyDailyComponent);
  const yearly = components.map(c => `${c}Apr` as const satisfies TotalApyYearlyComponent);

  return {
    components,
    daily,
    yearly,
  } as const;
});

export type ApyLabelsType = VaultEntity['type'] | 'cowcentrated-compounds';

export type ApyLabels = {
  [K in TotalApyKey | 'breakdown']: string[];
};

export const getApyLabelsForType = createCachedFactory(
  (type: ApyLabelsType): ApyLabels => {
    const { components } = getApyComponents();
    const makeLabels = <T extends string>(key: T, period: 'Daily' | 'Monthly' | 'Yearly') => [
      `Vault-Apy-${ucFirstLetter(type)}-${period}-${ucFirstLetter(key)}` as const,
      `Vault-Apy-${period}-${ucFirstLetter(key)}` as const,
    ];
    const dailyComponentLabels = fromKeysMapper(
      components,
      key => makeLabels(key, 'Daily'),
      key => `${key}Daily` as const satisfies TotalApyKey
    );
    const yearlyComponentLabels = fromKeysMapper(
      components,
      key => makeLabels(key, 'Yearly'),
      key => `${key}Apr` as const satisfies TotalApyKey
    );
    return {
      ...dailyComponentLabels,
      ...yearlyComponentLabels,
      totalDaily: makeLabels('total', 'Daily'),
      totalMonthly: makeLabels('total', 'Monthly'),
      totalApy: makeLabels('total', 'Yearly'),
      boostedTotalDaily: [...makeLabels('boosted', 'Daily'), ...makeLabels('total', 'Daily')],
      boostedTotalApy: [...makeLabels('boosted', 'Yearly'), ...makeLabels('total', 'Yearly')],
      breakdown: [`Vault-Apy-${ucFirstLetter(type)}-Breakdown`, 'Vault-Apy-Breakdown'],
    };
  },
  type => type
);

/**
 * Components are the individual parts that make up `totalApy` in `ApiApyData`
 */
export const getApiApyDataComponents = createFactory(() => {
  const compoundableComponents = ['vault', 'clm'] as const satisfies Array<ApiApyDataAprComponents>;
  const nonCompoundableComponents = [
    'trading',
    'merkl',
    'stellaSwap',
    'liquidStaking',
    'composablePool',
    'rewardPool',
    'rewardPoolTrading',
  ] as const satisfies Array<ApiApyDataAprComponents>;
  const allComponents = [...compoundableComponents, ...nonCompoundableComponents];
  const compoundableDaily = compoundableComponents.map(
    component => `${component}Daily` as const satisfies TotalApyKey
  );
  const nonCompoundableDaily = nonCompoundableComponents.map(
    component => `${component}Daily` as const satisfies TotalApyKey
  );
  const allDaily = allComponents.map(
    component => `${component}Daily` as const satisfies TotalApyKey
  );
  const compoundableYearly = compoundableComponents.map(
    component => `${component}Apr` as const satisfies TotalApyKey
  );
  const nonCompoundableYearly = nonCompoundableComponents.map(
    component => `${component}Apr` as const satisfies TotalApyKey
  );
  const allYearly = allComponents.map(
    component => `${component}Apr` as const satisfies TotalApyKey
  );

  return {
    allComponents,
    allDaily,
    allYearly,
    compoundableComponents,
    compoundableDaily,
    compoundableYearly,
    nonCompoundableComponents,
    nonCompoundableDaily,
    nonCompoundableYearly,
  } as const;
});

export function getApyLabelsTypeForVault(
  vault: VaultEntity,
  totalType: 'apy' | 'apr'
): ApyLabelsType {
  if (isCowcentratedGovVault(vault) && totalType === 'apy') {
    return 'cowcentrated-compounds';
  }

  return vault.type;
}
