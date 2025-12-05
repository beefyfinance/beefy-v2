import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultDepositStat } from './VaultDepositStat.tsx';
import { VaultTvlStat } from './VaultTvlStat.tsx';
import { VaultWalletStat } from './VaultWalletStat.tsx';
import { css } from '@repo/styles/css';

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultStats = memo(function VaultStats({ vaultId }: VaultStatsProps) {
  return (
    <Align>
      <Columns>
        <VaultWalletStat vaultId={vaultId} altAlign="right" altFrom="lg" className={halfClass} />
        <VaultDepositStat vaultId={vaultId} altAlign="right" altFrom="lg" className={halfClass} />
        <VaultApyStat
          type="yearly"
          vaultId={vaultId}
          altAlign="right"
          altFrom="lg"
          className={thirdClass}
        />
        <VaultApyStat
          type="daily"
          vaultId={vaultId}
          altAlign="right"
          altFrom="lg"
          className={thirdClass}
        />
        <VaultTvlStat vaultId={vaultId} altAlign="right" altFrom="lg" className={thirdClass} />
      </Columns>
    </Align>
  );
});

const halfClass = css({
  gridColumn: 'span 3',
  sm: {
    gridColumn: 'span 1',
  },
});

const thirdClass = css({
  gridColumn: 'span 2',
  sm: {
    gridColumn: 'span 1',
  },
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
