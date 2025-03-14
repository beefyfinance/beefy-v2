import { legacyMakeStyles } from '../../helpers/mui.ts';
import { type FC, memo, type ReactNode } from 'react';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface SummaryStatProps {
  title: string;
  Icon: FC;
  value: string | ReactNode;
}

const SummaryStat = memo(function SummaryStat({ title, Icon, value }: SummaryStatProps) {
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

export const SummaryStats = memo(function SummaryStats({ items }: SummaryStatsProps) {
  const classes = useStyles();

  return (
    <div className={classes.summaryContainer}>
      {items.map(item => (
        <SummaryStat key={item.title} title={item.title} value={item.value} Icon={item.Icon} />
      ))}
    </div>
  );
});
