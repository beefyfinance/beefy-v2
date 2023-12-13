import { useEffect, useMemo } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectLastVaultDepositStart,
  selectShareToUnderlyingTimebucketByVaultId,
  selectUnderlyingToUsdTimebucketByVaultId,
  selectUserDepositedTimelineByVaultId,
} from '../../../data/selectors/analytics';
import { getInvestorTimeserie } from '../../../../helpers/timeserie';
import { eachDayOfInterval, isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash-es';
import type { TimeBucketType } from '../../../data/apis/analytics/analytics-types';
import { selectVaultById, selectVaultPricePerFullShare } from '../../../data/selectors/vaults';
import {
  selectDepositTokenByVaultId,
  selectTokenPriceByAddress,
} from '../../../data/selectors/tokens';
import { selectUserBalanceOfTokensIncludingBoostsBridged } from '../../../data/selectors/balance';
import { fetchShareToUnderlying, fetchUnderlyingToUsd } from '../../../data/actions/analytics';
import { selectWalletAddress } from '../../../data/selectors/wallet';

// Same object reference for empty chart data
export const NO_CHART_DATA = { data: [], minUnderlying: 0, maxUnderlying: 0, minUsd: 0, maxUsd: 0 };

export const usePnLChartData = (
  timebucket: TimeBucketType,
  productKey: string,
  vaultId: VaultEntity['id'],
  address?: string
) => {
  const dispatch = useAppDispatch();
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
    selectUserBalanceOfTokensIncludingBoostsBridged(
      state,
      vault.id,
      vault.chainId,
      vault.earnContractAddress,
      walletAddress
    )
  );
  const vaultLastDeposit = useAppSelector(state =>
    selectLastVaultDepositStart(state, vaultId, walletAddress)
  );

  const { data: sharesToUnderlying, status: sharesStatus } = useAppSelector(state =>
    selectShareToUnderlyingTimebucketByVaultId(state, vaultId, timebucket, walletAddress)
  );

  const { data: underlyingToUsd, status: underlyingStatus } = useAppSelector(state =>
    selectUnderlyingToUsdTimebucketByVaultId(state, vaultId, timebucket, walletAddress)
  );

  useEffect(() => {
    if (walletAddress) {
      if (sharesStatus === 'idle') {
        dispatch(
          fetchShareToUnderlying({
            productKey,
            vaultId,
            walletAddress,
            timebucket,
          })
        );
      }
      if (underlyingStatus === 'idle') {
        dispatch(
          fetchUnderlyingToUsd({
            productKey,
            vaultId,
            walletAddress,
            timebucket,
          })
        );
      }

      if (sharesStatus === 'rejected') {
        const handleShareToUnderlying = setTimeout(
          () =>
            dispatch(
              fetchShareToUnderlying({
                productKey,
                vaultId,
                walletAddress,
                timebucket,
              })
            ),
          5000
        );
        return () => clearTimeout(handleShareToUnderlying);
      }

      if (underlyingStatus === 'rejected') {
        const handleUnderlyingToUsd = setTimeout(
          () =>
            dispatch(
              fetchUnderlyingToUsd({
                productKey,
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
  }, [dispatch, sharesStatus, underlyingStatus, timebucket, productKey, vaultId, walletAddress]);

  const isLoading = useMemo(() => {
    return underlyingStatus !== 'fulfilled' || sharesStatus !== 'fulfilled';
  }, [sharesStatus, underlyingStatus]);

  const chartData = useMemo(() => {
    if (sharesStatus === 'fulfilled' && underlyingStatus === 'fulfilled') {
      const filteredSharesToUnderlying = sharesToUnderlying.filter(price =>
        isAfter(price.date, vaultLastDeposit)
      );
      const filteredUnderlyingToUsd = underlyingToUsd.filter(price =>
        isAfter(price.date, vaultLastDeposit)
      );

      const data = getInvestorTimeserie(
        timebucket,
        vaultTimeline,
        filteredSharesToUnderlying,
        filteredUnderlyingToUsd,
        vaultLastDeposit,
        currentPpfs,
        currentOraclePrice,
        currentMooTokenBalance
      );

      if (data.length > 0) {
        const minUsd = data ? minBy(data, row => row.usdBalance).usdBalance : 0;
        const maxUsd = data ? maxBy(data, row => row.usdBalance).usdBalance : 0;

        const minUnderlying = minBy(data, row => row.underlyingBalance).underlyingBalance;
        const maxUnderlying = maxBy(data, row => row.underlyingBalance).underlyingBalance;

        return { data, minUnderlying, maxUnderlying, minUsd, maxUsd };
      }
    }

    // This save us from re-rendering when data is loading
    // We need to make sure this object is not modified elsewhere
    return NO_CHART_DATA;
  }, [
    sharesToUnderlying,
    underlyingToUsd,
    currentMooTokenBalance,
    currentOraclePrice,
    currentPpfs,
    vaultLastDeposit,
    vaultTimeline,
    sharesStatus,
    underlyingStatus,
    timebucket,
  ]);

  return { chartData, isLoading };
};

export const useVaultPeriods = (vaultId: VaultEntity['id'], address?: string) => {
  const vaultDepositDate = useAppSelector(state =>
    selectLastVaultDepositStart(state, vaultId, address)
  );
  const currentDate = new Date();

  const result = eachDayOfInterval({
    start: vaultDepositDate,
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
