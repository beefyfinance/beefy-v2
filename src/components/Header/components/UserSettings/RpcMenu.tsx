import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { memo, useCallback } from 'react';
import { useAppSelector } from '../../../../store.ts';
import { selectAllChainIds } from '../../../../features/data/selectors/chains.ts';
import { SearchableList } from '../../../SearchableList/SearchableList.tsx';
import { ChainRpcItem, ChainRpcReset } from './RpcListItem.tsx';
import { styled } from '@repo/styles/jsx';

export interface RpcMenuProps {
  onSelect: (chainId: ChainEntity['id']) => void;
}

export const RpcMenu = memo(function RpcMenu({ onSelect }: RpcMenuProps) {
  const chainIds = useAppSelector(state => selectAllChainIds(state));

  const handleSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      onSelect(chainId);
    },
    [onSelect]
  );

  return (
    <RpcList>
      <SearchableList
        options={chainIds}
        onSelect={handleSelect}
        ItemInnerComponent={ChainRpcItem}
        EndComponent={ChainRpcReset}
        size="sm"
        hideShadows={true}
      />
    </RpcList>
  );
});

const RpcList = styled('div', {
  base: {
    padding: `${12 - 2}px`,
    height: '100%',
    width: '100%',
    color: 'text.light',
    flexGrow: '1',
  },
});
