import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { TokenEntity } from '../../features/data/entities/token';
import type { VaultGov } from '../../features/data/entities/vault';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultPendingRewardsInUsd,
} from '../../features/data/selectors/balance';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden, selectWalletAddress } from '../../features/data/selectors/wallet';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import type { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader';

const _GovVaultRewards = connect((state: BeefyState, { vaultId }: { vaultId: VaultGov['id'] }) => {
  const vault = selectVaultById(state, vaultId) as VaultGov;
  const earnedToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddresses[0]); // TODO: support multiple earned tokens [empty = ok, not used when clm-like]
  const rewardsEarnedToken = selectGovVaultPendingRewardsInToken(state, vault.id); // TODO: support multiple earned tokens
  const rewardsEarnedUsd = selectGovVaultPendingRewardsInUsd(state, vault.id); // TODO: support multiple earned tokens
  const blurred = selectIsBalanceHidden(state);
  const walletAddress = selectWalletAddress(state);
  const isLoaded =
    !!walletAddress &&
    selectIsPricesAvailable(state) &&
    selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
  const hasRewards = rewardsEarnedUsd.gt(0);
  return {
    earnedToken,
    rewardsEarnedToken: formatTokenDisplayCondensed(rewardsEarnedToken, earnedToken.decimals, 4),
    rewardsEarnedUsd: formatLargeUsd(rewardsEarnedUsd),
    blurred,
    hasRewards,
    loading: !!walletAddress && !isLoaded,
  };
})(
  ({
    rewardsEarnedToken,
    rewardsEarnedUsd,
    earnedToken,
    blurred,
    loading,
    hasRewards,
  }: {
    earnedToken: TokenEntity;
    rewardsEarnedToken: string;
    rewardsEarnedUsd: string;
    blurred: boolean;
    loading: boolean;
    hasRewards: boolean;
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-Rewards')}
        value={`${rewardsEarnedToken} ${earnedToken.symbol}`}
        usdValue={hasRewards ? rewardsEarnedUsd : null}
        blurred={blurred}
        loading={loading}
      />
    );
  }
);
export const GovVaultRewards = React.memo(_GovVaultRewards);
