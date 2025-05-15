import { memo } from 'react';
import { useTranslation } from 'react-i18next';
import type { TokenEntity } from '../../features/data/entities/token.ts';
import type { VaultGov } from '../../features/data/entities/vault.ts';
import {
  selectGovVaultPendingRewardsWithPrice,
  selectIsBalanceAvailableForChainUser,
} from '../../features/data/selectors/balance.ts';

import { selectIsPricesAvailable } from '../../features/data/selectors/prices.ts';
import { selectTokenByAddress } from '../../features/data/selectors/tokens.ts';
import { selectGovVaultById } from '../../features/data/selectors/vaults.ts';
import {
  selectIsBalanceHidden,
  selectWalletAddress,
} from '../../features/data/selectors/wallet.ts';
import type { BeefyState } from '../../features/data/store/types.ts';
import { formatLargeUsd, formatTokenDisplayCondensed } from '../../helpers/format.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { ValueBlock } from '../ValueBlock/ValueBlock.tsx';

type GovVaultRewardsProps = {
  vaultId: string;
};

type GovVaultRewardsData =
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

// TODO rewrite so this doesn't cause a re-render (return a new object) on every state update
const selectGovVaultRewardsData = (
  state: BeefyState,
  vaultId: VaultGov['id']
): GovVaultRewardsData => {
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
    const userRewards =
      walletAddress ?
        selectGovVaultPendingRewardsWithPrice(state, vault.id, walletAddress)
      : undefined;
    const userReward =
      userRewards && userRewards.length ?
        userRewards.find(r => r.amount.gt(0)) || userRewards[0]
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
    vault.earnedTokenAddresses.length > 0 ?
      selectTokenByAddress(state, vault.chainId, vault.earnedTokenAddresses[0])
    : undefined;

  return {
    status: 'no-rewards',
    blurred,
    earnedToken,
  };
};

export const GovVaultRewards = memo(({ vaultId }: GovVaultRewardsProps) => {
  const { t } = useTranslation();
  const data = useAppSelector(state => selectGovVaultRewardsData(state, vaultId));

  if (data.status === 'rewards') {
    return (
      <ValueBlock
        label={t('Vault-Rewards')}
        value={`${data.rewardsEarnedToken} ${data.earnedToken.symbol}`}
        usdValue={data.rewardsEarnedUsd}
        blurred={data.blurred}
        loading={false}
      />
    );
  }

  return (
    <ValueBlock
      label={t('Vault-Rewards')}
      value={data.earnedToken ? `0 ${data.earnedToken.symbol}` : '0'}
      usdValue={undefined}
      blurred={data.blurred}
      loading={data.status === 'loading'}
    />
  );
});
