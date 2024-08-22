import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { groupBy } from 'lodash-es';
import { type VaultEntity } from '../../../../../../data/entities/vault';
import {
  selectUserStellaSwapUnifiedRewardsForVault,
  type UnifiedReward,
} from '../../../../../../data/selectors/user-rewards';
import { useAppDispatch, useAppSelector } from '../../../../../../../store';
import type { ChainEntity, ChainId } from '../../../../../../data/entities/chain';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { Claim } from './Claim/Claim';
import { RewardList } from '../RewardList/RewardList';
import { Source } from '../Source/Source';
import { isNonEmptyArray, type NonEmptyArray } from '../../../../../../data/utils/array-utils';
import { selectChainById } from '../../../../../../data/selectors/chains';
import { strictEntries } from '../../../../../../../helpers/object';
import { AlertWarning } from '../../../../../../../components/Alerts';
import { RefreshButton } from '../RefreshButton/RefreshButton';
import { fetchUserStellaSwapRewardsAction } from '../../../../../../data/actions/user-rewards/stellaswap-user-rewards';
import { selectStellaSwapUserRewardsStatus } from '../../../../../../data/selectors/data-loader';

function useUserRewardsLoader(walletAddress: string, vaultId: string, autoRefresh: boolean) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state =>
    selectStellaSwapUserRewardsStatus(state, vaultId, walletAddress)
  );
  const handleRefresh = useCallback(() => {
    dispatch(fetchUserStellaSwapRewardsAction({ walletAddress, vaultId }));
  }, [dispatch, walletAddress, vaultId]);

  useEffect(() => {
    if (autoRefresh && status && status.canLoad) {
      handleRefresh();
    }
  }, [dispatch, status, autoRefresh, handleRefresh]);

  return useMemo(
    () => ({
      canLoad: status?.canLoad || false,
      isLoaded: status?.isLoaded || false,
      isLoading: status?.isLoading || false,
      isError: status?.isError || false,
      handleLoad: status?.canLoad === true ? handleRefresh : undefined,
    }),
    [status, handleRefresh]
  );
}

type StellaSwapRewardsProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  walletAddress?: string;
  deposited: boolean;
};

export const StellaSwapRewards = memo<StellaSwapRewardsProps>(function StellaSwapRewards({
  vaultId,
  chainId,
  walletAddress,
  deposited,
}) {
  const { t } = useTranslation();
  const vaultRewards = useAppSelector(state =>
    selectUserStellaSwapUnifiedRewardsForVault(state, vaultId, walletAddress)
  );
  const hasClaimable = useMemo(
    () => !!walletAddress && !!vaultRewards && vaultRewards.some(r => r.amount.gt(BIG_ZERO)),
    [vaultRewards, walletAddress]
  );

  if (!isNonEmptyArray(vaultRewards)) {
    return walletAddress ? (
      <AutomaticUserRewardsRefresher walletAddress={walletAddress} vaultId={vaultId} />
    ) : null;
  }

  return (
    <>
      {hasClaimable && walletAddress ? (
        <ClaimableRewards
          vaultId={vaultId}
          vaultRewards={vaultRewards}
          walletAddress={walletAddress}
          deposited={deposited}
        />
      ) : (
        <Source
          key={chainId}
          title={t('Transact-Claim-Rewards-stellaswap')}
          refresh={
            walletAddress ? (
              <UserRewardsRefreshButton walletAddress={walletAddress} vaultId={vaultId} />
            ) : undefined
          }
        >
          <RewardList rewards={vaultRewards} deposited={deposited} />
        </Source>
      )}
    </>
  );
});

type ClaimableRewardsProps = {
  vaultId: string;
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
};

const ClaimableRewards = memo<ClaimableRewardsProps>(function ClaimableRewards({
  vaultId,
  vaultRewards,
  walletAddress,
  deposited,
}) {
  const byChain = useMemo(
    () =>
      groupBy(vaultRewards, r => r.token.chainId) as Partial<
        Record<ChainId, NonEmptyArray<UnifiedReward>>
      >,
    [vaultRewards]
  );
  const hasMultipleChains = useMemo(() => Object.keys(byChain).length > 1, [byChain]);

  return strictEntries(byChain).map(([chainId, rewards], index) => (
    <ClaimableChainRewards
      key={chainId}
      chainId={chainId}
      vaultId={vaultId}
      vaultRewards={rewards!}
      deposited={deposited}
      walletAddress={walletAddress}
      withChain={hasMultipleChains}
      withRefresh={index === 0}
    />
  ));
});

type ClaimableChainRewardsProps = {
  chainId: ChainId;
  vaultId: string;
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
  withChain?: boolean;
  withRefresh?: boolean;
};

const ClaimableChainRewards = memo<ClaimableChainRewardsProps>(function ClaimableChainRewards({
  chainId,
  vaultId,
  vaultRewards,
  walletAddress,
  deposited,
  withChain,
  withRefresh,
}) {
  const { t } = useTranslation();
  const chain = useAppSelector(state => selectChainById(state, chainId));
  const hasClaimable = useMemo(() => vaultRewards.some(r => r.amount.gt(BIG_ZERO)), [vaultRewards]);

  return (
    <Source
      key={chainId}
      title={t(
        withChain ? 'Transact-Claim-Rewards-stellaswap-chain' : 'Transact-Claim-Rewards-stellaswap',
        {
          chain: chain.name,
        }
      )}
      claim={
        hasClaimable ? (
          <Claim chainId={chainId} vaultId={vaultId} withChain={withChain} />
        ) : undefined
      }
      refresh={
        withRefresh ? (
          <UserRewardsRefreshButton walletAddress={walletAddress} vaultId={vaultId} />
        ) : undefined
      }
    >
      <RewardList rewards={vaultRewards} deposited={deposited} />
    </Source>
  );
});

type RewardsRefresherProps = {
  walletAddress: string;
  vaultId: string;
};

const AutomaticUserRewardsRefresher = memo<RewardsRefresherProps>(
  function AutomaticUserRewardsRefresher({ walletAddress, vaultId }) {
    const status = useUserRewardsLoader(walletAddress, vaultId, true);
    if (status.isError) {
      return <AlertWarning>{'Failed to fetch user rewards from StellaSwap API.'}</AlertWarning>;
    }

    return null;
  }
);

const UserRewardsRefreshButton = memo<RewardsRefresherProps>(function UserRewardsRefreshButton({
  walletAddress,
  vaultId,
}) {
  const { t } = useTranslation();
  const status = useUserRewardsLoader(walletAddress, vaultId, false);
  const canRefresh = status.canLoad && !!status.handleLoad;
  if (status.isLoaded && !canRefresh) {
    return null;
  }

  return (
    <RefreshButton
      title={t(
        status.isError
          ? 'Transact-Claim-Refresh-StellaSwap-Error'
          : status.isLoading
          ? 'Transact-Claim-Refresh-StellaSwap-Loading'
          : 'Transact-Claim-Refresh-StellaSwap-Loaded'
      )}
      text={
        status.isLoading
          ? undefined
          : canRefresh
          ? t('Transact-Claim-Refresh')
          : t('Transact-Claim-Refresh-Wait')
      }
      status={status.isError ? 'error' : status.isLoading ? 'loading' : 'loaded'}
      disabled={!canRefresh}
      onClick={status.handleLoad}
    />
  );
});
