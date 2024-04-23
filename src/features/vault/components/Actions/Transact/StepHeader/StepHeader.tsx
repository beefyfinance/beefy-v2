import type { ReactNode } from 'react';
import React, { memo } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ReactComponent as BackArrow } from '../../../../../../images/back-arrow.svg';

const useStyles = makeStyles(styles);

export type StepHeaderProps = {
  title: string;
  onBack?: () => void;
  children?: ReactNode;
};
export const StepHeader = memo<StepHeaderProps>(function StepHeader({ title, onBack, children }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {onBack ? (
        <button onClick={onBack} className={classes.backButton}>
          <div className={classes.backIcon}>
            <BackArrow className={classes.backArrow} />
          </div>{' '}
          {title}
        </button>
      ) : (
        title
      )}
      {children}
    </div>
  );
});
