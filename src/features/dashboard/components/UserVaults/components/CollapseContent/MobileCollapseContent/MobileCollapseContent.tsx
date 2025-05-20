import { memo, useMemo, useState } from 'react';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { useTranslation } from 'react-i18next';
import { VaultDashboardMobileStats } from './components/VaultDashboardMobileStats/VaultDashboardMobileStats.tsx';
import { VaultTransactions } from '../../VaultTransactions/VaultTransactions.tsx';
import type { VaultCollapseContentProps } from '../types.ts';
import { styles } from './styles.ts';
import { ToggleButtons } from '../../../../../../../components/ToggleButtons/ToggleButtons.tsx';
import { useChartOptions } from '../useChartOptions.ts';
import { useMediaQuery } from '../../../../../../../components/MediaQueries/useMediaQuery.ts';
import { SelectSingle } from '../../../../../../../components/Form/Select/Single/SelectSingle.tsx';
import type { SelectItem } from '../../../../../../../components/Form/Select/types.ts';

const useStyles = legacyMakeStyles(styles);

type ToggleTabOptions = 'stats' | 'txHistory' | 'positionChart' | 'compoundsChart';

export const MobileCollapseContent = memo(function MobileCollapseContent({
  vaultId,
  address,
}: VaultCollapseContentProps) {
  const classes = useStyles();
  const { t } = useTranslation();
  const [toggleTab, setToggleTab] = useState<ToggleTabOptions>('stats');
  const useDropdown = useMediaQuery('(max-width: 700px)', false);
  const { PositionGraph, CompoundsGraph, availableCharts } = useChartOptions(vaultId, address);

  const options = useMemo<Array<SelectItem<ToggleTabOptions>>>(
    () => [
      { value: 'stats', label: t('Dashboard-VaultData') },
      { value: 'txHistory', label: t('Dashboard-TransactionHistory') },
      ...availableCharts,
    ],
    [availableCharts, t]
  );

  return (
    <div className={classes.container}>
      <div className={classes.toggleContainer}>
        {useDropdown ?
          <SelectSingle
            options={options}
            selected={toggleTab}
            onChange={setToggleTab}
            variant="light"
            fullWidth={true}
            OptionStartAdornmentComponent={() => <></>}
          />
        : <ToggleButtons<ToggleTabOptions>
            value={toggleTab}
            onChange={setToggleTab}
            options={options}
            variant="filter"
          />
        }
      </div>
      {toggleTab === 'stats' ?
        <VaultDashboardMobileStats address={address} vaultId={vaultId} />
      : toggleTab === 'txHistory' ?
        <VaultTransactions address={address} vaultId={vaultId} />
      : toggleTab === 'positionChart' ?
        <PositionGraph address={address} vaultId={vaultId} />
      : toggleTab === 'compoundsChart' ?
        <CompoundsGraph address={address} vaultId={vaultId} />
      : null}
    </div>
  );
});
