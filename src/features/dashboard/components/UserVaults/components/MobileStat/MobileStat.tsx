import clsx from 'clsx';
import { memo } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

interface MobileStatsProps {
  label: string;
  value: string;
  valueClassName?: string;
}

export const MobileStat = memo<MobileStatsProps>(function MobileStat({
  label,
  value,
  valueClassName,
}) {
  const classes = useStyles();
  return (
    <div className={classes.mobileStat}>
      <div>{label}</div> <span className={clsx(classes.value, valueClassName)}>{value}</span>
    </div>
  );
});
