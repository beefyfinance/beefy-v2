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
import type { SelectItem } from '../../../../../../../components/Form/Select/types.ts';

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

  const options = useMemo<Array<SelectItem<ToggleTabOptions>>>(
    () => [{ value: 'txHistory', label: t('Dashboard-TransactionHistory') }, ...availableCharts],
    [availableCharts, t]
  );

  return (
    <>
      {options.length > 1 ?
        <div className={classes.toggleContainer}>
          <ToggleButtons<ToggleTabOptions>
            value={toggleTab}
            onChange={setToggleTab}
            options={options}
            variant="filter"
          />
        </div>
      : null}
      <div className={classes.collapseInner}>
        <TabletStats vaultId={vaultId} address={address} />
        <ErrorBoundary>
          {toggleTab === 'txHistory' ?
            <VaultTransactions address={address} vaultId={vaultId} />
          : toggleTab === 'positionChart' ?
            <PositionGraph address={address} vaultId={vaultId} />
          : toggleTab === 'compoundsChart' ?
            <CompoundsGraph address={address} vaultId={vaultId} />
          : null}
        </ErrorBoundary>
      </div>
    </>
  );
});
