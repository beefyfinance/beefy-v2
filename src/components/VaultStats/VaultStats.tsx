import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultDepositStat } from './VaultDepositStat.tsx';
import { VaultSafetyStat } from './VaultSafetyStat.tsx';
import { VaultTvlStat } from './VaultTvlStat.tsx';
import { VaultWalletStat } from './VaultWalletStat.tsx';

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultStats = memo(function VaultStats({ vaultId }: VaultStatsProps) {
  return (
    <Align>
      <Columns>
        <VaultWalletStat vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultDepositStat vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultApyStat type="yearly" vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultApyStat type="daily" vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultTvlStat vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultSafetyStat vaultId={vaultId} altAlign="right" altFrom="lg" />
      </Columns>
    </Align>
  );
});

const Align = styled('div', {
  base: {
    display: 'flex',
    flexGrow: '0',
    flexShrink: '0',
    flexDirection: 'column',
    justifyContent: 'center',
  },
});

const Columns = styled('div', {
  base: {
    display: 'grid',
    width: '100%',
    columnGap: '24px',
    rowGap: '24px',
    gridTemplateColumns: 'var(--vaults-list-grid-columns)',
  },
});
