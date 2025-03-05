import { memo, useMemo, useState } from 'react';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { VaultTransactions } from '../../VaultTransactions/VaultTransactions.tsx';
import { TabletStats } from '../../TabletStats/TabletStats.tsx';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { useTranslation } from 'react-i18next';
import type { ChartTypes, VaultCollapseContentProps } from '../types.ts';
import { styles } from './styles.ts';
import { ErrorBoundary } from '../../../../../../../components/ErrorBoundary/ErrorBoundary.tsx';
import { useChartOptions } from '../useChartOptions.ts';

const useStyles = legacyMakeStyles(styles);

type ToggleTabOptions = 'txHistory' | ChartTypes;

export const DesktopCollapseContent = memo(function DesktopCollapseContent({
  vaultId,
  address,
}: VaultCollapseContentProps) {
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
});
