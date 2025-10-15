import { styled } from '@repo/styles/jsx';
import type { ChainEntity } from '../../../data/entities/chain.ts';
import { memo } from 'react';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { ChainIcon } from '../../../../components/ChainIcon/ChainIcon.tsx';
import { selectPlatformById } from '../../../data/selectors/platforms.ts';
import type { PlatformEntity } from '../../../data/entities/platform.ts';

export const ChainTag = memo(function ChainTag({ chainId }: { chainId: ChainEntity['id'] }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <Tag chain={true}>
      <ChainIcon size={16} chainId={chainId} />
      {chain.name}
    </Tag>
  );
});

export const PlatformTag = memo(function PlatformTag({
  platformId,
}: {
  platformId: PlatformEntity['id'];
}) {
  const platform = useAppSelector(state => selectPlatformById(state, platformId));
  return <Tag>{platform.name}</Tag>;
});

export const Tag = styled('div', {
  base: {
    textStyle: 'subline.sm',
    display: 'flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: '4px',
    gap: '4px',
    backgroundColor: 'white.100-4a',
    color: 'text.light',
    textTransform: 'uppercase',
  },
  variants: {
    chain: {
      true: {
        paddingBlock: 2,
        paddingInline: '6px 8px',
      },
    },
  },
});
