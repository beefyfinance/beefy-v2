import type { VaultEntity } from '../../../../data/entities/vault';
import type { TokenEntity } from '../../../../data/entities/token';
import type { ChartStat } from '../../../../data/reducers/historical-types';
import React, { memo, useEffect, useMemo, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../../store';
import {
  selectHistoricalAvailableBuckets,
  selectHistoricalBucketIsLoaded,
  selectHistoricalBucketStatus,
} from '../../../../data/selectors/historical';
import { fetchHistoricalStat } from '../../../../data/actions/historical';
import { GraphLoader } from '../../GraphLoader';
import { RangeSwitcher } from '../RangeSwitcher';
import { makeStyles } from '@material-ui/core';
import { Graph } from '../Graph';
import type { TimeRange } from '../utils';
import { getAvailableRanges, getDefaultTimeRange, timeRangeToBucket } from '../utils';
import type { LineTogglesState } from '../LineToggles';
import { LineToggles } from '../LineToggles';
import { styles } from './styles';

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
  const dispatch = useAppDispatch();
  const availableBuckets = useAppSelector(state =>
    selectHistoricalAvailableBuckets(state, stat, vaultId, oracleId)
  );
  const availableRanges = useMemo(() => getAvailableRanges(availableBuckets), [availableBuckets]);
  const [range, setRange] = useState<TimeRange>(() => getDefaultTimeRange(availableRanges));
  const bucket = useMemo(() => timeRangeToBucket[range], [range]);
  const bucketStatus = useAppSelector(state =>
    selectHistoricalBucketStatus(state, stat, vaultId, oracleId, bucket)
  );
  const bucketLoaded = useAppSelector(state =>
    selectHistoricalBucketIsLoaded(state, stat, vaultId, oracleId, bucket)
  );
  const [lineToggles, setLineToggles] = useState<LineTogglesState>({
    average: true,
    movingAverage: true,
  });

  useEffect(() => {
    if (bucketStatus === 'idle') {
      dispatch(fetchHistoricalStat(stat, vaultId, oracleId, bucket));
    }
  }, [dispatch, vaultId, oracleId, stat, bucket, bucketStatus]);

  return (
    <div>
      {bucketLoaded ? (
        <Graph
          vaultId={vaultId}
          oracleId={oracleId}
          stat={stat}
          bucket={bucket}
          toggles={lineToggles}
        />
      ) : (
        <GraphLoader />
      )}
      <div className={classes.footer}>
        <LineToggles toggles={lineToggles} onChange={setLineToggles} />
        <RangeSwitcher range={range} availableRanges={availableRanges} onChange={setRange} />
      </div>
    </div>
  );
});
