import React, { memo, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { VaultTransactions } from '../../VaultTransactions';
import { useAppSelector } from '../../../../../../../store';
import { selectVaultType } from '../../../../../../data/selectors/vaults';
import { TabletStats } from '../../TabletStats';
import { DashboardPnLGraph } from '../../../../../../vault/components/PnLGraph';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { selectHasDataToShowGraphByVaultId } from '../../../../../../data/selectors/analytics';
import {
  DashboardCowcentratedFeesGraph,
  DashboardCowcentratedPnLGraph,
} from '../../../../../../vault/components/CowcentratedPnlGraph';
import type { VaultCollapseContentProps } from '../types';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type ToggleTabOptions = 'txHistory' | 'positionChart' | 'compoundsChart';

export const DesktopCollapseContent = memo<VaultCollapseContentProps>(
  function DesktopCollapseContent({ vaultId, address }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const vaultType = useAppSelector(state => selectVaultType(state, vaultId));
    const hasAnalyticsData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, vaultId, address)
    );
    const [toggleTab, setToggleTab] = useState<ToggleTabOptions>('txHistory');

    const options = useMemo(() => {
      const items: Partial<Record<ToggleTabOptions, string>> = {
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
      <>
        {'positionChart' in options ? (
          <div className={classes.toggleContainer}>
            <ToggleButtons
              value={toggleTab}
              onChange={setToggleTab as (v: string) => void}
              options={options}
            />
          </div>
        ) : null}
        <div className={classes.collapseInner}>
          <TabletStats vaultId={vaultId} />
          {toggleTab === 'txHistory' ? (
            <VaultTransactions address={address} vaultId={vaultId} />
          ) : toggleTab === 'positionChart' ? (
            <PositionGraph address={address} vaultId={vaultId} />
          ) : toggleTab === 'compoundsChart' ? (
            <CompoundsGraph address={address} vaultId={vaultId} />
          ) : null}
        </div>
      </>
    );
  }
);
