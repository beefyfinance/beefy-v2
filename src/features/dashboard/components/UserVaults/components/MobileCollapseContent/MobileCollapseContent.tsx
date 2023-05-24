import React, { memo, useCallback, useMemo, useState } from 'react';

import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../components/ToggleButtons';
import { VaultDashboardMobileStats } from './components/VaultDashboardMobileStats';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { VaultTransactions } from '../VaultTransactions';
import { DashboardPnLGraph } from '../../../../../vault/components/PnLGraph';
import { useAppSelector } from '../../../../../../store';
import { selectHasDataToShowGraphByVaultId } from '../../../../../data/selectors/analytics';

const useStyles = makeStyles(styles);

type ListComponentType = 'stats' | 'txHistory' | 'chart';

export const MobileCollapseContent = memo(function MobileCollapseContent({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const [listComponent, setShowStats] = useState<ListComponentType>('stats');
  const { t } = useTranslation();

  const hasAnalyticsData = useAppSelector(state =>
    selectHasDataToShowGraphByVaultId(state, vaultId)
  );

  const options = useMemo(() => {
    const items = {
      stats: t('Dashboard-VaultData'),
      txHistory: t('Dashboard-TransactionHistory'),
    };
    if (hasAnalyticsData) {
      items['chart'] = t('Dashboard-Chart');
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
      {listComponent === 'chart' && <DashboardPnLGraph vaultId={vaultId} />}
    </div>
  );
});
