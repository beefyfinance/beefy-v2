import { memo } from 'react';
import { ToggleButtons } from '../../../../components/ToggleButtons';
import { makeStyles, useMediaQuery, type Theme } from '@material-ui/core';
import { styles } from './styles';
import { LabeledSelect } from '../../../../components/LabeledSelect';

const useStyles = makeStyles(styles);

export type StatSwitcherProps<T extends string = string> = {
  options: Record<T, string>;
  stat: T;
  onChange: (newStat: T) => void;
};

export const StatSwitcher = memo(function StatSwitcher<T extends string = string>({
  options,
  onChange,
  stat,
}: StatSwitcherProps<T>) {
  const classes = useStyles();
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
