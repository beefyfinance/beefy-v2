import type { ChartStat } from '../../../data/reducers/historical-types';
import type { VaultEntity } from '../../../data/entities/vault';
import React, { memo, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAppSelector } from '../../../../store';
import { selectVaultById } from '../../../data/selectors/vaults';
import { selectTokenByAddress } from '../../../data/selectors/tokens';
import { selectHistoricalAvailableCharts } from '../../../data/selectors/historical';
import { Card, CardContent, CardHeader, CardTitle } from '../Card';
import { StatSwitcher } from '../StatSwitcher';
import { GraphWithControls } from './GraphWithControls';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { getDefaultStat } from './utils';
import { CowcentratedChart } from './CowcentratedRanges';

const useStyles = makeStyles(styles);

type HistoricGraphsProps = {
  vaultId: VaultEntity['id'];
};
export const HistoricGraphs = memo<HistoricGraphsProps>(function HistoricGraphs({ vaultId }) {
  const classes = useStyles();
  const { t } = useTranslation();
  const vault = useAppSelector(state => selectVaultById(state, vaultId));
  const { oracleId } = useAppSelector(state =>
    selectTokenByAddress(state, vault.chainId, vault.depositTokenAddress)
  );
  const availableStats = useAppSelector(state =>
    selectHistoricalAvailableCharts(state, vaultId, oracleId)
  );
  const [stat, setStat] = useState<ChartStat>(() => getDefaultStat(availableStats));

  const options: Record<string, string> = useMemo(() => {
    return Object.fromEntries(
      availableStats.map(stat => [stat, t([`Graph-${vault.type}-${stat}`, `Graph-${stat}`])])
    );
  }, [availableStats, t, vault.type]);

  return (
    <Card className={stat === 'cowcentrated' ? classes.cowcentrated : ''}>
      <CardHeader className={classes.header}>
        <CardTitle title={t('Graph-RateHist')} />
        <StatSwitcher stat={stat} options={options} onChange={stat => setStat(stat as ChartStat)} />
      </CardHeader>
      {stat === 'cowcentrated' ? (
        <CowcentratedChart vaultId={vaultId} />
      ) : (
        <CardContent className={classes.content}>
          <GraphWithControls vaultId={vaultId} oracleId={oracleId} stat={stat} />
        </CardContent>
      )}
    </Card>
  );
});
