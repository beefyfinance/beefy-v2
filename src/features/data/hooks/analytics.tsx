import { useAppDispatch, useAppSelector } from '../../../store';
import { useEffect } from 'react';
import {
  fetchCowcentratedPriceHistoryClassic,
  fetchCowcentratedPriceHistoryClm,
  fetchShareToUnderlying,
} from '../actions/analytics';
import type { VaultEntity } from '../entities/vault';
import {
  selectClassicPriceHistoryByVaultIdByInterval,
  selectClmPriceHistoryByVaultIdByInterval,
  selectShareToUnderlyingByVaultIdByInterval,
} from '../selectors/analytics';
import type { GraphBucket } from '../../../helpers/graph/types';
import {
  getDataApiBucketIntervalKey,
  getDataApiBucketRangeStartDateUnix,
} from '../apis/beefy/beefy-data-api-helpers';
import type { BeefyState, BeefyThunkConfig } from '../../../redux-types';
import type { ApiTimeBucketInterval } from '../apis/beefy/beefy-data-api-types';
import type { AnalyticsIntervalData } from '../reducers/analytics-types';
import type { AsyncThunk } from '@reduxjs/toolkit/src/createAsyncThunk';

type IntervalDataSelector<T> = (
  state: BeefyState,
  vaultId: VaultEntity['id'],
  intervalKey: ApiTimeBucketInterval
) => Readonly<AnalyticsIntervalData<T>>;

type IntervalDataAction = AsyncThunk<
  unknown,
  {
    vaultId: VaultEntity['id'];
    timeBucket: GraphBucket;
  },
  BeefyThunkConfig
>;

function makeVaultIdToIntervalData<T>(
  selector: IntervalDataSelector<T>,
  action: IntervalDataAction
) {
  return function (vaultId: VaultEntity['id'], timeBucket: GraphBucket) {
    const dispatch = useAppDispatch();
    const { data, status, fulfilledSince, requestedSince } = useAppSelector(state =>
      selector(state, vaultId, getDataApiBucketIntervalKey(timeBucket))
    );
    const needSince = getDataApiBucketRangeStartDateUnix(timeBucket);
    const hasFulfilled = fulfilledSince > 0 && fulfilledSince <= needSince;
    const hasRequested = requestedSince > 0 && requestedSince <= needSince;

    useEffect(() => {
      if (!hasFulfilled) {
        if (!hasRequested && (status === 'idle' || status === 'fulfilled')) {
          dispatch(action({ vaultId, timeBucket }));
        } else if (status === 'rejected') {
          const handle = setTimeout(() => dispatch(action({ vaultId, timeBucket })), 15000);
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
