import React, { memo, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ToggleButtons } from '../../../../../components/ToggleButtons';
import { makeStyles } from '@material-ui/core';
import type { TimeRange } from '../utils';
import { styles } from './styles';

const useStyles = makeStyles(styles);

export type RangeSwitcherProps = {
  availableRanges: TimeRange[];
  range: TimeRange;
  onChange: (newBucket: TimeRange) => void;
};

export const RangeSwitcher = memo<RangeSwitcherProps>(function RangeSwitcher({
  availableRanges,
  range,
  onChange,
}) {
  const classes = useStyles();
  const { t } = useTranslation();
  const options: Record<string, string> = useMemo(() => {
    return Object.fromEntries(availableRanges.map(range => [range, t(`Graph-${range}`)]));
  }, [availableRanges, t]);

  return (
    <ToggleButtons
      value={range}
      options={options}
      onChange={onChange}
      buttonsClass={classes.tabs}
      buttonClass={classes.tab}
      selectedClass={classes.selected}
    />
  );
});
