import { memo, useMemo } from 'react';
import { Trans } from 'react-i18next';
import { type VaultCowcentrated, type VaultGov } from '../../../../data/entities/vault';
import { type CommonHelper, isCowcentratedCommonHelper, useCommonHelper } from './common';
import { useAppSelector } from '../../../../../store';
import { selectGovVaultById } from '../../../../data/selectors/vaults';

type CowcentratedHelper = CommonHelper<VaultCowcentrated>;

function useCowcentratedHelper(
  vaultId: VaultCowcentrated['id'],
  poolId?: VaultGov['id']
): CowcentratedHelper {
  const helper = useCommonHelper(vaultId);
  if (!isCowcentratedCommonHelper(helper)) {
    throw new Error('This hook is only for cowcentrated vaults');
  }
  const pool = useAppSelector(state => (poolId ? selectGovVaultById(state, poolId) : undefined));

  return useMemo(() => {
    if (!pool) {
      return helper;
    }
    const { vault } = helper;
    return {
      ...helper,
      pool,
      i18n: {
        ...helper.i18n,
        i18nKey: [
          `StrategyDescription-${vault.type}-${pool.type}-${pool.strategyTypeId}`,
          `StrategyDescription-${vault.type}-${pool.strategyTypeId}`,
          `StrategyDescription-${pool.strategyTypeId}`,
          `StrategyDescription-${vault.type}-${pool.type}-default`,
          `StrategyDescription-${vault.type}-default`,
          'StrategyDescription-default',
        ],
      },
    };
  }, [helper, pool]);
}

export type CowcentratedDescriptionProps = {
  vaultId: VaultCowcentrated['id'];
  poolId?: VaultGov['id'];
};

export const CowcentratedDescription = memo<CowcentratedDescriptionProps>(
  function CowcentratedDescription({ vaultId, poolId }) {
    const { i18n } = useCowcentratedHelper(vaultId, poolId);
    return <Trans {...i18n} />;
  }
);
