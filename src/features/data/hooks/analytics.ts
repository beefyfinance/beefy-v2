import type { AsyncThunk } from '@reduxjs/toolkit';
import { useEffect } from 'react';
import type { GraphBucket } from '../../../helpers/graph/types.ts';
import { useAppDispatch, useAppSelector } from '../store/hooks.ts';
import {
  fetchCowcentratedPriceHistoryClassic,
  fetchCowcentratedPriceHistoryClm,
  fetchShareToUnderlying,
} from '../actions/analytics.ts';
import {
  getDataApiBucketIntervalKey,
  getDataApiBucketRangeStartDateUnix,
} from '../apis/beefy/beefy-data-api-helpers.ts';
import type { ApiTimeBucketInterval } from '../apis/beefy/beefy-data-api-types.ts';
import type { VaultEntity } from '../entities/vault.ts';
import type { AnalyticsIntervalData } from '../reducers/analytics-types.ts';
import {
  selectClassicPriceHistoryByVaultIdByInterval,
  selectClmPriceHistoryByVaultIdByInterval,
  selectShareToUnderlyingByVaultIdByInterval,
} from '../selectors/analytics.ts';
import type { BeefyMetaThunkConfig, BeefyState } from '../store/types.ts';

type IntervalDataSelector<T> = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  intervalKey: ApiTimeBucketInterval
) => Readonly<AnalyticsIntervalData<T>>;

type IntervalDataAction<T> = AsyncThunk<
  T,
  {
    vaultId: VaultEntity['id'];
    timeBucket: GraphBucket;
  },
  BeefyMetaThunkConfig<{
    since: number;
  }>
>;

/** stable identity so a skipped vaultId does not re-render every consumer */
const NO_INTERVAL_DATA: Readonly<AnalyticsIntervalData<never>> = {
  status: 'idle',
  requestedSince: 0,
  fulfilledSince: 0,
  data: [],
};

function makeVaultIdToIntervalData<TSelector, TPayload>(
  selector: IntervalDataSelector<TSelector>,
  action: IntervalDataAction<TPayload>
) {
  /** `vaultId` may be undefined so callers can skip a series without breaking hook order */
  return function (vaultId: VaultEntity['id'] | undefined, timeBucket: GraphBucket) {
    const dispatch = useAppDispatch();
    const { data, status, fulfilledSince, requestedSince } = useAppSelector(state =>
      vaultId ? selector(state, vaultId, getDataApiBucketIntervalKey(timeBucket)) : NO_INTERVAL_DATA
    );
    const needSince = getDataApiBucketRangeStartDateUnix(timeBucket);
    const hasFulfilled = fulfilledSince > 0 && fulfilledSince <= needSince;
    const hasRequested = requestedSince > 0 && requestedSince <= needSince;

    useEffect(() => {
      if (vaultId && !hasFulfilled) {
        if (!hasRequested && (status === 'idle' || status === 'fulfilled')) {
          dispatch(action({ vaultId, timeBucket }));
        } else if (status === 'rejected') {
          const handle = setTimeout(() => {
            dispatch(action({ vaultId, timeBucket }));
          }, 15000);
          return () => clearTimeout(handle);
        }
      }
    }, [dispatch, vaultId, timeBucket, hasRequested, hasFulfilled, status]);

    return {
      data,
      loading: !hasFulfilled && status === 'pending',
      willRetry: !hasFulfilled && status === 'rejected',
    };
  };
}

export const useVaultIdToShareToUnderlying = makeVaultIdToIntervalData(
  selectShareToUnderlyingByVaultIdByInterval,
  fetchShareToUnderlying
);

export const useVaultIdToClmPriceHistory = makeVaultIdToIntervalData(
  selectClmPriceHistoryByVaultIdByInterval,
  fetchCowcentratedPriceHistoryClm
);

export const useVaultIdToClassicPriceHistory = makeVaultIdToIntervalData(
  selectClassicPriceHistoryByVaultIdByInterval,
  fetchCowcentratedPriceHistoryClassic
);
