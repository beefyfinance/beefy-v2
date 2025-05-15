import { type FC, type SVGProps, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../../data/entities/chain.ts';
import { filteredVaultsActions } from '../../../../../data/reducers/filtered-vaults.ts';
import { selectFilterChainIds } from '../../../../../data/selectors/filtered-vaults.ts';
import { selectActiveChainIds } from '../../../../../data/selectors/chains.ts';

const networkIcons = import.meta.glob<FC<SVGProps<SVGSVGElement>>>(
  '../../../../../../images/networks/*.svg',
  {
    eager: true,
    import: 'default',
    query: '?react',
  }
);

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
  }, [activeChainIds, dispatch, selectedChainIds]);

  return selectedChainIds;
}

export function getNetworkIcon(chainId: ChainEntity['id']): FC<SVGProps<SVGSVGElement>> {
  return networkIcons[`../../../../../../images/networks/${chainId}.svg`];
}
