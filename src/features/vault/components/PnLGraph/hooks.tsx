import { useEffect, useMemo } from 'react';
import { VaultEntity } from '../../../data/entities/vault';
import { useAppDispatch, useAppSelector } from '../../../../store';
import {
  selectLastVaultDepositStart,
  selectShareToUnderlyingTimebucketByVaultId,
  selectUnderlyingToUsdTimebucketByVaultId,
  selectUserDepositedTimelineByVaultId,
} from '../../../data/selectors/analytics';
import { getInvestorTimeserie } from '../../../../helpers/timeserie';
import { eachDayOfInterval, isAfter } from 'date-fns';
import { maxBy, minBy } from 'lodash';
import { TimeBucketType } from '../../../data/apis/analytics/analytics-types';
import { selectVaultById, selectVaultPricePerFullShare } from '../../../data/selectors/vaults';
import {
  selectDepositTokenByVaultId,
  selectTokenPriceByAddress,
} from '../../../data/selectors/tokens';
import { selectUserBalanceOfTokensIncludingBoosts } from '../../../data/selectors/balance';
import { fetchShareToUndelying, fetchUnderlyingToUsd } from '../../../data/actions/analytics';

export const usePnLChartData = (
  timebucket: TimeBucketType,
  productKey: string,
  vaultId: VaultEntity['id']
) => {
  const dispatch = useAppDispatch();
  const vaultTimeline = useAppSelector(state =>
    selectUserDepositedTimelineByVaultId(state, vaultId)
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
    selectUserBalanceOfTokensIncludingBoosts(
      state,
      vault.id,
      vault.chainId,
      vault.earnContractAddress
    )
  );
  const vaultLastDeposit = useAppSelector(state => selectLastVaultDepositStart(state, vaultId));

  const { data: shares, status: sharesStatus } = useAppSelector(state =>
    selectShareToUnderlyingTimebucketByVaultId(state, vaultId, timebucket)
  );

  const { data: underlying, status: underlyingStatus } = useAppSelector(state =>
    selectUnderlyingToUsdTimebucketByVaultId(state, vaultId, timebucket)
  );

  useEffect(() => {
    if (sharesStatus === 'idle') {
      dispatch(fetchShareToUndelying({ productKey, vaultId, timebucket }));
    }
    if (underlyingStatus === 'idle') {
      dispatch(fetchUnderlyingToUsd({ productKey, vaultId, timebucket }));
    }

    if (sharesStatus === 'rejected') {
      const handleShareToUnderlying = setTimeout(
        () => dispatch(fetchShareToUndelying({ productKey, vaultId, timebucket })),
        5000
      );
      return () => clearTimeout(handleShareToUnderlying);
    }

    if (underlyingStatus === 'rejected') {
      const handleUnderlyingToUsd = setTimeout(
        () => dispatch(fetchUnderlyingToUsd({ productKey, vaultId, timebucket })),
        5000
      );
      return () => clearTimeout(handleUnderlyingToUsd);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sharesStatus, underlyingStatus]);

  const isLoading = useMemo(() => {
    return underlyingStatus !== 'fulfilled' || sharesStatus !== 'fulfilled';
  }, [sharesStatus, underlyingStatus]);

  const chartData = useMemo(() => {
    if (sharesStatus === 'fulfilled' && underlyingStatus === 'fulfilled') {
      const filteredShares = shares.filter(price => isAfter(price.date, vaultLastDeposit));
      const filteredUnderlying = underlying.filter(price => isAfter(price.date, vaultLastDeposit));

      const data = getInvestorTimeserie(
        timebucket,
        vaultTimeline,
        filteredShares,
        filteredUnderlying,
        vaultLastDeposit,
        currentPpfs,
        currentOraclePrice.toNumber(),
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

    return { data: [], minUnderlying: 0, maxUnderlying: 0, minUsd: 0, maxUsd: 0 };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shares, underlying]);

  return { chartData, isLoading };
};

export const useVaultPeriods = (vaultId: VaultEntity['id']) => {
  const vaultDepositDate = useAppSelector(state => selectLastVaultDepositStart(state, vaultId));
  const currentDate = new Date();

  const result = eachDayOfInterval({
    start: vaultDepositDate,
    end: currentDate,
  });

  const dates = useMemo(() => {
    if (result.length > 30) return ['1D', '1W', '1M', 'ALL'];
    if (result.length > 7) return ['1D', '1W', 'ALL'];
    if (result.length > 1) return ['1D', 'ALL'];
    if (result.length === 1) return ['1D'];
    return [];
  }, [result.length]);

  return dates;
};
