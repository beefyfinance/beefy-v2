/* eslint-disable @typescript-eslint/no-unused-vars */
import { memo, useCallback, useMemo, useState } from 'react';
import type { VaultEntity } from '../../../data/entities/vault';

import { Card, CardTitle, CardHeader, CardContent } from '../Card';
import { useTranslation } from 'react-i18next';
import { StatSwitcher } from '../StatSwitcher';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';
import { RangeSwitcher } from '../HistoricGraph/RangeSwitcher';
import { getAvailableRanges, getDefaultTimeRange, type TimeRange } from '../HistoricGraph/utils';
import { GraphHeader } from './components/GraphHeader';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectHasBreakdownDataByTokenAddress } from '../../../data/selectors/tokens';
import { selectIsAddressBookLoaded } from '../../../data/selectors/data-loader';
import { selectHasDataToShowGraphByVaultId } from '../../../data/selectors/analytics';
import { CLMOverviewGraph } from './components/OverviewGraph';
import { useVaultPeriods } from './components/OverviewGraph/hooks';
import { BasicTabs } from '../../../../components/Tabs/BasicTabs';

const useStyles = makeStyles(styles);

interface CowcentratedPnlGraphProps {
  vaultId: VaultEntity['id'];
  address?: string;
}

export const CowcentratedPnlGraphLoader = memo<CowcentratedPnlGraphProps>(
  function CowcentratedPnlGraphLoader({ vaultId, address }) {
    const vault = useAppSelector(state => selectVaultById(state, vaultId));

    const haveBreakdownData = useAppSelector(state =>
      selectHasBreakdownDataByTokenAddress(state, vault.depositTokenAddress, vault.chainId)
    );
    const hasData = useAppSelector(state =>
      selectHasDataToShowGraphByVaultId(state, vaultId, address)
    );

    const chainId = vault.chainId;
    const isAddressBookLoaded = useAppSelector(state => selectIsAddressBookLoaded(state, chainId));

    if (haveBreakdownData && isAddressBookLoaded && hasData) {
      return <CowcentratedPnlGraph vaultId={vaultId} address={address} />;
    }

    return null;
  }
);

export const CowcentratedPnlGraph = memo<CowcentratedPnlGraphProps>(function CowcentratedPnlGraph({
  vaultId,
  address,
}) {
  const [stat, setStat] = useState<string>('Overview');
  const { t } = useTranslation();
  const classes = useStyles();

  const options = useMemo(() => {
    return {
      Overview: t('Graph-Overview'),
      Fees: t('Graph-Fees'),
    };
  }, [t]);

  const labels = useVaultPeriods(vaultId, address);

  const [period, setPeriod] = useState<number>(labels.length - 1);

  return (
    <Card className={classes.card}>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Graph-PositionPerformance')} />
        <StatSwitcher stat={stat} options={options} onChange={setStat} />
      </CardHeader>
      <CardContent className={classes.content}>
        <GraphHeader vaultId={vaultId} />
        <div className={classes.graphContainer}>
          <CLMOverviewGraph period={period} address={address} vaultId={vaultId} />
        </div>
        <div className={classes.footer}>
          <div className={classes.legendContainer}>
            <div className={classes.usdReferenceLine} />
            Position $ Value
          </div>
          <div className={classes.tabsContainer}>
            <BasicTabs
              onChange={(newValue: number) => {
                setPeriod(newValue);
              }}
              labels={labels}
              value={period}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
});
