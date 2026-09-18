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
  getCowcentratedWrapperIds,
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../../../../../../data/entities/vault.ts';
import {
  useVaultIdToClassicPriceHistory,
  useVaultIdToClmPriceHistory,
} from '../../../../../../data/hooks/analytics.ts';
import { useOracleIdToUsdPrices } from '../../../../../../data/hooks/historical.ts';
import {
  selectClmFirstDepositDate,
  selectClmPnl,
  selectHeldClmSideIds,
  selectUserDepositedTimelineByVaultId,
} from '../../../../../../data/selectors/analytics.ts';
import { useClmGroupScope } from '../../../../ClmMode/ClmModeContext.tsx';
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
import { usePeriodsSince } from '../../../standard/hooks.ts';

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

const NO_SIDE_IDS: VaultEntity['id'][] = [];

/**
 * The sides a CLM chart draws, and whether the CLM-token line is one of them. In group scope (the
 * merged vault page, a dashboard CLM row) it charts the sides the address holds, so chart and
 * header describe the same position; elsewhere one side charts itself — the bare CLM as a pool.
 * Holding nothing falls back to every side, which is all history and no live position.
 */
export function useClmChartSides(vaultId: VaultEntity['id'], walletAddress: string | undefined) {
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const wholeGroup = useClmGroupScope();
  const held = useAppSelector(state =>
    wholeGroup && walletAddress ? selectHeldClmSideIds(state, vaultId, walletAddress) : NO_SIDE_IDS
  );

  return useMemo(() => {
    const { cowcentratedIds: ids } = vault;
    if (!wholeGroup) {
      const isVaultSide = isCowcentratedStandardVault(vault);
      return {
        vaultSideId: isVaultSide ? vault.id : undefined,
        poolSideId: isVaultSide ? undefined : vault.id,
        type: isVaultSide ? ('vault' as const) : ('pool' as const),
      };
    }
    const sides = held.length ? held : getCowcentratedWrapperIds(vault);
    const vaultSideId = sides.find(id => ids.vaults.includes(id));
    const poolSideId = sides.find(id => ids.pools.includes(id));
    return {
      vaultSideId,
      poolSideId,
      type: vaultSideId && !poolSideId ? ('vault' as const) : ('pool' as const),
    };
  }, [vault, wholeGroup, held]);
}

export const usePnLChartData = (
  timeBucket: GraphBucket,
  vaultId: VaultEntity['id'],
  address?: string
) => {
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

  const { vaultSideId, poolSideId, type } = useClmChartSides(vaultId, walletAddress);
  const vaultSide = useSideSeries(vaultSideId, walletAddress, timeBucket, shared);
  const poolSide = useSideSeries(poolSideId, walletAddress, timeBucket, shared);

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

  return { chartData, isLoading, willRetry, type };
};

/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export const useVaultPeriodsOverviewGraph = (vaultId: VaultEntity['id'], address: string) => {
  const wholeGroup = useClmGroupScope();
  const firstDepositDate = useAppSelector(state =>
    selectClmFirstDepositDate(state, vaultId, address, wholeGroup)
  );
  return usePeriodsSince(firstDepositDate);
};
