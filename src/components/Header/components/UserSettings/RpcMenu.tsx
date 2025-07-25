import { styled } from '@repo/styles/jsx';
import { memo, useCallback } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { selectAllChainIds } from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { ChainRpcItem } from './RpcListItem.tsx';
import { Scrollable } from '../../../Scrollable/Scrollable.tsx';

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
    <Scrollable autoHeight={350} hideShadows>
      <RpcList>
        {chainIds.map(chainId => (
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
