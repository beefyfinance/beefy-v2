import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type SourceProps = {
  title: string;
  claim?: ReactNode;
  children: ReactNode;
};

export const Source = memo<SourceProps>(function Source({ title, claim, children }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.rewards}>
        <div className={classes.rewardsTitle}>{title}</div>
        {children}
      </div>
      {claim}
    </div>
  );
});
