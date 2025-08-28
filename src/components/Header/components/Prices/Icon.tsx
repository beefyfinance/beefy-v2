import { css, cva } from '@repo/styles/css';
import { styled } from '@repo/styles/jsx';
import type { ChainEntity } from '../../../../features/data/entities/chain.ts';
import { getNetworkSrc } from '../../../../helpers/networkSrc.ts';
import { selectChainById } from '../../../../features/data/selectors/chains.ts';
import { useAppSelector } from '../../../../features/data/store/hooks.ts';

const iconRecipe = cva({
  base: {
    display: 'block',
    height: '20px',
    width: '20px',
  },
  variants: {
    first: {
      true: {
        gridColumnStart: 1,
      },
    },
  },
});

export const Icon = styled('img', iconRecipe, {
  defaultProps: {
    height: '20px',
    width: '20px',
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
