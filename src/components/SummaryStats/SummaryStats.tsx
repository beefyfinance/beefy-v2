import { makeStyles } from '@material-ui/core';
import clsx from 'clsx';
import React, { memo } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface SummaryStatProps {
  title: string;
  Icon: React.FC;
  value: string;
  tinnyStyle?: boolean;
}

const SummaryStat = memo<SummaryStatProps>(function ({ title, Icon, value, tinnyStyle }) {
  const classes = useStyles();
  return (
    <div className={clsx(classes.container, { [classes.mobileVersion]: tinnyStyle })}>
      <div className={classes.iconContainer}>
        <Icon />
      </div>
      <div className={classes.contentContainer}>
        <div className={classes.title}>{title}</div>
        <div className={classes.value}>{value}</div>
      </div>
    </div>
  );
});

interface SummaryStatsProps {
  items: SummaryStatProps[];
  tinnyStyle?: boolean;
}

export const SummaryStats = memo<SummaryStatsProps>(function ({ items, tinnyStyle = false }) {
  const classes = useStyles();

  return (
    <div className={clsx(classes.summaryContainer, { [classes.tinnyContainer]: tinnyStyle })}>
      {items.map(item => (
        <SummaryStat
          tinnyStyle={tinnyStyle}
          key={item.title}
          title={item.title}
          value={item.value}
          Icon={item.Icon}
        />
      ))}
    </div>
  );
});
