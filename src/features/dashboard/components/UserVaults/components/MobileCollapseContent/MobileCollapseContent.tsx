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

interface MobileCollapseContentProps {
  vaultId: VaultEntity['id'];
  address: string;
}

export const MobileCollapseContent = memo<MobileCollapseContentProps>(
  function MobileCollapseContent({ vaultId, address }) {
    const classes = useStyles();
    const [listComponent, setShowStats] = useState<ListComponentType>('stats');
    const { t } = useTranslation();

    const hasAnalyticsData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, vaultId, address)
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
    }, [hasAnalyticsData, t]);

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
        {listComponent === 'stats' && (
          <VaultDashboardMobileStats address={address} vaultId={vaultId} />
        )}
        {listComponent === 'txHistory' && <VaultTransactions address={address} vaultId={vaultId} />}
        {listComponent === 'chart' && <DashboardPnLGraph address={address} vaultId={vaultId} />}
      </div>
    );
  }
);
