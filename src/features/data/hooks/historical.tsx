import { useEffect } from 'react';
import type { TokenEntity } from '../entities/token';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectHistoricalBucketAlreadyFulfilled,
  selectHistoricalBucketHasData,
  selectHistoricalBucketStatus,
  selectHistoricalPriceBucketAlreadyFulfilled,
  selectHistoricalPriceBucketData,
  selectHistoricalPriceBucketStatus,
} from '../selectors/historical';
import { fetchHistoricalPrices, fetchHistoricalStat } from '../actions/historical';
import { type VaultEntity } from '../entities/vault';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import type { GraphBucket } from '../../../helpers/graph';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { ChartStat } from '../../vault/components/HistoricGraph/types';

export function useOracleIdToUsdPrices(oracleId: TokenEntity['oracleId'], bucket: GraphBucket) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state =>
    selectHistoricalPriceBucketStatus(state, oracleId, bucket)
  );
  const alreadyFulfilled = useAppSelector(state =>
    selectHistoricalPriceBucketAlreadyFulfilled(state, oracleId, bucket)
  );
  const data = useAppSelector(state => selectHistoricalPriceBucketData(state, oracleId, bucket));
  const hasData = alreadyFulfilled && !!data && data.length > 0;

  useEffect(() => {
    if (!alreadyFulfilled) {
      if (status === 'idle') {
        dispatch(fetchHistoricalPrices({ oracleId, bucket }));
      } else if (status === 'rejected') {
        const handle = setTimeout(
          () => dispatch(fetchHistoricalPrices({ oracleId, bucket })),
          15000
        );
        return () => clearTimeout(handle);
      }
    }
  }, [dispatch, oracleId, bucket, alreadyFulfilled, status]);

  return {
    data,
    loading: !hasData && (status === 'pending' || status === 'idle'),
    alreadyFulfilled,
    hasData,
    willRetry: status === 'rejected',
  };
}

/**
 * Price of underlying token (vault.want) for gov/standard vaults
 * Price of share token for cowcentrated vaults
 */
export function useVaultIdToUnderlyingUsdPrices(vaultId: VaultEntity['id'], bucket: GraphBucket) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const token = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  return useOracleIdToUsdPrices(token?.oracleId || vaultId, bucket);
}

export function useHistoricalStatLoader(
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket
) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state =>
    selectHistoricalBucketStatus(state, stat, vaultId, oracleId, bucket)
  );
  const alreadyFulfilled = useAppSelector(state =>
    selectHistoricalBucketAlreadyFulfilled(state, stat, vaultId, oracleId, bucket)
  );
  const hasData = useAppSelector(state =>
    selectHistoricalBucketHasData(state, stat, vaultId, oracleId, bucket)
  );

  useEffect(() => {
    if (!alreadyFulfilled) {
      if (status === 'idle') {
        dispatch(fetchHistoricalStat(stat, vaultId, oracleId, bucket));
      } else if (status === 'rejected') {
        const handle = setTimeout(
          () => dispatch(fetchHistoricalStat(stat, vaultId, oracleId, bucket)),
          15000
        );
        return () => clearTimeout(handle);
      }
    }
  }, [dispatch, vaultId, oracleId, stat, bucket, alreadyFulfilled, status]);

  return {
    loading: !hasData && (status === 'pending' || status === 'idle'),
    alreadyFulfilled,
    hasData,
    willRetry: status === 'rejected',
  };
}
