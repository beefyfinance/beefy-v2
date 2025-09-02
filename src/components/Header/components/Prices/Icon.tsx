import { css } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { getNetworkSrc } from '../../../../helpers/networkSrc.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';

export const Icon = styled('img', {
  base: {
    display: 'block',
    height: '24px',
    width: '24px',
  },
  variants: {
    first: {
      true: {
        gridColumnStart: 1,
      },
    },
    price: {
      true: {
        height: '20px',
        width: '20px',
      },
    },
  },
  defaultVariants: {
    price: false,
  },
});

const SquareIconContainer = styled('div', {
  base: {
    display: 'flex',
    height: '16px',
    width: '16px',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '3px',
    backgroundColor: 'colorPalette.primary',
  },
});

export const ChainSquareIcon = function ChainSquareIcon({
  chainId,
}: {
  chainId: ChainEntity['id'];
}) {
  const chain = useAppSelector(state => selectChainById(state, chainId));
  return (
    <SquareIconContainer className={css({ colorPalette: `network.${chainId}` })}>
      <img alt={chain.name} src={getNetworkSrc(chainId)} width={14} height={14} />
    </SquareIconContainer>
  );
};
