import { groupBy, keyBy } from 'lodash-es';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AlertWarning } from '../../../../../../../components/Alerts/Alerts.tsx';
import { BIG_ZERO } from '../../../../../../../helpers/big-number.ts';
import { formatUsd } from '../../../../../../../helpers/format.ts';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { strictEntries } from '../../../../../../../helpers/object.ts';
import { useAppDispatch, useAppSelector } from '../../../../../../data/store/hooks.ts';
import ExpandLess from '../../../../../../../images/icons/mui/ExpandLess.svg?react';
import ExpandMore from '../../../../../../../images/icons/mui/ExpandMore.svg?react';
import { fetchUserMerklRewardsAction } from '../../../../../../data/actions/user-rewards/merkl-user-rewards.ts';
import type { ChainEntity, ChainId } from '../../../../../../data/entities/chain.ts';
import { type VaultEntity } from '../../../../../../data/entities/vault.ts';
import { selectChainById } from '../../../../../../data/selectors/chains.ts';
import {
  selectMerklUserRewardsStatus,
  selectUserMerklUnifiedRewardsForChain,
  selectUserMerklUnifiedRewardsForVault,
  type UnifiedReward,
} from '../../../../../../data/selectors/user-rewards.ts';
import { isNonEmptyArray, type NonEmptyArray } from '../../../../../../data/utils/array-utils.ts';
import { RefreshButton } from '../RefreshButton/RefreshButton.tsx';
import { RewardList } from '../RewardList.tsx';
import { Source } from '../Source/Source.tsx';
import { Claim } from './Claim/Claim.tsx';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

function useUserRewardsLoader(walletAddress: string, autoRefresh: boolean) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state => selectMerklUserRewardsStatus(state, walletAddress));
  const handleRefresh = useCallback(() => {
    dispatch(fetchUserMerklRewardsAction({ walletAddress }));
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

type MerklRewardsProps = {
  vaultId: VaultEntity['id'];
  chainId: ChainEntity['id'];
  walletAddress?: string;
  deposited: boolean;
};

export const MerklRewards = memo(function MerklRewards({
  vaultId,
  chainId,
  walletAddress,
  deposited,
}: MerklRewardsProps) {
  const { t } = useTranslation();
  const vaultRewards = useAppSelector(state =>
    selectUserMerklUnifiedRewardsForVault(state, vaultId, walletAddress)
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
          vaultRewards={vaultRewards}
          walletAddress={walletAddress}
          deposited={deposited}
        />
      : <Source
          key={chainId}
          title={t('Transact-Claim-Rewards-merkl')}
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
  vaultChainId: ChainEntity['id'];
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
};

const ClaimableRewards = memo(function ClaimableRewards({
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
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
  withChain?: boolean;
  withRefresh?: boolean;
};

const ClaimableChainRewards = memo(function ClaimableChainRewards({
  chainId,
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
      title={t(withChain ? 'Transact-Claim-Rewards-merkl-chain' : 'Transact-Claim-Rewards-merkl', {
        chain: chain.name,
      })}
      claim={hasClaimable ? <Claim chainId={chainId} withChain={withChain} /> : undefined}
      refresh={withRefresh ? <UserRewardsRefreshButton walletAddress={walletAddress} /> : undefined}
    >
      <RewardList chainId={vaultChainId} rewards={vaultRewards} deposited={deposited} />
      {hasClaimable ?
        <OtherRewards chainId={chainId} vaultRewards={vaultRewards} walletAddress={walletAddress} />
      : undefined}
    </Source>
  );
});

type OtherRewardsProps = {
  chainId: ChainEntity['id'];
  vaultRewards: UnifiedReward[] | undefined;
  walletAddress: string;
};

const OtherRewards = memo(function OtherRewards({
  chainId,
  vaultRewards,
  walletAddress,
}: OtherRewardsProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [otherOpen, setOtherOpen] = useState<boolean>(false);
  const chainRewards = useAppSelector(state =>
    selectUserMerklUnifiedRewardsForChain(state, chainId, walletAddress)
  );
  const otherRewards = useMemo(() => {
    if (!chainRewards) {
      return undefined;
    }
    if (!vaultRewards) {
      return chainRewards;
    }

    const vaultRewardsByToken = keyBy(vaultRewards, r => r.token.address);
    return chainRewards
      .map(reward => ({
        ...reward,
        amount: reward.amount.minus(vaultRewardsByToken[reward.token.address]?.amount || 0),
      }))
      .filter(reward => reward.amount.gt(BIG_ZERO));
  }, [vaultRewards, chainRewards]);
  const otherRewardsUsd = useMemo(() => {
    return otherRewards ?
        otherRewards.reduce((sum, reward) => {
          return sum.plus(reward.price ? reward.price.multipliedBy(reward.amount) : BIG_ZERO);
        }, BIG_ZERO)
      : BIG_ZERO;
  }, [otherRewards]);
  const onToggle = useCallback(() => {
    setOtherOpen(v => !v);
  }, [setOtherOpen]);

  if (!otherRewards || otherRewards.length === 0) {
    return null;
  }

  return (
    <div className={classes.otherRewards}>
      <button type="button" onClick={onToggle} className={classes.otherRewardsToggle}>
        {t('Rewards-OtherRewards', { value: formatUsd(otherRewardsUsd) })}
        {otherOpen ?
          <ExpandLess className={classes.otherRewardsToggleIcon} viewBox="5 7.59 16.43 9.41" />
        : <ExpandMore className={classes.otherRewardsToggleIcon} viewBox="5 7.59 16.43 9.41" />}
      </button>
      {otherOpen ?
        <RewardList chainId={chainId} rewards={otherRewards} deposited={false} />
      : null}
    </div>
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
    return <AlertWarning>{'Failed to fetch user rewards from Merkl API.'}</AlertWarning>;
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
        status.isError ? 'Transact-Claim-Refresh-Merkl-Error'
        : status.isLoading ? 'Transact-Claim-Refresh-Merkl-Loading'
        : 'Transact-Claim-Refresh-Merkl-Loaded'
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
