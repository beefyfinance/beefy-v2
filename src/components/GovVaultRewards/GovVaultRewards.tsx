import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import type { TokenEntity } from '../../features/data/entities/token';
import type { VaultGov } from '../../features/data/entities/vault';
import { selectGovVaultPendingRewardsWithPrice } from '../../features/data/selectors/balance';
import { selectGovVaultById } from '../../features/data/selectors/vaults';
import { selectIsBalanceHidden, selectWalletAddress } from '../../features/data/selectors/wallet';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format';
import type { BeefyState } from '../../redux-types';
import { ValueBlock } from '../ValueBlock/ValueBlock';
import {
  selectIsBalanceAvailableForChainUser,
  selectIsPricesAvailable,
} from '../../features/data/selectors/data-loader';
import { selectTokenByAddress } from '../../features/data/selectors/tokens';
import { memo } from 'react';

type GovVaultRewardsProps =
  | {
      status: 'loading' | 'no-rewards';
      blurred: boolean;
      earnedToken?: TokenEntity;
    }
  | {
      status: 'rewards';
      blurred: boolean;
      earnedToken: TokenEntity;
      rewardsEarnedToken: string;
      rewardsEarnedUsd: string;
    };

const _GovVaultRewards = connect(
  (state: BeefyState, { vaultId }: { vaultId: VaultGov['id'] }): GovVaultRewardsProps => {
    const vault = selectGovVaultById(state, vaultId);
    const blurred = selectIsBalanceHidden(state);
    const walletAddress = selectWalletAddress(state);
    const isLoaded =
      !!walletAddress &&
      selectIsPricesAvailable(state) &&
      selectIsBalanceAvailableForChainUser(state, vault.chainId, walletAddress);
    const isLoading = !!walletAddress && !isLoaded;

    if (isLoading) {
      return { status: 'loading', blurred };
    }

    if (isLoaded) {
      const userRewards = walletAddress
        ? selectGovVaultPendingRewardsWithPrice(state, vault.id, walletAddress)
        : undefined;
      const userReward =
        userRewards && userRewards.length
          ? userRewards.find(r => r.amount.gt(0)) || userRewards[0]
          : undefined; // TODO: support multiple earned tokens [empty = ok, not used when clm-like]

      if (userReward) {
        const {
          token: earnedToken,
          amount: rewardsEarnedToken,
          price: rewardsEarnedPrice,
        } = userReward;
        const rewardsEarnedUsd = rewardsEarnedPrice.times(rewardsEarnedToken);
        return {
          status: 'rewards',
          blurred,
          earnedToken,
          rewardsEarnedToken: formatTokenDisplayCondensed(
            rewardsEarnedToken,
            earnedToken.decimals,
            4
          ),
          rewardsEarnedUsd: formatLargeUsd(rewardsEarnedUsd),
        };
      }
    }

    const earnedToken =
      vault.earnedTokenAddresses.length > 0
        ? selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddresses[0])
        : undefined;

    return {
      status: 'no-rewards',
      blurred,
      earnedToken,
    };
  }
)((props: GovVaultRewardsProps) => {
  const { t } = useTranslation();

  if (props.status === 'rewards') {
    return (
      <ValueBlock
        label={t('Vault-Rewards')}
        value={`${props.rewardsEarnedToken} ${props.earnedToken.symbol}`}
        usdValue={props.rewardsEarnedUsd}
        blurred={props.blurred}
        loading={false}
      />
    );
  }

  return (
    <ValueBlock
      label={t('Vault-Rewards')}
      value={props.earnedToken ? `0 ${props.earnedToken.symbol}` : '0'}
      usdValue={undefined}
      blurred={props.blurred}
      loading={props.status === 'loading'}
    />
  );
});
export const GovVaultRewards = memo(_GovVaultRewards);
