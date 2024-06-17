import { useAppDispatch, useAppSelector } from '../../../store';
import { useEffect } from 'react';
import { fetchShareToUnderlying } from '../actions/analytics';
import type { VaultEntity } from '../entities/vault';
import type { GraphBucket } from '../../../helpers/graph';
import { selectShareToUnderlyingTimebucketByVaultId } from '../selectors/analytics';

export function useVaultIdToShareToUnderlying(vaultId: VaultEntity['id'], timebucket: GraphBucket) {
  const dispatch = useAppDispatch();
  const { data, status } = useAppSelector(state =>
    selectShareToUnderlyingTimebucketByVaultId(state, vaultId, timebucket)
  );
  const hasData = status !== 'idle' && !!data && data.length > 0;

  useEffect(() => {
    if (!hasData) {
      if (status === 'idle') {
        dispatch(fetchShareToUnderlying({ vaultId, timebucket }));
      } else if (status === 'rejected') {
        const handle = setTimeout(
          () => dispatch(fetchShareToUnderlying({ vaultId, timebucket })),
          5000
        );
        return () => clearTimeout(handle);
      }
    }
  }, [dispatch, vaultId, timebucket, hasData, status]);

  return { data, loading: !hasData && status === 'pending' };
}
