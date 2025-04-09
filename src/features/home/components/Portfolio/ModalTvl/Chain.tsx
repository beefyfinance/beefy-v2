import type { ChainEntity } from '../../../../data/entities/chain.ts';
import type BigNumber from 'bignumber.js';
import { memo } from 'react';
import { useAppSelector } from '../../../../../store.ts';
import { selectChainById } from '../../../../data/selectors/chains.ts';
import { getNetworkSrc } from '../../../../../helpers/networkSrc.ts';
import { formatLargeUsd } from '../../../../../helpers/format.ts';
import { ContentLoading } from '../../../../../components/ContentLoading/ContentLoading.tsx';
import { styled } from '@repo/styles/jsx';

type ChainProps = {
  chainId: ChainEntity['id'];
  tvl: BigNumber;
};

export const Chain = memo<ChainProps>(function Chain({ chainId, tvl }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <Box>
      <Logo src={getNetworkSrc(chain.id)} />
      <div>
        <Name>{chain.name}</Name>
        <Tvl>{tvl ? formatLargeUsd(tvl) : <ContentLoading />}</Tvl>
      </div>
    </Box>
  );
});

const Box = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    borderRadius: '4px',
    backgroundColor: 'background.content.light',
    gap: '8px',
  },
});

const Logo = styled(
  'img',
  {
    base: {
      height: '32px',
      width: '32px',
    },
  },
  {
    defaultProps: {
      alt: '',
      'aria-hidden': true,
    },
  }
);

const Name = styled('div', {
  base: {
    textStyle: 'subline.sm',
    color: 'text.dark',
  },
});

const Tvl = styled('div', {
  base: {
    textStyle: 'body.medium',
    color: 'text.middle',
  },
});
