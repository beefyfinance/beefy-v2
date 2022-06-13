import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { TokenEntity } from '../../features/data/entities/token';
import { VaultGov } from '../../features/data/entities/vault';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultPendingRewardsInUsd,
} from '../../features/data/selectors/balance';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import { selectVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden, selectIsWalletKnown } from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _GovVaultRewards = connect((state: BeefyState, { vaultId }: { vaultId: VaultGov['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const earnedToken = selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddress);
  const rewardsEarnedToken = selectGovVaultPendingRewardsInToken(state, vault.id);
  const rewardsEarnedUsd = selectGovVaultPendingRewardsInUsd(state, vault.id);
  const blurred = selectIsBalanceHidden(state);
  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletKnown(state)
      ? state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce
      : true;
  const hasRewards = rewardsEarnedUsd.gt(0);
  return {
    earnedToken,
    rewardsEarnedToken: formatBigDecimals(rewardsEarnedToken, 4, !hasRewards),
    rewardsEarnedUsd: formatBigUsd(rewardsEarnedUsd),
    blurred,
    hasRewards,
    loading: !isLoaded,
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
