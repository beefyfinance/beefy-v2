import React, { memo, useCallback, useMemo, useState } from 'react';

import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../components/ToggleButtons';
import { VaultDashboardMobileStats } from './components/VaultDashboardMobileStats';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { isVaultActive } from '../../../../../data/entities/vault';
import { VaultTransactions } from '../VaultTransactions';
import { DashboardPnLGraph } from '../../../../../vault/components/PnLGraph';
import { selectVaultById } from '../../../../../data/selectors/vaults';
import { useAppSelector } from '../../../../../../store';

const useStyles = makeStyles(styles);

type ListComponentType = 'stats' | 'txHistory' | 'pnl';

export const MobileCollapseContent = memo(function MobileCollapseContent({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const [listComponent, setShowStats] = useState<ListComponentType>('stats');
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));

  const options = useMemo(() => {
    const items = {
      stats: t('Dashboard-VaultData'),
      txHistory: t('Dashboard-TransactionHistory'),
    };
    if (isVaultActive(vault)) {
      items['pnl'] = t('Analytics');
    }
    return items;
  }, [t]);

  const handleChange = useCallback(newValue => {
    setShowStats(newValue);
  }, []);

  return (
    <div className={classes.container}>
      <div className={classes.toggleContainer}>
        <ToggleButtons
          selectedClass={classes.activeClassName}
          buttonClass={classes.buttonText}
          value={listComponent}
          onChange={handleChange}
          options={options}
        />
      </div>
      {listComponent === 'stats' && <VaultDashboardMobileStats vaultId={vaultId} />}
      {listComponent === 'txHistory' && <VaultTransactions vaultId={vaultId} />}
      {listComponent === 'pnl' && <DashboardPnLGraph vaultId={vaultId} />}
    </div>
  );
});
