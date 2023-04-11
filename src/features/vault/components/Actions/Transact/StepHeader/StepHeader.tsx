import React, { memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/core';
import { styles } from './styles';
import { ReactComponent as BackArrow } from '../../../../../../images/back-arrow.svg';

const useStyles = makeStyles(styles);

export type StepHeaderProps = {
  onBack?: () => void;
  title: string;
  children?: ReactNode;
};
export const StepHeader = memo<StepHeaderProps>(function ({ onBack, title, children }) {
  const classes = useStyles();

  return (
    <div className={classes.container}>
      <div>
        {onBack ? (
          <a onClick={onBack} className={classes.backLink}>
            <button className={classes.backButton}>
              <BackArrow className={classes.backIcon} />
            </button>
            {title}
          </a>
        ) : (
          <div>{title}</div>
        )}
      </div>
      {children}
    </div>
  );
});
