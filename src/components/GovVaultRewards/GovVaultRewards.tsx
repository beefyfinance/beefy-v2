import React from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { TokenEntity } from '../../features/data/entities/token';
import { VaultGov } from '../../features/data/entities/vault';
import {
  selectGovVaultPendingRewardsInToken,
  selectGovVaultPendingRewardsInUsd,
} from '../../features/data/selectors/balance';
import { selectTokenById } from '../../features/data/selectors/tokens';
import { selectVaultById } from '../../features/data/selectors/vaults';
import {
  selectIsBalanceHidden,
  selectIsWalletConnected,
} from '../../features/data/selectors/wallet';
import { formatBigDecimals, formatBigUsd } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _GovVaultRewards = connect(
  (
    state: BeefyState,
    { vaultId, variant }: { vaultId: VaultGov['id']; variant: 'small' | 'large' }
  ) => {
    const vault = selectVaultById(state, vaultId);
    const earnedToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
    const rewardsEarnedToken = selectGovVaultPendingRewardsInToken(state, vault.id);
    const rewardsEarnedUsd = selectGovVaultPendingRewardsInUsd(state, vault.id);
    const blurred = selectIsBalanceHidden(state);
    const isLoaded =
      state.ui.dataLoader.global.prices.alreadyLoadedOnce && selectIsWalletConnected(state)
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
      variant,
    };
  }
)(
  ({
    rewardsEarnedToken,
    rewardsEarnedUsd,
    earnedToken,
    blurred,
    loading,
    hasRewards,
    variant,
  }: {
    earnedToken: TokenEntity;
    rewardsEarnedToken: string;
    rewardsEarnedUsd: string;
    blurred: boolean;
    loading: boolean;
    hasRewards: boolean;
    variant: 'small' | 'large';
  }) => {
    const { t } = useTranslation();

    return (
      <ValueBlock
        label={t('Vault-Rewards')}
        value={`${rewardsEarnedToken} ${earnedToken.symbol}`}
        usdValue={hasRewards ? rewardsEarnedUsd : null}
        blurred={blurred}
        loading={loading}
        variant={variant}
      />
    );
  }
);
export const GovVaultRewards = React.memo(_GovVaultRewards);
