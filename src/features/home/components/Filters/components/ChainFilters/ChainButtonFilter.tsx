import { memo, useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults.ts';
import { ChainButtonSelector } from './ChainButtonSelector.tsx';

export const ChainButtonFilter = memo(function ChainButtonFilter() {
  const dispatch = useAppDispatch();
  const selectedChainIds = useAppSelector(selectFilterChainIds);

  const handleChainSelectorChange = useCallback(
    (selected: ChainEntity['id'][]) => {
      dispatch(filteredVaultsActions.setChainIds(selected));
    },
    [dispatch]
  );

  return <ChainButtonSelector selected={selectedChainIds} onChange={handleChainSelectorChange} />;
});
