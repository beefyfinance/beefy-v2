import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import type { ChartStat } from '../../../../data/reducers/historical-types';
import React, { memo, useMemo, useState } from 'react';
import { useAppSelector } from '../../../../../store';
import { selectHistoricalAvailableBuckets } from '../../../../data/selectors/historical';
import { GraphLoader } from '../../GraphLoader';
import { RangeSwitcher } from '../RangeSwitcher';
import { makeStyles } from '@material-ui/core';
import { Graph } from '../Graph';
import type { TimeRange } from '../utils';
import { getAvailableRanges, getDefaultTimeRange, timeRangeToBucket } from '../utils';
import type { LineTogglesState } from '../LineToggles';
import { LineToggles } from '../LineToggles';
import { styles } from './styles';
import { selectVaultById } from '../../../../data/selectors/vaults';
import { useTranslation } from 'react-i18next';
import { useHistoricalStatLoader } from '../../../../data/hooks/historical';
import { AlertError } from '../../../../../components/Alerts';

const useStyles = makeStyles(styles);

export type HistoricGraphProp = {
  vaultId: VaultEntity['id'];
  oracleId: TokenEntity['oracleId'];
  stat: ChartStat;
};

export const GraphWithControls = memo<HistoricGraphProp>(function GraphWithControls({
  vaultId,
  oracleId,
  stat,
}) {
  const classes = useStyles();
  const availableBuckets = useAppSelector(state =>
    selectHistoricalAvailableBuckets(state, stat, vaultId, oracleId)
  );
  const { chainId, earnContractAddress } = useAppSelector(state => selectVaultById(state, vaultId));
  const availableRanges = useMemo(() => getAvailableRanges(availableBuckets), [availableBuckets]);
  const [range, setRange] = useState<TimeRange>(() => getDefaultTimeRange(availableRanges));
  const bucket = useMemo(() => timeRangeToBucket[range], [range]);
  const { loading, haveData } = useHistoricalStatLoader(
    stat,
    vaultId,
    oracleId,
    bucket,
    chainId,
    earnContractAddress
  );
  const [lineToggles, setLineToggles] = useState<LineTogglesState>({
    average: true,
    movingAverage: true,
  });

  return (
    <div className={classes.container}>
      <div className={classes.graph}>
        {haveData ? (
          <Graph
            vaultId={vaultId}
            oracleId={oracleId}
            stat={stat}
            bucket={bucket}
            toggles={lineToggles}
          />
        ) : loading ? (
          <GraphLoader imgHeight={220} />
        ) : (
          <AlertError>No data returned</AlertError>
        )}
      </div>
      <div className={classes.footer}>
        {stat === 'clm' ? (
          <CowcentratedLeged />
        ) : (
          <LineToggles toggles={lineToggles} onChange={setLineToggles} />
        )}
        <RangeSwitcher range={range} availableRanges={availableRanges} onChange={setRange} />
      </div>
    </div>
  );
});

const CowcentratedLeged = memo(function CowcentratedLeged() {
  const classes = useStyles();
  const { t } = useTranslation();
  return (
    <div className={classes.legend}>
      <div className={classes.legendItem}>
        <div className={classes.line} />
        {t('Price')}
      </div>
      <div className={classes.legendItem}>
        <div className={classes.range} />
        {t('Range')}
      </div>
    </div>
  );
});
