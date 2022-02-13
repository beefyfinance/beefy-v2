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
import { selectIsBalanceHidden } from '../../features/data/selectors/wallet';
import { formatBigDecimals } from '../../helpers/format';
import { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';

const _GovVaultRewards = connect((state: BeefyState, { vaultId }: { vaultId: VaultGov['id'] }) => {
  const vault = selectVaultById(state, vaultId);
  const earnedToken = selectTokenById(state, vault.chainId, vault.earnedTokenId);
  const rewardsEarnedToken = selectGovVaultPendingRewardsInToken(state, vault.id);
  const rewardsEarnedUsd = selectGovVaultPendingRewardsInUsd(state, vault.id);
  const blurred = selectIsBalanceHidden(state);
  const isLoaded =
    state.ui.dataLoader.global.prices.alreadyLoadedOnce &&
    state.ui.dataLoader.byChainId[vault.chainId]?.balance.alreadyLoadedOnce;
  return {
    earnedToken,
    rewardsEarnedToken: formatBigDecimals(rewardsEarnedToken),
    rewardsEarnedUsd: formatBigDecimals(rewardsEarnedUsd),
    blurred,
    hasRewards: rewardsEarnedUsd.gt(0),
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
