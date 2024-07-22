import { memo, type ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';

const useStyles = makeStyles(styles);

type SourceProps = {
  title: string;
  claim?: ReactNode;
  refresh?: ReactNode;
  children: ReactNode;
};

export const Source = memo<SourceProps>(function Source({ title, claim, refresh, children }) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.rewards}>
        <div className={classes.titleHolder}>
          <div className={classes.title}>{title}</div>
          {refresh ? <div className={classes.refresh}>{refresh}</div> : null}
        </div>
        {children}
      </div>
      {claim}
    </div>
  );
});
