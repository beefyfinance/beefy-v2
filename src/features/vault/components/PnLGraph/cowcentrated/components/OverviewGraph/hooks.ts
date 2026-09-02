import type BigNumber from 'bignumber.js';
import { useMemo } from 'react';
import { BIG_ONE } from '../../../../../../../helpers/big-number.ts';
import { maxOf, minOf } from '../../../../../../../helpers/collection.ts';
import {
  type ClmInvestorOverviewTimeSeriesPoint,
  getClmInvestorTimeSeries,
  mergeClmOverviewTimeSeries,
} from '../../../../../../../helpers/graph/timeseries.ts';
import type { ApiChartData } from '../../../../../../data/apis/beefy/beefy-data-api-types.ts';
import type { GraphBucket } from '../../../../../../../helpers/graph/types.ts';
import { useAppSelector } from '../../../../../../data/store/hooks.ts';
import { isTimelineEntityCowcentrated } from '../../../../../../data/entities/analytics.ts';
import {
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../../../../../../data/entities/vault.ts';
import {
  useVaultIdToClassicPriceHistory,
  useVaultIdToClmPriceHistory,
} from '../../../../../../data/hooks/analytics.ts';
import { useOracleIdToUsdPrices } from '../../../../../../data/hooks/historical.ts';
import {
  selectClmPnl,
  selectUserDepositedTimelineByVaultId,
} from '../../../../../../data/selectors/analytics.ts';
import {
  selectCowcentratedLikeVaultDepositTokensWithPrices,
  selectDepositTokenByVaultId,
  selectTokenPriceByTokenOracleId,
} from '../../../../../../data/selectors/tokens.ts';
import {
  selectCowcentratedLikeVaultById,
  selectVaultByIdOrUndefined,
  selectVaultPricePerFullShare,
} from '../../../../../../data/selectors/vaults.ts';
import { selectWalletAddress } from '../../../../../../data/selectors/wallet.ts';
import { useVaultPeriods } from '../../../standard/hooks.ts';

// Same object reference so a side with no data does not re-render its consumers
const NO_POINTS: ClmInvestorOverviewTimeSeriesPoint[] = [];

// Same object reference for empty chart data
const NO_CHART_DATA = {
  data: [],
  minUsd: 0,
  maxUsd: 0,
  minUnderlying: 0,
  maxUnderlying: 0,
  type: 'pool',
};

/** one side's series, or an empty one when that side is absent or unheld */
function useSideSeries(
  sideId: VaultEntity['id'] | undefined,
  walletAddress: string | undefined,
  timeBucket: GraphBucket,
  shared: {
    underlyingToUsd: ApiChartData | undefined;
    token0ToUsd: ApiChartData | undefined;
    token1ToUsd: ApiChartData | undefined;
    nowPriceUnderlying: BigNumber;
    nowPriceToken0: BigNumber;
    nowPriceToken1: BigNumber;
    isLoading: boolean;
  }
) {
  const vault = useAppSelector(state =>
    sideId ? selectVaultByIdOrUndefined(state, sideId) : undefined
  );
  const isVaultSide = !!vault && isCowcentratedStandardVault(vault);
  const {
    data: clmHistory,
    loading: clmHistoryLoading,
    willRetry: clmHistoryWillRetry,
  } = useVaultIdToClmPriceHistory(
    vault ?
      isVaultSide ? vault.cowcentratedIds.clm
      : vault.id
    : undefined,
    timeBucket
  );
  const {
    data: vaultHistory,
    loading: vaultHistoryLoading,
    willRetry: vaultHistoryWillRetry,
  } = useVaultIdToClassicPriceHistory(isVaultSide ? sideId : undefined, timeBucket);
  const timeline = useAppSelector(state =>
    sideId ? selectUserDepositedTimelineByVaultId(state, sideId, walletAddress) : undefined
  );
  const ppfs = useAppSelector(state =>
    sideId ? selectVaultPricePerFullShare(state, sideId) : BIG_ONE
  );
  const pnl = useAppSelector(state =>
    sideId && walletAddress ? selectClmPnl(state, sideId, walletAddress) : undefined
  );

  const isLoading = shared.isLoading || clmHistoryLoading || vaultHistoryLoading;
  const willRetry = clmHistoryWillRetry || vaultHistoryWillRetry;

  const points = useMemo(() => {
    if (
      isLoading ||
      !pnl ||
      !isTimelineEntityCowcentrated(timeline) ||
      !timeline.current.length ||
      !shared.underlyingToUsd?.length ||
      !shared.token0ToUsd?.length ||
      !shared.token1ToUsd?.length
    ) {
      return NO_POINTS;
    }

    return getClmInvestorTimeSeries(
      timeBucket,
      timeline.current,
      shared.underlyingToUsd,
      shared.token0ToUsd,
      shared.token1ToUsd,
      timeline.current[0].datetime,
      pnl.shares.now.amount,
      pnl.underlying.now.amount,
      pnl.tokens[0].now.amount,
      pnl.tokens[1].now.amount,
      ppfs,
      shared.nowPriceUnderlying,
      shared.nowPriceToken0,
      shared.nowPriceToken1,
      clmHistory,
      isVaultSide ? vaultHistory : undefined
    );
  }, [isLoading, pnl, timeline, shared, timeBucket, ppfs, clmHistory, vaultHistory, isVaultSide]);

  return { points, isLoading, willRetry, isVaultSide };
}

export const usePnLChartData = (
  timeBucket: GraphBucket,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const nowPriceUnderlying = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );
  const [token0, token1] = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokensWithPrices(state, vaultId)
  );

  // both sides wrap the same CLM, so the oracle series are shared and fetched once
  const {
    data: underlyingToUsd,
    loading: underlyingToUsdLoading,
    willRetry: underlyingToUsdWillRetry,
  } = useOracleIdToUsdPrices(depositToken.oracleId, timeBucket);
  const {
    data: token0ToUsd,
    loading: token0ToUsdLoading,
    willRetry: token0ToUsdWillRetry,
  } = useOracleIdToUsdPrices(token0.oracleId, timeBucket);
  const {
    data: token1ToUsd,
    loading: token1ToUsdLoading,
    willRetry: token1ToUsdWillRetry,
  } = useOracleIdToUsdPrices(token1.oracleId, timeBucket);

  const shared = useMemo(
    () => ({
      underlyingToUsd,
      token0ToUsd,
      token1ToUsd,
      nowPriceUnderlying,
      nowPriceToken0: token0.price,
      nowPriceToken1: token1.price,
      isLoading: underlyingToUsdLoading || token0ToUsdLoading || token1ToUsdLoading,
    }),
    [
      underlyingToUsd,
      token0ToUsd,
      token1ToUsd,
      nowPriceUnderlying,
      token0.price,
      token1.price,
      underlyingToUsdLoading,
      token0ToUsdLoading,
      token1ToUsdLoading,
    ]
  );

  // the whole CLM position: the yield toggle routes deposits, it does not scope performance
  const { vault: vaultSideId, pool: poolSideId } = vault.cowcentratedIds;
  const vaultSide = useSideSeries(
    vaultSideId ?? vault.cowcentratedIds.vaults[0],
    walletAddress,
    timeBucket,
    shared
  );
  const poolSide = useSideSeries(
    poolSideId ?? vault.cowcentratedIds.pools[0],
    walletAddress,
    timeBucket,
    shared
  );

  const isLoading = vaultSide.isLoading || poolSide.isLoading;
  const willRetry =
    underlyingToUsdWillRetry ||
    token0ToUsdWillRetry ||
    token1ToUsdWillRetry ||
    vaultSide.willRetry ||
    poolSide.willRetry;

  const chartData = useMemo(() => {
    const data = mergeClmOverviewTimeSeries([vaultSide.points, poolSide.points]);
    if (!data.length) {
      return NO_CHART_DATA;
    }

    return {
      data,
      minUsd: minOf(data, 'underlyingUsd', 'heldUsd'),
      maxUsd: maxOf(data, 'underlyingUsd', 'heldUsd'),
      minUnderlying: minOf(data, 'underlying'),
      maxUnderlying: maxOf(data, 'underlying'),
    };
  }, [vaultSide.points, poolSide.points]);

  // the CLM-token line only reads true while the autocompounding side is the only one held
  const type = vaultSide.points.length && !poolSide.points.length ? 'vault' : 'pool';

  return { chartData, isLoading, willRetry, type };
};

/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export const useVaultPeriodsOverviewGraph = useVaultPeriods;
