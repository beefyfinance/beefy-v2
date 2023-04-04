import React, { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { VaultEntity } from '../../../../../../../data/entities/vault';
import { VaultAtDepositStat } from '../../../../../../../../components/VaultStats/VaultAtDepositStat';
import { VaultNowStat } from '../../../../../../../../components/VaultStats/VaultNowStat';
import { RowMobile } from '../../../Row';

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
        <VaultAtDepositStat vaultId={vaultId} />
        <VaultNowStat vaultId={vaultId} />
        <div>3</div>
        <div>4</div>
      </div>
    </RowMobile>
  );
});
