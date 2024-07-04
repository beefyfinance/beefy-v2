import React, { memo, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { VaultTransactions } from '../../VaultTransactions';
import { useAppSelector } from '../../../../../../../store';
import { selectVaultById } from '../../../../../../data/selectors/vaults';
import { TabletStats } from '../../TabletStats';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import { selectHasDataToShowGraphByVaultId } from '../../../../../../data/selectors/analytics';
import {
  DashboardFeesGraph,
  DashboardOverviewGraph,
} from '../../../../../../vault/components/PnLGraph/cowcentrated';
import type { VaultCollapseContentProps } from '../types';
import { styles } from './styles';
import { ErrorBoundary } from '../../../../../../../components/ErrorBoundary/ErrorBoundary';
import { DashboardPnLGraph } from '../../../../../../vault/components/PnLGraph/standard/StandardPnLGraph';
import { isCowcentratedLikeVault } from '../../../../../../data/entities/vault';

const useStyles = makeStyles(styles);

type ToggleTabOptions = 'txHistory' | 'positionChart' | 'compoundsChart';

export const DesktopCollapseContent = memo<VaultCollapseContentProps>(
  function DesktopCollapseContent({ vaultId, address }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const vault = useAppSelector(state => selectVaultById(state, vaultId));
    const underlyingCLMIdOrVaultId = isCowcentratedLikeVault(vault)
      ? vault.cowcentratedId
      : vaultId;
    const { type, strategyTypeId } = useAppSelector(state =>
      selectVaultById(state, underlyingCLMIdOrVaultId)
    );
    const hasAnalyticsData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, underlyingCLMIdOrVaultId, address)
    );
    const [toggleTab, setToggleTab] = useState<ToggleTabOptions>('txHistory');

    const options = useMemo(() => {
      const items: Partial<Record<ToggleTabOptions, string>> = {
        txHistory: t('Dashboard-TransactionHistory'),
      };

      if (hasAnalyticsData) {
        items['positionChart'] = t('Dashboard-Chart');
        if (type === 'cowcentrated') {
          items['positionChart'] = t('Dashboard-PositionChart');
          if (strategyTypeId === 'compounds') {
            items['compoundsChart'] = t('Dashboard-CompoundsChart');
          }
        }
      }

      return items;
    }, [hasAnalyticsData, type, strategyTypeId, t]);

    const PositionGraph = type === 'cowcentrated' ? DashboardOverviewGraph : DashboardPnLGraph;
    const CompoundsGraph = DashboardFeesGraph;

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
          <TabletStats address={address} vaultId={vaultId} />
          <ErrorBoundary>
            {toggleTab === 'txHistory' ? (
              <VaultTransactions address={address} vaultId={underlyingCLMIdOrVaultId} />
            ) : toggleTab === 'positionChart' ? (
              <PositionGraph address={address} vaultId={underlyingCLMIdOrVaultId} />
            ) : toggleTab === 'compoundsChart' ? (
              <CompoundsGraph address={address} vaultId={underlyingCLMIdOrVaultId} />
            ) : null}
          </ErrorBoundary>
        </div>
      </>
    );
  }
);
