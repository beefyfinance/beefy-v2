import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import type { VaultEntity } from '../../../../../../../data/entities/vault';
import { isGovVault } from '../../../../../../../data/entities/vault';
import { VaultAtDepositStat } from '../../../../../../../../components/VaultStats/VaultAtDepositStat';
import { VaultNowStat } from '../../../../../../../../components/VaultStats/VaultNowStat';
import { RowMobile } from '../../../Row';
import { VaultYieldStat } from '../../../../../../../../components/VaultStats/VaultYieldStat';
import { VaultYearlyStat } from '../../../../../../../../components/VaultStats/VaultYearlyStat';
import { VaultDailyUsdStat } from '../../../../../../../../components/VaultStats/VaultDailyUsdStat';
import { useAppSelector } from '../../../../../../../../store';
import { selectVaultById } from '../../../../../../../data/selectors/vaults';
import { VaultRewardsStat } from '../../../../../../../../components/VaultStats/VaultRewardsStat';
import { selectUserRewardsByVaultId } from '../../../../../../../data/selectors/balance';
import { selectIsVaultPreStakedOrBoosted } from '../../../../../../../data/selectors/boosts';
import clsx from 'clsx';
import { selectVaultPnl } from '../../../../../../../data/selectors/analytics';

const useStyles = makeStyles(styles);

export const VaultDashboardMobileStats = memo(function VaultDashboardMobileStats({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const isVaultBoostedOrPrestake = useAppSelector(state =>
    selectIsVaultPreStakedOrBoosted(state, vaultId)
  );

  const pnlData = useAppSelector(state => selectVaultPnl(state, vaultId));

  const { rewards } = useAppSelector(state => selectUserRewardsByVaultId(state, vaultId));

  return (
    <RowMobile>
      <div className={classes.inner}>
        <VaultAtDepositStat
          pnlData={pnlData}
          className={classes.statMobile}
          contentClassName={classes.valueContainer}
          triggerClassName={classes.value}
          labelClassName={classes.label}
          vaultId={vaultId}
        />
        <VaultNowStat
          pnlData={pnlData}
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
          <VaultYieldStat
            pnlData={pnlData}
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
          triggerClassName={clsx(classes.value, {
            [classes.valueBoosted]: isVaultBoostedOrPrestake,
          })}
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
