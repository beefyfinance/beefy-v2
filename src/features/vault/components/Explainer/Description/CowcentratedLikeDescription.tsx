import { memo, useMemo } from 'react';
import { Trans } from 'react-i18next';
import {
  isCowcentratedVault,
  type VaultCowcentrated,
  type VaultCowcentratedLike,
  type VaultGov,
} from '../../../../data/entities/vault.ts';
import { type CommonHelper, isCowcentratedLikeCommonHelper, useCommonHelper } from './common.ts';

type CowcentratedLikeHelper = CommonHelper<VaultCowcentratedLike>;

function useCowcentratedLikeHelper(vaultId: VaultCowcentratedLike['id']): CowcentratedLikeHelper {
  const helper = useCommonHelper(vaultId);
  if (!isCowcentratedLikeCommonHelper(helper)) {
    throw new Error('This hook is only for cowcentrated-like vaults');
  }

  return useMemo(() => {
    const { vault } = helper;

    if (isCowcentratedVault(vault)) {
      return helper;
    }

    return {
      ...helper,
      i18n: {
        ...helper.i18n,
        i18nKey: [
          `StrategyDescription-cowcentrated-${vault.type}-${vault.strategyTypeId}`,
          `StrategyDescription-cowcentrated-${vault.strategyTypeId}`,
          `StrategyDescription-cowcentrated-${vault.type}-default`,
          `StrategyDescription-cowcentrated-default`,
          `StrategyDescription-default`,
        ],
      },
    };
  }, [helper]);
}

export type CowcentratedDescriptionProps = {
  vaultId: VaultCowcentrated['id'];
  poolId?: VaultGov['id'];
};

export const CowcentratedLikeDescription = memo(function CowcentratedLikeDescription({
  vaultId,
}: CowcentratedDescriptionProps) {
  const { i18n } = useCowcentratedLikeHelper(vaultId);
  return <Trans {...i18n} />;
});
