import { styled } from '@repo/styles/jsx';
import { memo, useState } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { ChainIcon } from '../../../ChainIcon/ChainIcon.tsx';

import Edit from '../../../../images/icons/edit_pen.svg?react';

export const ChainRpcItem = memo(function ChainRpcItem({
  error = false,
  id,
  onSelect,
}: {
  id: ChainEntity['id'];
  onSelect: (id: ChainEntity['id']) => void;
  error?: boolean;
}) {
  const [isHover, setIsHover] = useState(false);
  const chain = useAppSelector(state => selectChainById(state, id));

  return (
    <Container
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => onSelect(id)}
    >
      <NameContainer>
        {chain.name}
        {error && (
          <>
            <CircleWarning />
            <ErrorContainer>connection failed </ErrorContainer>
          </>
        )}
      </NameContainer>
      {isHover ?
        <EditContainer>
          <span>Modify RPC</span>
          <EditIconContainer>
            <Edit />
          </EditIconContainer>
        </EditContainer>
      : <ChainIcon chainId={id} />}
    </Container>
  );
});

const Container = styled('div', {
  base: {
    padding: '6px 10px',
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    color: 'text.middle',
    _hover: {
      cursor: 'pointer',
      backgroundColor: 'background.button',
    },
  },
});

const EditContainer = styled('div', {
  base: {
    textStyle: 'body.sm',
    color: 'text.middle',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
  },
});

const EditIconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '24px',
    height: '24px',
    borderRadius: '100%',
    backgroundColor: 'darkBlue.80',
  },
});

const NameContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});

const ErrorContainer = styled('span', {
  base: {
    textStyle: 'body.sm',
    color: 'text.warning',
  },
});

const CircleWarning = styled('div', {
  base: {
    width: '4px',
    height: '4px',
    borderRadius: '100%',
    backgroundColor: 'text.warning',
  },
});
