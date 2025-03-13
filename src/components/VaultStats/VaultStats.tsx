import { legacyMakeStyles } from '../../helpers/mui.ts';
import { styles } from './styles.ts';
import { memo } from 'react';
import type { VaultEntity } from '../../features/data/entities/vault.ts';
import { css } from '@repo/styles/css';
import { VaultDepositStat } from './VaultDepositStat.tsx';
import { VaultWalletStat } from './VaultWalletStat.tsx';
import { VaultApyStat } from './VaultApyStat.tsx';
import { VaultTvlStat } from './VaultTvlStat.tsx';
import { VaultSafetyStat } from './VaultSafetyStat.tsx';

const useStyles = legacyMakeStyles(styles);

export type VaultStatsProps = {
  vaultId: VaultEntity['id'];
};
export const VaultStats = memo(function VaultStats({ vaultId }: VaultStatsProps) {
  const classes = useStyles();

  return (
    <div className={classes.vaultStats}>
      <div className={css(styles.row)}>
        <div className={classes.column}>
          <VaultWalletStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultDepositStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultApyStat type="yearly" vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultApyStat type="daily" vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultTvlStat vaultId={vaultId} />
        </div>
        <div className={classes.column}>
          <VaultSafetyStat vaultId={vaultId} />
        </div>
      </div>
    </div>
  );
});
