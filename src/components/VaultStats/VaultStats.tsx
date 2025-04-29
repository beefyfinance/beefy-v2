import { css } from '@repo/styles/css';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultDepositStat } from './VaultDepositStat.tsx';
import { VaultSafetyStat } from './VaultSafetyStat.tsx';
import { VaultTvlStat } from './VaultTvlStat.tsx';
import { VaultWalletStat } from './VaultWalletStat.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultStats = memo(function VaultStats({ vaultId }: VaultStatsProps) {
  const classes = useStyles();

  return (
    <div className={classes.vaultStats}>
      <div className={css(styles.row)}>
        <VaultWalletStat vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultDepositStat vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultApyStat type="yearly" vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultApyStat type="daily" vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultTvlStat vaultId={vaultId} altAlign="right" altFrom="lg" />
        <VaultSafetyStat vaultId={vaultId} altAlign="right" altFrom="lg" />
      </div>
    </div>
  );
});
