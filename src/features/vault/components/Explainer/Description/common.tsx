import {
  isCowcentratedLikeVault,
  isGovVault,
  isStandardVault,
  type VaultCowcentratedLike,
  type VaultEntity,
  type VaultGov,
  type VaultStandard,
} from '../../../../data/entities/vault';
import { type TFunction, useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../../store';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { selectChainById } from '../../../../data/selectors/chains';
import { selectPlatformById } from '../../../../data/selectors/platforms';
import { selectTokenByAddress, selectVaultTokenSymbols } from '../../../../data/selectors/tokens';
import { type ReactElement, useMemo } from 'react';
import type { PlatformEntity } from '../../../../data/entities/platform';
import type { TokenEntity } from '../../../../data/entities/token';
import type { ChainEntity } from '../../../../data/entities/chain';

export type CommonHelper<TVault extends VaultEntity = VaultEntity> = {
  vault: TVault;
  chain: ChainEntity;
  platform: PlatformEntity;
  assetSymbols: string[];
  depositToken: TokenEntity;
  depositTokenProvider: PlatformEntity | undefined;
  i18n: {
    t: TFunction;
    i18nKey: string[];
    values: Record<string, string>;
    ns: string;
    components?: Record<string, ReactElement>;
  };
};

export function useCommonHelper(vaultId: VaultEntity['id']): CommonHelper {
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const chain = useAppSelector(state => selectChainById(state, vault.chainId));
  const platform = useAppSelector(state => selectPlatformById(state, vault.platformId));
  const depositToken = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const depositTokenProvider = useAppSelector(state =>
    depositToken.providerId ? selectPlatformById(state, depositToken.providerId) : undefined
  );
  const assetSymbols = useAppSelector(state => selectVaultTokenSymbols(state, vault.id));

  return useMemo(() => {
    const values: Record<string, string> = {
      name: vault.names.single,
      chainId: chain.id,
      chainName: chain.name,
      chainNative: chain.walletSettings.native,
      platformName: platform.name,
      depositToken: depositToken.symbol,
      depositTokenProvider: depositTokenProvider?.name || '[UNKNOWN]',
    };

    for (const i in assetSymbols) {
      values[`asset${i}`] = assetSymbols[i];
    }

    return {
      vault,
      chain,
      platform,
      assetSymbols,
      depositToken,
      depositTokenProvider,
      i18n: {
        t,
        i18nKey: [
          `StrategyDescription-${vault.type}-${vault.strategyTypeId}`,
          `StrategyDescription-${vault.strategyTypeId}`,
          `StrategyDescription-${vault.type}-default`,
          'StrategyDescription-default',
        ],
        values,
        ns: 'risks',
      },
    };
  }, [assetSymbols, chain, depositToken, depositTokenProvider, platform, t, vault]);
}

export function isCowcentratedLikeCommonHelper(
  helper: CommonHelper
): helper is CommonHelper<VaultCowcentratedLike> {
  return isCowcentratedLikeVault(helper.vault);
}

export function isGovCommonHelper(helper: CommonHelper): helper is CommonHelper<VaultGov> {
  return isGovVault(helper.vault);
}

export function isStandardCommonHelper(
  helper: CommonHelper
): helper is CommonHelper<VaultStandard> {
  return isStandardVault(helper.vault);
}
