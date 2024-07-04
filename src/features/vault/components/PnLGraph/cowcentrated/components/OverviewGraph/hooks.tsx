import { useMemo } from 'react';
import { useAppSelector } from '../../../../../../../store';
import { type VaultEntity } from '../../../../../../data/entities/vault';
import {
  selectCowcentratedLikeVaultDepositTokensWithPrices,
  selectDepositTokenByVaultId,
  selectTokenPriceByTokenOracleId,
} from '../../../../../../data/selectors/tokens';
import { selectWalletAddress } from '../../../../../../data/selectors/wallet';
import { maxBy, minBy } from 'lodash-es';
import { getClmInvestorTimeSeries } from '../../../../../../../helpers/timeserie';
import { isCLMTimelineAnalyticsEntity } from '../../../../../../data/entities/analytics';
import { useOracleIdToUsdPrices } from '../../../../../../data/hooks/historical';
import type { GraphBucket } from '../../../../../../../helpers/graph';
import { useVaultPeriods } from '../../../standard/hooks';
import { selectUserVaultBalanceInShareTokenIncludingBoostsBridged } from '../../../../../../data/selectors/balance';
import {
  selectClmPnl,
  selectUserDepositedTimelineByVaultId,
} from '../../../../../../data/selectors/analytics';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], minUsd: 0, maxUsd: 0 };

export const usePnLChartData = (
  timebucket: GraphBucket,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
  );
  const currentSharePrice = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );
  const currentShareBalance = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenIncludingBoostsBridged(state, vaultId, walletAddress)
  );
  const { token0AtDeposit, token1AtDeposit } = useAppSelector(state =>
    selectClmPnl(state, vaultId, address)
  );
  const { token0, token1 } = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokensWithPrices(state, vaultId)
  );
  const { data: sharesToUsd, loading: sharesToUsdLoading } = useOracleIdToUsdPrices(
    depositToken.oracleId,
    timebucket
  );
  const { data: token0ToUsd, loading: token0ToUsdLoading } = useOracleIdToUsdPrices(
    token0.oracleId,
    timebucket
  );
  const { data: token1ToUsd, loading: token1ToUsdLoading } = useOracleIdToUsdPrices(
    token1.oracleId,
    timebucket
  );
  const isLoading = sharesToUsdLoading || token0ToUsdLoading || token1ToUsdLoading;

  const chartData = useMemo(() => {
    if (
      !isLoading &&
      isCLMTimelineAnalyticsEntity(vaultTimeline) &&
      vaultTimeline.current.length &&
      sharesToUsd &&
      token0ToUsd &&
      token1ToUsd &&
      sharesToUsd.length > 0 &&
      token0ToUsd.length > 0 &&
      token1ToUsd.length > 0
    ) {
      const vaultLastDeposit = vaultTimeline.current[0].datetime;

      const data = getClmInvestorTimeSeries(
        timebucket,
        vaultTimeline.current,
        sharesToUsd,
        token0ToUsd,
        token1ToUsd,
        vaultLastDeposit,
        currentSharePrice,
        currentShareBalance,
        token0AtDeposit,
        token1AtDeposit,
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
    isLoading,
    currentShareBalance,
    currentSharePrice,
    timebucket,
    token0.price,
    token0AtDeposit,
    token1.price,
    token1AtDeposit,
    sharesToUsd,
    vaultTimeline,
    token0ToUsd,
    token1ToUsd,
  ]);

  return { chartData, isLoading };
};

/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export const useVaultPeriodsOverviewGraph = useVaultPeriods;
