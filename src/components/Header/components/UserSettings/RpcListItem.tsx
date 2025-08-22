import { styled } from '@repo/styles/jsx';
import { memo, useState } from 'react';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import {
  selectChainById,
  selectChainHasModifiedRpc,
} from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';
import { ChainIcon } from '../../../ChainIcon/ChainIcon.tsx';
import ForwardArrowIcon from '../../../../images/icons/forward-arrow.svg?react';

import Edit from '../../../../images/icons/edit_pen.svg?react';
import { useBreakpoint } from '../../../MediaQueries/useBreakpoint.ts';

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
  const isMobile = useBreakpoint({ to: 'xs' });
  const hasModifiedRpc = useAppSelector(state => selectChainHasModifiedRpc(state, id));

  return (
    <Container
      onMouseEnter={() => setIsHover(true)}
      onMouseLeave={() => setIsHover(false)}
      onClick={() => onSelect(id)}
    >
      <NameContainer>
        <Name>
          {isMobile ?
            <ChainIcon size={20} chainId={id} />
          : null}
          {chain.name}
        </Name>
        {error && (
          <>
            <CircleWarning />
            <ErrorContainer>RPC failed</ErrorContainer>
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
      : isMobile ?
        <ModifiedContainer>
          {hasModifiedRpc && <span>Modified RPC</span>}
          <FowardIconContainer>
            <ForwardArrowIcon />
          </FowardIconContainer>
        </ModifiedContainer>
      : <ModifiedContainer>
          {hasModifiedRpc && <span>Modified RPC</span>}
          <ChainIcon size={20} chainId={id} />
        </ModifiedContainer>
      }
    </Container>
  );
});

const Container = styled('div', {
  base: {
    paddingInline: '10px',
    paddingBlock: '10px',
    textStyle: 'body.medium',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    color: 'text.middle',
    lg: {
      paddingBlock: '6px',
    },
    _hover: {
      cursor: 'pointer',
      backgroundColor: 'background.button',
      '&:first-child': {
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
      },
      '&:last-child': {
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
      },
    },
  },
});

const EditContainer = styled('div', {
  base: {
    textStyle: 'body.sm',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '4px',
    color: 'text.light',
  },
});

const EditIconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
    borderRadius: '100%',
    backgroundColor: 'darkBlue.80',
  },
});

const Name = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    color: 'inherit',
  },
});

const NameContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    color: 'text.light',
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

const FowardIconContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '20px',
    height: '20px',
  },
});

const ModifiedContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    '& span': {
      textStyle: 'body.sm',
      color: 'text.dark',
    },
  },
});
