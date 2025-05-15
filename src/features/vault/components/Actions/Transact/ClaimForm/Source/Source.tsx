import { memo, type ReactNode } from 'react';
import { legacyMakeStyles } from '../../../../../../../helpers/mui.ts';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

type SourceProps = {
  title: string;
  claim?: ReactNode;
  refresh?: ReactNode;
  children: ReactNode;
};

export const Source = memo(function Source({ title, claim, refresh, children }: SourceProps) {
  const classes = useStyles();
  return (
    <div className={classes.container}>
      <div className={classes.rewards}>
        <div className={classes.titleHolder}>
          <div className={classes.title}>{title}</div>
          {refresh ?
            <div className={classes.refresh}>{refresh}</div>
          : null}
        </div>
        {children}
      </div>
      {claim}
    </div>
  );
});
