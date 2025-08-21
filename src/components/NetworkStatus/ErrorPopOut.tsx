import { styled } from '@repo/styles/jsx';
import { Button } from '../Button/Button.tsx';
import { memo, useMemo } from 'react';
import type { ChainEntity } from '../../features/data/entities/chain.ts';
import { ChainIcon } from '../ChainIcon/ChainIcon.tsx';
import ForwardArrowIcon from '../../images/icons/forward-arrow.svg?react';

export const ErrorPopOut = memo(function ErrorPopOut({
  setIsPopupOpen,
  rpcErrors,
}: {
  setIsPopupOpen: (isPopupOpen: boolean) => void;
  rpcErrors: ChainEntity['id'][];
}) {
  const showChainsConnectedError = useMemo(() => rpcErrors.length > 4, [rpcErrors]);

  const chainsToShow = useMemo(() => {
    if (showChainsConnectedError) {
      return rpcErrors.slice(0, 4);
    }
    return rpcErrors;
  }, [rpcErrors, showChainsConnectedError]);

  if (rpcErrors.length === 0) {
    return null;
  }

  return (
    <Container>
      <ArrowExpandButton
        variant="dark"
        borderless={true}
        fullWidth={true}
        onClick={() => setIsPopupOpen(false)}
      >
        <DisconnectedChains>{`${rpcErrors.length} RPC disconnected`}</DisconnectedChains>
        <Chains>
          <ChainsContainer>
            {chainsToShow.map(chainId => (
              <ChainIcon key={chainId} chainId={chainId} size={20} />
            ))}
            {showChainsConnectedError && (
              <ChainsConnected>{`+ ${rpcErrors.length - 4}`}</ChainsConnected>
            )}
          </ChainsContainer>
          <IconContainer>
            <ForwardArrowIcon />
          </IconContainer>
        </Chains>
      </ArrowExpandButton>
    </Container>
  );
});

const DisconnectedChains = styled('div', {
  base: {
    textStyle: 'body.md',
    color: 'text.light',
  },
});

const Container = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '2px',
    minWidth: '320px',
  },
});

const ArrowExpandButton = styled(Button, {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBlock: '8px',
    paddingInline: '10px',
    borderRadius: '8px',
  },
});

const Chains = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
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

const ChainsContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

const IconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '20px',
    width: '20px',
    '& svg': {
      transform: 'rotate(90deg)',
    },
  },
});
