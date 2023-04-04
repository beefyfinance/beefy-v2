import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { VaultEntity } from '../../../../../../../data/entities/vault';
import { VaultAtDepositStat } from '../../../../../../../../components/VaultStats/VaultAtDepositStat';
import { VaultNowStat } from '../../../../../../../../components/VaultStats/VaultNowStat';
import { RowMobile } from '../../../Row';
import { VaultYieledStat } from '../../../../../../../../components/VaultStats/VaultYieledStat';
import { VaultYearlyStat } from '../../../../../../../../components/VaultStats/VaultYearlyStat';
import { VaultDailyUsdStat } from '../../../../../../../../components/VaultStats/VaultDailyUsdStat';

const useStyles = makeStyles(styles);

export const VaultDashboardMobileStats = memo(function ({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();

  return (
    <RowMobile>
      <div className={classes.inner}>
        <VaultAtDepositStat
          contentClassName={classes.statMobile}
          triggerClassName={classes.triggerContainer}
          className={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultNowStat
          contentClassName={classes.statMobile}
          triggerClassName={classes.triggerContainer}
          className={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultYieledStat
          contentClassName={classes.statMobile}
          triggerClassName={classes.triggerContainer}
          className={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultYearlyStat
          contentClassName={classes.statMobile}
          triggerClassName={classes.triggerContainer}
          className={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultDailyUsdStat
          contentClassName={classes.statMobile}
          triggerClassName={classes.triggerContainer}
          className={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
      </div>
    </RowMobile>
  );
});
