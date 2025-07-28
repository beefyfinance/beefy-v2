import { styled } from '@repo/styles/jsx';
import { memo, useCallback, useMemo } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { selectAllChainIds } from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { ChainRpcItem } from './RpcListItem.tsx';
import { Scrollable } from '../../../Scrollable/Scrollable.tsx';

export interface RpcMenuProps {
  onSelect: (chainId: ChainEntity['id']) => void;
  rpcErrors: ChainEntity['id'][];
}

export const RpcMenu = memo(function RpcMenu({ onSelect, rpcErrors }: RpcMenuProps) {
  const chainIds = useAppSelector(state => selectAllChainIds(state));

  const handleSelect = useCallback(
    (chainId: ChainEntity['id']) => {
      onSelect(chainId);
    },
    [onSelect]
  );

  const filteredChainIds = useMemo(() => {
    return chainIds.filter(chainId => !rpcErrors.includes(chainId));
  }, [chainIds, rpcErrors]);

  return (
    <Scrollable autoHeight={350} hideShadows>
      <RpcList>
        {filteredChainIds.map(chainId => (
          <ChainRpcItem key={chainId} id={chainId} onSelect={handleSelect} />
        ))}
      </RpcList>
    </Scrollable>
  );
});

const RpcList = styled('div', {
  base: {
    display: 'flex',
    flexDirection: 'column',
  },
});
