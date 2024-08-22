import { makeStyles } from '@material-ui/core';
import { type FC, memo } from 'react';
import { styles } from './styles';

const useStyles = makeStyles(styles);

interface SummaryStatProps {
  title: string;
  Icon: FC;
  value: string;
}

const SummaryStat = memo<SummaryStatProps>(function SummaryStat({ title, Icon, value }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
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
}

export const SummaryStats = memo<SummaryStatsProps>(function SummaryStats({ items }) {
  const classes = useStyles();

  return (
    <div className={classes.summaryContainer}>
      {items.map(item => (
        <SummaryStat key={item.title} title={item.title} value={item.value} Icon={item.Icon} />
      ))}
    </div>
  );
});
