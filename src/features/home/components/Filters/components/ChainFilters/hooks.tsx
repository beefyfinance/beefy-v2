import { useAppDispatch, useAppSelector } from '../../../../../../store';
import { selectActiveChainIds } from '../../../../../data/selectors/chains';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults';
import { useEffect } from 'react';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults';
import type { ChainEntity } from '../../../../../data/entities/chain';

export function useSelectedChainIds(): ChainEntity['id'][] {
  const dispatch = useAppDispatch();
  const activeChainIds = useAppSelector(selectActiveChainIds);
  const selectedChainIds = useAppSelector(selectFilterChainIds);

  useEffect(() => {
    if (!selectedChainIds.every(id => activeChainIds.includes(id))) {
      dispatch(
        filteredVaultsActions.setChainIds(
          selectedChainIds.filter(id => activeChainIds.includes(id))
        )
      );
    }
  }, [activeChainIds, selectedChainIds]);

  return selectedChainIds;
}
