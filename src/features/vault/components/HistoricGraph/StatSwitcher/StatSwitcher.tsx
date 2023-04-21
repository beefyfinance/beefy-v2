import type { ChartStat } from '../../../../data/reducers/historical-types';
import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../components/ToggleButtons';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type StatSwitcherProps = {
  availableStats: ChartStat[];
  stat: ChartStat;
  onChange: (newStat: ChartStat) => void;
};

export const StatSwitcher = memo<StatSwitcherProps>(function StatSwitcher({
  availableStats,
  stat,
  onChange,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const options: Record<string, string> = useMemo(() => {
    return Object.fromEntries(availableStats.map(stat => [stat, t(`Graph-${stat}`)]));
  }, [availableStats, t]);

  return (
    <ToggleButtons value={stat} options={options} onChange={onChange} buttonsClass={classes.tabs} />
  );
});
