import React, { memo, useCallback, useMemo, useState } from 'react';

import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../../components/ToggleButtons';
import { VaultDashboardMobileStats } from './components/VaultDashboardMobileStats';
import type { VaultEntity } from '../../../../../data/entities/vault';
import { VaultTransactions } from '../VaultTransactions';

const useStyles = makeStyles(styles);

type ListComponentType = 'stats' | 'txHistory';

export const MobileCollapseContent = memo(function MobileCollapseContent({
  vaultId,
}: {
  vaultId: VaultEntity['id'];
}) {
  const classes = useStyles();
  const [listComponent, setShowStats] = useState<ListComponentType>('stats');
  const { t } = useTranslation();

  const options = useMemo(() => {
    return {
      stats: t('Dashboard-VaultData'),
      txHistory: t('Dashboard-TransactionHistory'),
    };
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
    </div>
  );
});
