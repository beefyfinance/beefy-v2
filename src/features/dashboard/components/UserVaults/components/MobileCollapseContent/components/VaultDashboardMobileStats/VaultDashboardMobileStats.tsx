import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { VaultEntity, isGovVault } from '../../../../../../../data/entities/vault';
import { VaultAtDepositStat } from '../../../../../../../../components/VaultStats/VaultAtDepositStat';
import { VaultNowStat } from '../../../../../../../../components/VaultStats/VaultNowStat';
import { RowMobile } from '../../../Row';
import { VaultYieledStat } from '../../../../../../../../components/VaultStats/VaultYieledStat';
import { VaultYearlyStat } from '../../../../../../../../components/VaultStats/VaultYearlyStat';
import { VaultDailyUsdStat } from '../../../../../../../../components/VaultStats/VaultDailyUsdStat';
import { useAppSelector } from '../../../../../../../../store';
import { selectVaultById } from '../../../../../../../data/selectors/vaults';
import { VaultRewardsStat } from '../../../../../../../../components/VaultStats/VaultRewardsStat';
import { selectUserRewardsByVaultId } from '../../../../../../../data/selectors/balance';

const useStyles = makeStyles(styles);

export const VaultDashboardMobileStats = memo(function ({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();

  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const { rewards } = useAppSelector(state => selectUserRewardsByVaultId(state, vaultId));

  return (
    <RowMobile>
      <div className={classes.inner}>
        <VaultAtDepositStat
          className={classes.statMobile}
          contentClassName={classes.valueContainer}
          triggerClassName={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultNowStat
          className={classes.statMobile}
          contentClassName={classes.valueContainer}
          triggerClassName={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        {rewards.length !== 0 && (
          <VaultRewardsStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
          />
        )}
        {!isGovVault(vault) && (
          <VaultYieledStat
            className={classes.statMobile}
            contentClassName={classes.valueContainer}
            triggerClassName={classes.value}
            labelClassName={classes.label}
            vaultId={vaultId}
          />
        )}
        <VaultYearlyStat
          className={classes.statMobile}
          contentClassName={classes.valueContainer}
          triggerClassName={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultDailyUsdStat
          className={classes.statMobile}
          contentClassName={classes.valueContainer}
          triggerClassName={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
      </div>
    </RowMobile>
  );
});
