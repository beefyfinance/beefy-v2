import { styled } from '@repo/styles/jsx';
import type { ChainEntity } from '../../../data/entities/chain.ts';
import { memo } from 'react';
import { selectChainById } from '../../../data/selectors/chains.ts';
import { useAppSelector } from '../../../data/store/hooks.ts';
import { ChainIcon } from '../../../../components/ChainIcon/ChainIcon.tsx';
import type { VaultEntity } from '../../../data/entities/vault.ts';
import { VaultPlatform } from '../../../../components/VaultPlatform/VaultPlatform.tsx';

export const ChainTag = memo(function ChainTag({ chainId }: { chainId: ChainEntity['id'] }) {
  const chain = useAppSelector(state => selectChainById(state, chainId));

  return (
    <Tag>
      <Label>Chain</Label>
      <ChainContainer>
        {chain.name}
        <ChainIcon size={16} chainId={chainId} />
      </ChainContainer>
    </Tag>
  );
});

export const PlatformTag = memo(function PlatformTag({ vaultId }: { vaultId: VaultEntity['id'] }) {
  return (
    <Tag>
      <Label>Platform</Label>
      <VaultPlatform vaultId={vaultId} />
    </Tag>
  );
});

export const Tag = styled('div', {
  base: {
    textStyle: 'subline.sm',
    fontWeight: 'semiBold',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    padding: '2px 10px',
    borderRadius: '4px',
    backgroundColor: 'white.100-4a',
    color: 'text.light',
    textTransform: 'uppercase',
  },
});

const Label = styled('div', {
  base: {
    color: 'text.dark',
    textStyle: 'subline.sm',
    fontWeight: 'normal',
  },
});

const ChainContainer = styled('div', {
  base: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
});
