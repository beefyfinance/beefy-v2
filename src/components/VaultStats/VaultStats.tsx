import { styled } from '@repo/styles/jsx';
import { memo } from 'react';
import {
  isCowcentratedGovVault,
  isCowcentratedStandardVault,
  type VaultEntity,
} from '../../features/data/entities/vault.ts';
import { selectVaultById } from '../../features/data/selectors/vaults.ts';
import { useAppSelector } from '../../features/data/store/hooks.ts';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultDepositStat } from './VaultDepositStat.tsx';
import { VaultTvlStat } from './VaultTvlStat.tsx';

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultStats = memo(function VaultStats({ vaultId }: VaultStatsProps) {
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  // single-product CLM rows keep the per-side icon so users learn the icon language
  const clmSide =
    isCowcentratedGovVault(vault) ? ('pool' as const)
    : isCowcentratedStandardVault(vault) ? ('vault' as const)
    : undefined;

  return (
    <Align>
      <Columns>
        <VaultApyStat
          type="yearly"
          vaultId={vaultId}
          clmSide={clmSide}
          altAlign="right"
          altFrom="lg"
        />
        <VaultApyStat
          type="daily"
          vaultId={vaultId}
          clmSide={clmSide}
          altAlign="right"
          altFrom="lg"
        />
        <VaultTvlStat vaultId={vaultId} clmSide={clmSide} altAlign="right" altFrom="lg" />
        <VaultDepositStat vaultId={vaultId} clmSide={clmSide} altAlign="right" altFrom="lg" />
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
