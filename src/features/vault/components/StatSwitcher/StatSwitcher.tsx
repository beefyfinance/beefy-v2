import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../components/ToggleButtons';
import { makeStyles, useMediaQuery, type Theme } from '@material-ui/core';
import { styles } from './styles';
import { LabeledSelect } from '../../../../components/LabeledSelect';

const useStyles = makeStyles(styles);

export type StatSwitcherProps = {
  type: 'standard' | 'gov' | 'cowcentrated';
  availableStats: string[];
  stat: string;
  onChange: (newStat: string) => void;
};

export const StatSwitcher = memo<StatSwitcherProps>(function StatSwitcher({
  availableStats,
  stat,
  onChange,
  type,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const options: Record<string, string> = useMemo(() => {
    return Object.fromEntries(
      availableStats.map(stat => [stat, t([`Graph-${type}-${stat}`, `Graph-${stat}`])])
    );
  }, [availableStats, t, type]);

  const mobileView = useMediaQuery((theme: Theme) => theme.breakpoints.down('xs'), { noSsr: true });

  return (
    <>
      {mobileView ? (
        <>
          <LabeledSelect
            selectClass={classes.select}
            options={options}
            value={stat}
            onChange={onChange}
          />
        </>
      ) : (
        <ToggleButtons
          value={stat}
          options={options}
          onChange={onChange}
          buttonsClass={classes.tabs}
        />
      )}
    </>
  );
});
