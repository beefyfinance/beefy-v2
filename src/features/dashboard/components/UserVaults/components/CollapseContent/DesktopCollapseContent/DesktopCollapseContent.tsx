import { memo, useMemo, useState } from 'react';
import { makeStyles } from '@material-ui/core';
import { VaultTransactions } from '../../VaultTransactions';
import { TabletStats } from '../../TabletStats';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons';
import { useTranslation } from 'react-i18next';
import type { ChartTypes, VaultCollapseContentProps } from '../types';
import { styles } from './styles';
import { ErrorBoundary } from '../../../../../../../components/ErrorBoundary/ErrorBoundary';
import { useChartOptions } from '../useChartOptions';

const useStyles = makeStyles(styles);

type ToggleTabOptions = 'txHistory' | ChartTypes;

export const DesktopCollapseContent = memo<VaultCollapseContentProps>(
  function DesktopCollapseContent({ vaultId, address }) {
    const classes = useStyles();
    const { t } = useTranslation();
    const [toggleTab, setToggleTab] = useState<ToggleTabOptions>('txHistory');
    const { PositionGraph, CompoundsGraph, availableCharts } = useChartOptions(vaultId, address);

    const options = useMemo(
      () => ({
        txHistory: t('Dashboard-TransactionHistory'),
        ...availableCharts,
      }),
      [availableCharts, t]
    );

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
          <TabletStats vaultId={vaultId} address={address} />
          <ErrorBoundary>
            {toggleTab === 'txHistory' ? (
              <VaultTransactions address={address} vaultId={vaultId} />
            ) : toggleTab === 'positionChart' ? (
              <PositionGraph address={address} vaultId={vaultId} />
            ) : toggleTab === 'compoundsChart' ? (
              <CompoundsGraph address={address} vaultId={vaultId} />
            ) : null}
          </ErrorBoundary>
        </div>
      </>
    );
  }
);
