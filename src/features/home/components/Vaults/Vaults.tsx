import { memo } from 'react';
import { VaultsHeader } from './components/VaultsHeader/VaultsHeader.tsx';
import { VaultsList } from './components/VaultsList/VaultsList.tsx';
import { css } from '@repo/styles/css';

export const Vaults = memo(function Vaults() {
  return (
    <div className={vaultsClass}>
      <VaultsHeader />
      <VaultsList />
    </div>
  );
});

const vaultsClass = css({
  marginTop: '20px',
  borderRadius: '12px',
  border: 'solid 2px {colors.background.content.dark}',
  contain: 'paint',
  sm: {
    marginTop: '32px',
  },
});
