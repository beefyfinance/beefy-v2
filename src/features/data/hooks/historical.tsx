import { useEffect } from 'react';
import type { TokenEntity } from '../entities/token';
import { useAppDispatch, useAppSelector } from '../../../store';
import {
  selectHistoricalBucketIsLoaded,
  selectHistoricalBucketStatus,
  selectHistoricalPriceBucketData,
  selectHistoricalPriceBucketStatus,
} from '../selectors/historical';
import { fetchHistoricalPrices, fetchHistoricalStat } from '../actions/historical';
import { isCowcentratedVault, type VaultEntity } from '../entities/vault';
import { selectVaultById } from '../selectors/vaults';
import { selectTokenByAddress } from '../selectors/tokens';
import type { GraphBucket } from '../../../helpers/graph';
import type { ChartStat } from '../reducers/historical-types';
import type { ApiTimeBucket } from '../apis/beefy/beefy-data-api-types';
import type { ChainEntity } from '../entities/chain';

export function useOracleIdToUsdPrices(oracleId: TokenEntity['oracleId'], bucket: GraphBucket) {
  const dispatch = useAppDispatch();
  const status = useAppSelector(state =>
    selectHistoricalPriceBucketStatus(state, oracleId, bucket)
  );
  const data = useAppSelector(state => selectHistoricalPriceBucketData(state, oracleId, bucket));
  const hasData = status !== 'idle' && !!data && data.length > 0;

  useEffect(() => {
    if (!hasData) {
      if (status === 'idle') {
        dispatch(fetchHistoricalPrices({ oracleId, bucket }));
      } else if (status === 'rejected') {
        const handle = setTimeout(
          () => dispatch(fetchHistoricalPrices({ oracleId, bucket })),
          5000
        );
        return () => clearTimeout(handle);
      }
    }
  }, [dispatch, oracleId, bucket, hasData, status]);

  return { data, loading: !hasData && status === 'pending' };
}

/**
 * Price of underlying token (vault.want) for gov/standard vaults
 * Price of share token for cowcentrated vaults
 */
export function useVaultIdToUnderlyingUsdPrices(vaultId: VaultEntity['id'], bucket: GraphBucket) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const token = useAppSelector(state =>
    isCowcentratedVault(vault)
      ? undefined
      : selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  return useOracleIdToUsdPrices(token?.oracleId || vaultId, bucket);
}

export function useHistoricalStatLoader(
  stat: ChartStat,
  vaultId: VaultEntity['id'],
  oracleId: TokenEntity['oracleId'],
  bucket: ApiTimeBucket,
  chainId: ChainEntity['id'],
  vaultAddress: VaultEntity['earnContractAddress']
) {
  const dispatch = useAppDispatch();
  const bucketStatus = useAppSelector(state =>
    selectHistoricalBucketStatus(state, stat, vaultId, oracleId, bucket)
  );
  const haveData = useAppSelector(state =>
    selectHistoricalBucketIsLoaded(state, stat, vaultId, oracleId, bucket)
  );

  useEffect(() => {
    if (bucketStatus === 'idle') {
      dispatch(fetchHistoricalStat(stat, vaultId, oracleId, bucket, chainId, vaultAddress));
    }
  }, [dispatch, vaultId, oracleId, stat, bucket, bucketStatus, chainId, vaultAddress]);

  return {
    loading: !haveData && (bucketStatus === 'pending' || bucketStatus === 'idle'),
    haveData,
  };
}
