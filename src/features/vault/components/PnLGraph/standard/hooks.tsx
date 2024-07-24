import { useMemo } from 'react';
import type { VaultEntity } from '../../../../data/entities/vault';
import { useAppSelector } from '../../../../../store';
import {
  selectUserDepositedTimelineByVaultId,
  selectUserFirstDepositDateByVaultId,
} from '../../../../data/selectors/analytics';
import { getInvestorTimeserie } from '../../../../../helpers/timeserie';
import { differenceInHours, getUnixTime, isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash-es';
import { selectVaultById, selectVaultPricePerFullShare } from '../../../../data/selectors/vaults';
import {
  selectDepositTokenByVaultId,
  selectTokenPriceByAddress,
} from '../../../../data/selectors/tokens';
import { selectWalletAddress } from '../../../../data/selectors/wallet';
import { isVaultTimelineAnalyticsEntity } from '../../../../data/entities/analytics';
import { selectUserVaultBalanceInShareTokenIncludingBoostsBridged } from '../../../../data/selectors/balance';
import { useVaultIdToUnderlyingUsdPrices } from '../../../../data/hooks/historical';
import type { GraphBucket } from '../../../../../helpers/graph';
import { useVaultIdToShareToUnderlying } from '../../../../data/hooks/analytics';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], minUnderlying: 0, maxUnderlying: 0, minUsd: 0, maxUsd: 0 };

export const usePnLChartData = (
  timebucket: GraphBucket,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const walletAddress = useAppSelector(state => address || selectWalletAddress(state));
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId, walletAddress)
  );
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const depositToken = useAppSelector(state => selectDepositTokenByVaultId(state, vaultId));
  const currentPpfs = useAppSelector(state =>
    selectVaultPricePerFullShare(state, vaultId)
  ).shiftedBy(18 - depositToken.decimals);
  const currentOraclePrice = useAppSelector(state =>
    selectTokenPriceByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const currentMooTokenBalance = useAppSelector(state =>
    selectUserVaultBalanceInShareTokenIncludingBoostsBridged(state, vault.id, walletAddress)
  );
  const {
    data: sharesToUnderlying,
    loading: sharesLoading,
    willRetry: sharesWillRetry,
  } = useVaultIdToShareToUnderlying(vaultId, timebucket);
  const {
    data: underlyingToUsd,
    loading: underlyingLoading,
    willRetry: underlyingWillRetry,
  } = useVaultIdToUnderlyingUsdPrices(vaultId, timebucket);

  const isLoading = underlyingLoading || sharesLoading;
  const willRetry = sharesWillRetry || underlyingWillRetry;

  const chartData = useMemo(() => {
    if (
      !isLoading &&
      vaultTimeline &&
      isVaultTimelineAnalyticsEntity(vaultTimeline) &&
      vaultTimeline.current.length &&
      underlyingToUsd
    ) {
      const vaultLastDeposit = vaultTimeline.current[0].datetime;
      const vaultLastDepositUnix = getUnixTime(vaultLastDeposit);
      const filteredSharesToUnderlying = sharesToUnderlying.filter(price =>
        isAfter(price.date, vaultLastDeposit)
      );
      const filteredUnderlyingToUsd = underlyingToUsd.filter(
        price => price.t > vaultLastDepositUnix
      );

      const data = getInvestorTimeserie(
        timebucket,
        vaultTimeline.current,
        filteredSharesToUnderlying,
        filteredUnderlyingToUsd,
        vaultLastDeposit,
        currentPpfs,
        currentOraclePrice,
        currentMooTokenBalance
      );

      if (data && data.length > 0) {
        const minUsd = minBy(data, row => row.usdBalance)?.usdBalance || 0;
        const maxUsd = maxBy(data, row => row.usdBalance)?.usdBalance || 0;

        const minUnderlying = minBy(data, row => row.underlyingBalance)?.underlyingBalance || 0;
        const maxUnderlying = maxBy(data, row => row.underlyingBalance)?.underlyingBalance || 0;

        return { data, minUnderlying, maxUnderlying, minUsd, maxUsd };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [
    isLoading,
    sharesToUnderlying,
    underlyingToUsd,
    currentMooTokenBalance,
    currentOraclePrice,
    currentPpfs,
    vaultTimeline,
    timebucket,
  ]);

  return { chartData, isLoading, willRetry };
};

/**
 * The indexes of the array returned are used to index GRAPH_TIME_BUCKETS
 */
export const useVaultPeriods = (
  vaultId: VaultEntity['id'],
  address: string,
  minHours: number = 4
) => {
  const vaultDepositDate = useAppSelector(state =>
    selectUserFirstDepositDateByVaultId(state, vaultId, address)
  );

  return useMemo(() => {
    if (!vaultDepositDate) return [];

    const now = new Date();
    const fullHours = differenceInHours(now, vaultDepositDate);
    const fractionalDays = fullHours / 24;

    if (fractionalDays > 366) return ['1D', '1W', '1M', '1Y', 'ALL'];
    if (fractionalDays > 30) return ['1D', '1W', '1M', 'ALL'];
    if (fractionalDays > 7) return ['1D', '1W', 'ALL'];
    if (fractionalDays > 1) return ['1D', 'ALL'];

    // smallest bucket is 1h, so wait until we have at least 4 hours to show on the graph
    if (fullHours >= minHours) return ['ALL'];

    return [];
  }, [vaultDepositDate, minHours]);
};
