import { styled } from '@repo/styles/jsx';
import type BigNumber from 'bignumber.js';
import { orderBy } from 'lodash-es';
import { memo, useMemo } from 'react';
import { entries } from '../../../../../helpers/object.ts';
import { useAppSelector } from '../../../../data/store/hooks.ts';
import type { ChainEntity } from '../../../../data/entities/chain.ts';
import { selectActiveChainIds } from '../../../../data/selectors/chains.ts';
import { selectTvlByChain } from '../../../../data/selectors/tvl.ts';
import { Chain } from './Chain.tsx';

export const Chains = memo(function Chains() {
  const tvls = useAppSelector(selectTvlByChain);
  const activeChainIds = useAppSelector(selectActiveChainIds);

  const sortedTvls = useMemo(() => {
    return orderBy(
      entries(tvls)
        .filter((entry): entry is [ChainEntity['id'], BigNumber] => !!(entry && entry[1]))
        .filter(([chainId]) => activeChainIds.includes(chainId))
        .map(([chainId, tvl]) => ({
          chainId,
          tvl,
        })),
      e => e.tvl.toNumber(),
      'desc'
    );
  }, [tvls, activeChainIds]);

  return (
    <GridScroller>
      <Grid>
        {sortedTvls.map(item => (
          <Chain key={item.chainId} chainId={item.chainId} tvl={item.tvl} />
        ))}
      </Grid>
    </GridScroller>
  );
});

const GridScroller = styled('div', {
  base: {
    flexShrink: 1,
    maxHeight: '100%',
    minHeight: '100px',
    overflowY: 'auto',
  },
});

const Grid = styled('div', {
  base: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '16px',
    sm: {
      gridTemplateColumns: 'repeat(3, 1fr)',
    },
    md: {
      gridTemplateColumns: 'repeat(4, 1fr)',
    },
    lg: {
      gridTemplateColumns: 'repeat(5, 1fr)',
    },
  },
});
