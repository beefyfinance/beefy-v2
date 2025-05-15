import { styled } from '@repo/styles/jsx';
import { memo, type MouseEventHandler, useCallback, useMemo } from 'react';
import { useDispatch } from 'react-redux';
import { restoreDefaultRpcsOnSingleChain } from '../../../../features/data/actions/chains.ts';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import {
  selectActiveRpcUrlForChain,
  selectChainById,
} from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import Refresh from '../../../../images/icons/mui/Refresh.svg?react';
import { ChainIcon } from '../../../ChainIcon/ChainIcon.tsx';
import type { ItemInnerProps } from '../../../SearchableList/Item.tsx';
import { PanelCloseButton } from './Panel.tsx';

export const ChainRpcItem = memo(function ChainRpcItem({
  value,
}: ItemInnerProps<ChainEntity['id']>) {
  const chain = useAppSelector(state => selectChainById(state, value));

  const activeChainRpc = useAppSelector(state => selectActiveRpcUrlForChain(state, chain.id));

  return (
    <div>
      <ChainIconName>
        <ChainIcon chainId={value} />
        {chain.name}
      </ChainIconName>
      <RpcUrl>{activeChainRpc[0]}</RpcUrl>
    </div>
  );
});

const ChainIconName = styled('div', {
  base: {
    textStyle: 'body.medium',
    display: 'flex',
    gap: '8px',
    color: 'text.middle',
  },
});

const RpcUrl = styled('div', {
  base: {
    textStyle: 'body.sm',
    marginLeft: '32px',
    color: 'text.dark',
    width: '196px',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    textAlign: 'start',
  },
});

export const ChainRpcReset = memo(function ChainRpcReset({
  value: chain,
}: ItemInnerProps<ChainEntity['id']>) {
  const dispatch = useDispatch();
  const activeChainRpc = useAppSelector(state => selectActiveRpcUrlForChain(state, chain));
  const defaultRPC = useAppSelector(state => selectChainById(state, chain)).rpc;
  const chainEntity = useAppSelector(state => selectChainById(state, chain));

  const handleClick = useCallback<MouseEventHandler<HTMLButtonElement>>(
    e => {
      e.stopPropagation();
      dispatch(restoreDefaultRpcsOnSingleChain(chainEntity));
    },
    [dispatch, chainEntity]
  );

  const rpcsAreEqual = useMemo(
    () =>
      activeChainRpc.length === defaultRPC.length &&
      activeChainRpc.every((url, index) => url === defaultRPC[index]),
    [activeChainRpc, defaultRPC]
  );

  if (rpcsAreEqual) return <></>;

  return (
    <PanelCloseButton onClick={handleClick}>
      <Refresh />
    </PanelCloseButton>
  );
});
