import { styled } from '@repo/styles/jsx';
import { Button } from '../Button/Button.tsx';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { memo, useMemo } from 'react';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { selectAllChainIds, selectChainById } from '../../features/data/selectors/chains.ts';
import { ChainIcon } from '../ChainIcon/ChainIcon.tsx';

import ArrowExpand from '../../images/icons/arrow-expand.svg?react';

export const ErrorPopOut = memo(function ErrorPopOut({
  setIsPopupOpen,
  rpcErrors,
}: {
  setIsPopupOpen: (isPopupOpen: boolean) => void;
  rpcErrors: ChainEntity['id'][];
}) {
  const showChainNames = useMemo(() => rpcErrors.length > 0 && rpcErrors.length <= 3, [rpcErrors]);
  const showChainsConnectedError = useMemo(() => rpcErrors.length > 7, [rpcErrors]);
  const chainIds = useAppSelector(selectAllChainIds);

  return (
    <ArrowExpandButton variant="transparent" onClick={() => setIsPopupOpen(false)}>
      <PopOutContainer>
        <Chains>
          {rpcErrors.length > 0 ?
            <>
              <ChainNamesContainer>
                {rpcErrors.map(chainId => (
                  <Chain key={chainId} chainId={chainId} showChainNames={showChainNames} />
                ))}
              </ChainNamesContainer>
              {showChainsConnectedError && (
                <ChainsConnected>{rpcErrors.length - 7}</ChainsConnected>
              )}
            </>
          : <>
              <ChainsConnected>{chainIds.length}</ChainsConnected>
              <span>RPC connected</span>
            </>
          }
        </Chains>
        <ArrowExpand />
      </PopOutContainer>
    </ArrowExpandButton>
  );
});

const Chain = memo(function Chain({
  chainId,
  showChainNames,
}: {
  chainId: ChainEntity['id'];
  showChainNames: boolean;
}) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <ChainNameItem key={chain.id}>
      <ChainIcon chainId={chain.id} size={20} />
      {showChainNames && <span>{chain.name}</span>}
    </ChainNameItem>
  );
});

const ArrowExpandButton = styled(Button, {
  base: {
    color: 'text.dark',
    paddingBlock: '0px',
    paddingInline: '0px',
  },
});

const PopOutContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '10px',
    paddingInline: '12px',
    minWidth: '320px',
    paddingBlock: '6px 12px',
  },
});

const Chains = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    '& span': {
      textStyle: 'body.small',
      color: 'text.light',
    },
  },
});

const ChainsConnected = styled('div', {
  base: {
    textStyle: 'subline.xs',
    color: 'text.light',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    borderRadius: '100%',
    backgroundColor: 'background.content.darkest',
  },
});

const ChainNamesContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const ChainNameItem = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    textStyle: 'body.sm',
    color: 'text.light',
    '& span': {
      textStyle: 'inherit',
      color: 'inherit',
    },
  },
});
