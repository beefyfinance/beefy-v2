import { useEffect, useMemo } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../../store';
import type { TimeBucketType } from '../../../../../data/apis/analytics/analytics-types';
import type { VaultEntity } from '../../../../../data/entities/vault';
import {
  selectUserFirstDepositDateByVaultId,
  selectUnderlyingToUsdTimebucketByVaultId,
  selectUserDepositedTimelineByVaultId,
  selectClmPnl,
  selectUserClmHarvestTimelineByVaultId,
} from '../../../../../data/selectors/analytics';
import { selectUserVaultBalanceInShareTokenIncludingBoostsBridged } from '../../../../../data/selectors/balance';
import {
  selectCowcentratedVaultDepositTokensWithPrices,
  selectTokenPriceByAddress,
} from '../../../../../data/selectors/tokens';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { selectWalletAddress } from '../../../../../data/selectors/wallet';
import { fetchClmUnderlyingToUsd } from '../../../../../data/actions/analytics';
import { eachDayOfInterval, isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash';
import { getClmInvestorTimeserie } from '../../../../../../helpers/timeserie';
import type { CLMTimelineAnalyticsEntity } from '../../../../../data/entities/analytics';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], minUsd: 0, maxUsd: 0 };

export const usePnLChartData = (
  timebucket: TimeBucketType,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const dispatch = useAppDispatch();
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));

  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
  );
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const currentOraclePrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const currentMooTokenBalance = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenIncludingBoostsBridged(state, vault.id, walletAddress)
  );
  const vaultLastDeposit = useAppSelector(state =>
    selectUserFirstDepositDateByVaultId(state, vaultId, walletAddress)
  );

  const { data: underlyingToUsd, status: underlyingStatus } = useAppSelector(state =>
    selectUnderlyingToUsdTimebucketByVaultId(state, vaultId, timebucket, walletAddress)
  );

  const { token0SharesAtDeposit, token1SharesAtDeposit } = useAppSelector(state =>
    selectClmPnl(state, vaultId, address)
  );

  const { token0, token1 } = useAppSelector(state =>
    selectCowcentratedVaultDepositTokensWithPrices(state, vaultId)
  );
  const userHarvestTimeline = useAppSelector(state =>
    selectUserClmHarvestTimelineByVaultId(state, vaultId, walletAddress)
  );

  useEffect(() => {
    if (walletAddress) {
      if (underlyingStatus === 'idle') {
        dispatch(
          fetchClmUnderlyingToUsd({
            vaultId,
            walletAddress,
            timebucket,
          })
        );
      }

      if (underlyingStatus === 'rejected') {
        const handleUnderlyingToUsd = setTimeout(
          () =>
            dispatch(
              fetchClmUnderlyingToUsd({
                vaultId,
                walletAddress,
                timebucket,
              })
            ),
          5000
        );
        return () => clearTimeout(handleUnderlyingToUsd);
      }
    }
  }, [dispatch, timebucket, underlyingStatus, vaultId, walletAddress]);

  const isLoading = useMemo(() => {
    return underlyingStatus !== 'fulfilled' || !userHarvestTimeline;
  }, [underlyingStatus, userHarvestTimeline]);

  const chartData = useMemo(() => {
    if (
      underlyingStatus === 'fulfilled' &&
      vaultTimeline &&
      vaultTimeline.length &&
      underlyingToUsd &&
      vaultLastDeposit &&
      userHarvestTimeline &&
      userHarvestTimeline.harvests.length > 0
    ) {
      const filteredUnderlyingToUsd = underlyingToUsd.filter(price =>
        isAfter(price.date, vaultLastDeposit)
      );

      const filteredHarvests = userHarvestTimeline.harvests.filter(harvest =>
        isAfter(harvest.timestamp, vaultLastDeposit)
      );

      const data = getClmInvestorTimeserie(
        timebucket,
        vaultTimeline as CLMTimelineAnalyticsEntity[],
        filteredHarvests,
        filteredUnderlyingToUsd,
        vaultLastDeposit,
        currentOraclePrice,
        currentMooTokenBalance,
        token0SharesAtDeposit,
        token1SharesAtDeposit,
        token0.price,
        token1.price
      );

      if (data && data.length > 0) {
        const minV0Usd = minBy(data, 'v')?.v || 0;
        const minV1Usd = minBy(data, 'v')?.v || 0;

        const maxV0Usd = maxBy(data, 'vHold')?.vHold || 0;
        const maxV1Usd = maxBy(data, 'vHold')?.vHold || 0;

        const minUsd = minV0Usd < minV1Usd ? minV0Usd : minV1Usd;
        const maxUsd = maxV0Usd > maxV1Usd ? maxV0Usd : maxV1Usd;

        return { data, minUsd, maxUsd };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [
    currentMooTokenBalance,
    currentOraclePrice,
    timebucket,
    token0.price,
    token0SharesAtDeposit,
    token1.price,
    token1SharesAtDeposit,
    underlyingStatus,
    underlyingToUsd,
    userHarvestTimeline,
    vaultLastDeposit,
    vaultTimeline,
  ]);

  return { chartData, isLoading };
};

export const useVaultPeriodsOverviewGraph = (vaultId: VaultEntity['id'], address?: string) => {
  const vaultDepositDate = useAppSelector(state =>
    selectUserFirstDepositDateByVaultId(state, vaultId, address)
  );
  const currentDate = new Date();

  const result = eachDayOfInterval({
    start: vaultDepositDate || currentDate,
    end: currentDate,
  });

  return useMemo(() => {
    if (result.length > 30) return ['1D', '1W', '1M', 'ALL'];
    if (result.length > 7) return ['1D', '1W', 'ALL'];
    if (result.length > 1) return ['1D', 'ALL'];
    if (result.length === 1) return ['1D'];
    return [];
  }, [result.length]);
};
