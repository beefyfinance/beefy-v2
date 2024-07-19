import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core';
import { groupBy, keyBy } from 'lodash-es';
import { type VaultEntity } from '../../../../../../data/entities/vault';
import {
  selectUserMerklUnifiedRewardsForChain,
  selectUserMerklUnifiedRewardsForVault,
  type UnifiedReward,
} from '../../../../../../data/selectors/user-rewards';
import { useAppDispatch, useAppSelector } from '../../../../../../../store';
import type { ChainEntity, ChainId } from '../../../../../../data/entities/chain';
import { formatUsd } from '../../../../../../../helpers/format';
import { BIG_ZERO } from '../../../../../../../helpers/big-number';
import { Claim } from './Claim/Claim';
import { styles } from './styles';
import { RewardList } from '../RewardList/RewardList';
import { Source } from '../Source/Source';
import { isNonEmptyArray, type NonEmptyArray } from '../../../../../../data/utils/array-utils';
import { selectChainById } from '../../../../../../data/selectors/chains';
import { strictEntries } from '../../../../../../../helpers/object';
import { selectMerklUserRewardsStatus } from '../../../../../../data/selectors/data-loader';
import { fetchUserMerklRewardsAction } from '../../../../../../data/actions/user-rewards';
import { AlertWarning } from '../../../../../../../components/Alerts';
import { RefreshButton } from '../RefreshButton/RefreshButton';

const useStyles = makeStyles(styles);

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

export const MerklRewards = memo<MerklRewardsProps>(function MerklRewards({
  vaultId,
  chainId,
  walletAddress,
  deposited,
}) {
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
      {hasClaimable && walletAddress ? (
        <ClaimableRewards
          vaultRewards={vaultRewards}
          walletAddress={walletAddress}
          deposited={deposited}
        />
      ) : (
        <Source
          key={chainId}
          title={t('Transact-Claim-Rewards-merkl')}
          refresh={
            walletAddress ? <UserRewardsRefreshButton walletAddress={walletAddress} /> : undefined
          }
        >
          <RewardList rewards={vaultRewards} deposited={deposited} />
        </Source>
      )}
    </>
  );
});

type ClaimableRewardsProps = {
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
};

const ClaimableRewards = memo<ClaimableRewardsProps>(function ClaimableRewards({
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
  vaultRewards: NonEmptyArray<UnifiedReward>;
  walletAddress: string;
  deposited: boolean;
  withChain?: boolean;
  withRefresh?: boolean;
};

const ClaimableChainRewards = memo<ClaimableChainRewardsProps>(function ClaimableChainRewards({
  chainId,
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
      title={t(withChain ? 'Transact-Claim-Rewards-merkl-chain' : 'Transact-Claim-Rewards-merkl', {
        chain: chain.name,
      })}
      claim={hasClaimable ? <Claim chainId={chainId} withChain={withChain} /> : undefined}
      refresh={withRefresh ? <UserRewardsRefreshButton walletAddress={walletAddress} /> : undefined}
    >
      <RewardList rewards={vaultRewards} deposited={deposited} />
      {hasClaimable ? (
        <OtherRewards chainId={chainId} vaultRewards={vaultRewards} walletAddress={walletAddress} />
      ) : undefined}
    </Source>
  );
});

type OtherRewardsProps = {
  chainId: ChainEntity['id'];
  vaultRewards: UnifiedReward[] | undefined;
  walletAddress: string;
};

const OtherRewards = memo<OtherRewardsProps>(function OtherRewards({
  chainId,
  vaultRewards,
  walletAddress,
}) {
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
    return otherRewards
      ? otherRewards.reduce((sum, reward) => {
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
      <button onClick={onToggle} className={classes.otherRewardsToggle}>
        {t('Rewards-OtherRewards', { value: formatUsd(otherRewardsUsd) })}
        {otherOpen ? (
          <ExpandLess className={classes.otherRewardsToggleIcon} viewBox="5 7.59 16.43 9.41" />
        ) : (
          <ExpandMore className={classes.otherRewardsToggleIcon} viewBox="5 7.59 16.43 9.41" />
        )}
      </button>
      {otherOpen ? (
        <RewardList className={classes.otherRewardsList} rewards={otherRewards} deposited={false} />
      ) : null}
    </div>
  );
});

type RewardsRefresherProps = {
  walletAddress: string;
};

const AutomaticUserRewardsRefresher = memo<RewardsRefresherProps>(
  function AutomaticUserRewardsRefresher({ walletAddress }) {
    const status = useUserRewardsLoader(walletAddress, true);
    if (status.isError) {
      return <AlertWarning>{'Failed to fetch user rewards from Merkl API.'}</AlertWarning>;
    }

    return null;
  }
);

const UserRewardsRefreshButton = memo<RewardsRefresherProps>(function UserRewardsRefreshButton({
  walletAddress,
}) {
  const { t } = useTranslation();
  const status = useUserRewardsLoader(walletAddress, false);
  const canRefresh = status.canLoad && !!status.handleLoad;
  if (status.isLoaded && !canRefresh) {
    return null;
  }

  return (
    <RefreshButton
      title={t(
        status.isError
          ? 'Transact-Claim-Refresh-Merkl-Error'
          : status.isLoading
          ? 'Transact-Claim-Refresh-Merkl-Loading'
          : 'Transact-Claim-Refresh-Merkl-Loaded'
      )}
      text={
        canRefresh
          ? t('Transact-Claim-Refresh')
          : !status.isLoading
          ? t('Transact-Claim-Refresh-Wait')
          : undefined
      }
      status={status.isError ? 'error' : status.isLoading ? 'loading' : 'loaded'}
      disabled={!canRefresh}
      onClick={status.handleLoad}
    />
  );
});
