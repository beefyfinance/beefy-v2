import React, { memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ReactComponent as BackArrow } from '../../../../../../images/back-arrow.svg';

const useStyles = makeStyles(styles);

export type StepHeaderProps = {
  onBack?: () => void;
  children: ReactNode;
};
export const StepHeader = memo<StepHeaderProps>(function ({ onBack, children }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      {onBack ? (
        <button onClick={onBack} className={classes.backButton}>
          <BackArrow className={classes.backIcon} />
        </button>
      ) : null}
      {children}
    </div>
  );
});
