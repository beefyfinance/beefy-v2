import clsx from 'clsx';
import { memo, type ReactNode } from 'react';
import { styles } from './styles';
import { makeStyles } from '@material-ui/core';

const useStyles = makeStyles(styles);

interface MobileStatsProps {
  label: string;
  value: string | ReactNode;
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
