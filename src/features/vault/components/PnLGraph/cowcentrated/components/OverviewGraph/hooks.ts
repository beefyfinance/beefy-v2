import { useMemo } from 'react';
import { maxOf, minOf } from '../../../../../../../helpers/collection.ts';
import { getClmInvestorTimeSeries } from '../../../../../../../helpers/graph/timeseries.ts';
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
  selectStandardCowcentratedVaultById,
  selectVaultPricePerFullShare,
} from '../../../../../../data/selectors/vaults.ts';
import { selectWalletAddress } from '../../../../../../data/selectors/wallet.ts';
import { useVaultPeriods } from '../../../standard/hooks.ts';

// Same object reference for empty chart data
const NO_CHART_DATA = {
  data: [],
  minUsd: 0,
  maxUsd: 0,
  minUnderlying: 0,
  maxUnderlying: 0,
  type: 'pool',
};

function useCowcentratedData(
  clmId: string,
  depositTokenOracleId: string,
  token0OracleId: string,
  token1OracleId: string,
  timeBucket: GraphBucket
) {
  const {
    data: underlyingToUsd,
    loading: underlyingToUsdLoading,
    willRetry: underlyingToUsdWillRetry,
  } = useOracleIdToUsdPrices(depositTokenOracleId, timeBucket);
  const {
    data: token0ToUsd,
    loading: token0ToUsdLoading,
    willRetry: token0ToUsdWillRetry,
  } = useOracleIdToUsdPrices(token0OracleId, timeBucket);
  const {
    data: token1ToUsd,
    loading: token1ToUsdLoading,
    willRetry: token1ToUsdWillRetry,
  } = useOracleIdToUsdPrices(token1OracleId, timeBucket);
  const {
    data: clmHistory,
    loading: clmHistoryLoading,
    willRetry: clmHistoryWillRetry,
  } = useVaultIdToClmPriceHistory(clmId, timeBucket);
  const isLoading =
    underlyingToUsdLoading || token0ToUsdLoading || token1ToUsdLoading || clmHistoryLoading;
  const willRetry =
    underlyingToUsdWillRetry || token0ToUsdWillRetry || token1ToUsdWillRetry || clmHistoryWillRetry;

  return useMemo(
    () => ({
      underlyingToUsd,
      token0ToUsd,
      token1ToUsd,
      clmHistory,
      vaultHistory: undefined,
      isLoading,
      willRetry,
      type: 'pool',
    }),
    [underlyingToUsd, token0ToUsd, token1ToUsd, clmHistory, isLoading, willRetry]
  );
}

function useCowcentratedPoolData(
  clmId: string,
  depositTokenOracleId: string,
  token0OracleId: string,
  token1OracleId: string,
  timeBucket: GraphBucket
) {
  // @ts-expect-error
  const _dummy1 = useMemo(() => clmId, [clmId]);
  // @ts-expect-error
  const _dummy2 = useMemo(() => clmId, [clmId]);
  return useCowcentratedData(
    clmId,
    depositTokenOracleId,
    token0OracleId,
    token1OracleId,
    timeBucket
  );
}

function useCowcentratedVaultData(
  vaultId: string,
  depositTokenOracleId: string,
  token0OracleId: string,
  token1OracleId: string,
  timeBucket: GraphBucket
) {
  const vault = useAppSelector(state => selectStandardCowcentratedVaultById(state, vaultId));
  const clmData = useCowcentratedData(
    vault.cowcentratedIds.clm,
    depositTokenOracleId,
    token0OracleId,
    token1OracleId,
    timeBucket
  );
  const {
    data: vaultHistory,
    loading: vaultHistoryLoading,
    willRetry: vaultHistoryWillRetry,
  } = useVaultIdToClassicPriceHistory(vaultId, timeBucket);

  return useMemo(
    () => ({
      ...clmData,
      vaultHistory,
      isLoading: clmData.isLoading || vaultHistoryLoading,
      willRetry: clmData.willRetry || vaultHistoryWillRetry,
      type: 'vault',
    }),
    [clmData, vaultHistory, vaultHistoryLoading, vaultHistoryWillRetry]
  );
}

export const usePnLChartData = (
  timeBucket: GraphBucket,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const vault = useAppSelector(state => selectCowcentratedLikeVaultById(state, vaultId));
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
  );
  const nowPricePerFullShare = useAppSelector(state =>
    selectVaultPricePerFullShare(state, vaultId)
  );
  const nowPriceUnderlying = useAppSelector(state =>
    selectTokenPriceByTokenOracleId(state, depositToken.oracleId)
  );
  const [token0, token1] = useAppSelector(state =>
    selectCowcentratedLikeVaultDepositTokensWithPrices(state, vaultId)
  );
  const nowPriceToken0 = token0.price;
  const nowPriceToken1 = token1.price;
  const clmPnl = useAppSelector(state => selectClmPnl(state, vaultId, walletAddress));
  const nowBalanceToken0 = clmPnl.tokens[0].now.amount;
  const nowBalanceToken1 = clmPnl.tokens[1].now.amount;
  const nowBalanceUnderlying = clmPnl.underlying.now.amount;
  const nowBalanceShares = clmPnl.shares.now.amount;
  const useData = useMemo(() => {
    return isCowcentratedStandardVault(vault) ? useCowcentratedVaultData : useCowcentratedPoolData;
  }, [vault]);
  const {
    underlyingToUsd,
    token0ToUsd,
    token1ToUsd,
    clmHistory,
    vaultHistory,
    isLoading,
    willRetry,
    type,
  } = useData(vault.id, depositToken.oracleId, token0.oracleId, token1.oracleId, timeBucket);

  const chartData = useMemo(() => {
    if (
      !isLoading &&
      isTimelineEntityCowcentrated(vaultTimeline) &&
      vaultTimeline.current.length &&
      underlyingToUsd &&
      token0ToUsd &&
      token1ToUsd &&
      underlyingToUsd.length > 0 &&
      token0ToUsd.length > 0 &&
      token1ToUsd.length > 0
    ) {
      const vaultLastDeposit = vaultTimeline.current[0].datetime;

      const data = getClmInvestorTimeSeries(
        timeBucket,
        vaultTimeline.current,
        underlyingToUsd,
        token0ToUsd,
        token1ToUsd,
        vaultLastDeposit,
        nowBalanceShares,
        nowBalanceUnderlying,
        nowBalanceToken0,
        nowBalanceToken1,
        nowPricePerFullShare,
        nowPriceUnderlying,
        nowPriceToken0,
        nowPriceToken1,
        clmHistory,
        vaultHistory
      );

      if (data && data.length > 0) {
        const minUsd = minOf(data, 'underlyingUsd', 'heldUsd');
        const maxUsd = maxOf(data, 'underlyingUsd', 'heldUsd');
        const minUnderlying = minOf(data, 'underlying');
        const maxUnderlying = maxOf(data, 'underlying');

        return { data, minUsd, maxUsd, minUnderlying, maxUnderlying };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [
    isLoading,
    timeBucket,
    nowBalanceShares,
    nowPriceUnderlying,
    nowBalanceUnderlying,
    nowPricePerFullShare,
    nowPriceToken0,
    nowBalanceToken0,
    nowPriceToken1,
    nowBalanceToken1,
    underlyingToUsd,
    vaultTimeline,
    token0ToUsd,
    token1ToUsd,
    clmHistory,
    vaultHistory,
  ]);

  return { chartData, isLoading, willRetry, type };
};

/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export const useVaultPeriodsOverviewGraph = useVaultPeriods;
