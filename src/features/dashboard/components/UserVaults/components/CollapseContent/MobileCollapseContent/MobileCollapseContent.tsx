import React, { memo, useMemo, useState } from 'react';
import { makeStyles, useMediaQuery } from '@material-ui/core';
import { useTranslation } from 'react-i18next';
import { VaultDashboardMobileStats } from './components/VaultDashboardMobileStats';
import { VaultTransactions } from '../../VaultTransactions';
import { DashboardPnLGraph } from '../../../../../../vault/components/PnLGraph';
import { useAppSelector } from '../../../../../../../store';
import { selectHasDataToShowGraphByVaultId } from '../../../../../../data/selectors/analytics';
import { selectVaultType } from '../../../../../../data/selectors/vaults';
import {
  DashboardCowcentratedFeesGraph,
  DashboardCowcentratedPnLGraph,
} from '../../../../../../vault/components/CowcentratedPnlGraph';
import type { VaultCollapseContentProps } from '../types';
import { styles } from './styles';
import { LabeledSelect } from '../../../../../../../components/LabeledSelect';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons';

const useStyles = makeStyles(styles);

type ToggleTabOptions = 'stats' | 'txHistory' | 'positionChart' | 'compoundsChart';

export const MobileCollapseContent = memo<VaultCollapseContentProps>(
  function MobileCollapseContent({ vaultId, address }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const vaultType = useAppSelector(state => selectVaultType(state, vaultId));
    const hasAnalyticsData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, vaultId, address)
    );
    const [toggleTab, setToggleTab] = useState<ToggleTabOptions>('stats');
    const useDropdown = useMediaQuery('(max-width: 700px)', { noSsr: true });

    const options = useMemo(() => {
      const items: Partial<Record<ToggleTabOptions, string>> = {
        stats: t('Dashboard-VaultData'),
        txHistory: t('Dashboard-TransactionHistory'),
      };
      if (hasAnalyticsData) {
        items['positionChart'] = t('Dashboard-Chart');
        if (vaultType === 'cowcentrated') {
          items['positionChart'] = t('Dashboard-PositionChart');
          items['compoundsChart'] = t('Dashboard-CompoundsChart');
        }
      }
      return items;
    }, [hasAnalyticsData, vaultType, t]);

    const PositionGraph =
      vaultType === 'cowcentrated' ? DashboardCowcentratedPnLGraph : DashboardPnLGraph;
    const CompoundsGraph = DashboardCowcentratedFeesGraph;

    return (
      <div className={classes.container}>
        <div className={classes.toggleContainer}>
          {useDropdown ? (
            <LabeledSelect
              selectClass={classes.select}
              options={options}
              value={toggleTab}
              onChange={setToggleTab as (v: string) => void}
            />
          ) : (
            <ToggleButtons
              value={toggleTab}
              onChange={setToggleTab as (v: string) => void}
              options={options}
            />
          )}
        </div>
        {toggleTab === 'stats' ? (
          <VaultDashboardMobileStats address={address} vaultId={vaultId} />
        ) : toggleTab === 'txHistory' ? (
          <VaultTransactions address={address} vaultId={vaultId} />
        ) : toggleTab === 'positionChart' ? (
          <PositionGraph address={address} vaultId={vaultId} />
        ) : toggleTab === 'compoundsChart' ? (
          <CompoundsGraph address={address} vaultId={vaultId} />
        ) : null}
      </div>
    );
  }
);
