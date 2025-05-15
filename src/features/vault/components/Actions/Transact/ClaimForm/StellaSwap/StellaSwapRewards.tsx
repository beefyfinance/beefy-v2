import { groupBy } from 'lodash-es';
import { memo, useCallback, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../../components/Alerts/Alerts.tsx';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import { strictEntries } from '../../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../data/store/hooks.ts';
import { fetchUserStellaSwapRewardsAction } from '../../../../../../data/actions/user-rewards/stellaswap-user-rewards.ts';
import type { ChainEntity, ChainId } from '../../../../../../data/entities/chain.ts';
import { type VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../../../data/selectors/chains.ts';
import {
  selectStellaSwapUserRewardsStatus,
  selectUserStellaSwapUnifiedRewardsForVault,
  type UnifiedReward,
} from '../../../../../../data/selectors/user-rewards.ts';
import { isNonEmptyArray, type NonEmptyArray } from '../../../../../../data/utils/array-utils.ts';
import { RefreshButton } from '../RefreshButton/RefreshButton.tsx';
import { RewardList } from '../RewardList.tsx';
import { Source } from '../Source/Source.tsx';
import { Claim } from './Claim/Claim.tsx';

function useUserRewardsLoader(walletAddress: string, autoRefresh: boolean) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectStellaSwapUserRewardsStatus(state, walletAddress));
  const handleRefresh = useCallback(() => {
    dispatch(fetchUserStellaSwapRewardsAction({ walletAddress }));
  }, [dispatch, walletAddress]);

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

export const StellaSwapRewards = memo(function StellaSwapRewards({
  vaultId,
  chainId,
  walletAddress,
  deposited,
}: StellaSwapRewardsProps) {
  const { t } = useTranslation();
  const vaultRewards = useAppSelector(state =>
    selectUserStellaSwapUnifiedRewardsForVault(state, vaultId, walletAddress)
  );
  const hasClaimable = useMemo(
    () => !!walletAddress && !!vaultRewards && vaultRewards.some(r => r.amount.gt(BIG_ZERO)),
    [vaultRewards, walletAddress]
  );

  if (!isNonEmptyArray(vaultRewards)) {
    return walletAddress ? <AutomaticUserRewardsRefresher walletAddress={walletAddress} /> : null;
  }

  return (
    <>
      {hasClaimable && walletAddress ?
        <ClaimableRewards
          vaultChainId={chainId}
          vaultId={vaultId}
          vaultRewards={vaultRewards}
          walletAddress={walletAddress}
          deposited={deposited}
        />
      : <Source
          key={chainId}
          title={t('Transact-Claim-Rewards-stellaswap')}
          refresh={
            walletAddress ? <UserRewardsRefreshButton walletAddress={walletAddress} /> : undefined
          }
        >
          <RewardList chainId={chainId} rewards={vaultRewards} deposited={deposited} />
        </Source>
      }
    </>
  );
});

type ClaimableRewardsProps = {
  vaultChainId: ChainId;
  vaultId: string;
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
};

const ClaimableRewards = memo(function ClaimableRewards({
  vaultId,
  vaultRewards,
  walletAddress,
  deposited,
  vaultChainId,
}: ClaimableRewardsProps) {
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
      vaultChainId={vaultChainId}
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
  vaultChainId: ChainId;
  vaultId: string;
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
  withChain?: boolean;
  withRefresh?: boolean;
};

const ClaimableChainRewards = memo(function ClaimableChainRewards({
  chainId,
  vaultId,
  vaultChainId,
  vaultRewards,
  walletAddress,
  deposited,
  withChain,
  withRefresh,
}: ClaimableChainRewardsProps) {
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
        hasClaimable ?
          <Claim chainId={chainId} vaultId={vaultId} withChain={withChain} />
        : undefined
      }
      refresh={withRefresh ? <UserRewardsRefreshButton walletAddress={walletAddress} /> : undefined}
    >
      <RewardList chainId={vaultChainId} rewards={vaultRewards} deposited={deposited} />
    </Source>
  );
});

type RewardsRefresherProps = {
  walletAddress: string;
};

const AutomaticUserRewardsRefresher = memo(function AutomaticUserRewardsRefresher({
  walletAddress,
}: RewardsRefresherProps) {
  const status = useUserRewardsLoader(walletAddress, true);
  if (status.isError) {
    return <AlertWarning>{'Failed to fetch user rewards from StellaSwap API.'}</AlertWarning>;
  }

  return null;
});

const UserRewardsRefreshButton = memo(function UserRewardsRefreshButton({
  walletAddress,
}: RewardsRefresherProps) {
  const { t } = useTranslation();
  const status = useUserRewardsLoader(walletAddress, false);
  const canRefresh = status.canLoad && !!status.handleLoad;
  if (status.isLoaded && !canRefresh) {
    return null;
  }

  return (
    <RefreshButton
      title={t(
        status.isError ? 'Transact-Claim-Refresh-StellaSwap-Error'
        : status.isLoading ? 'Transact-Claim-Refresh-StellaSwap-Loading'
        : 'Transact-Claim-Refresh-StellaSwap-Loaded'
      )}
      text={
        status.isLoading ? undefined
        : canRefresh ?
          t('Transact-Claim-Refresh')
        : t('Transact-Claim-Refresh-Wait')
      }
      status={
        status.isError ? 'error'
        : status.isLoading ?
          'loading'
        : 'loaded'
      }
      disabled={!canRefresh}
      onClick={status.handleLoad}
    />
  );
});
