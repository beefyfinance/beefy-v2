import React, { memo, ReactNode } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import clsx from 'clsx';
import { ReactComponent as BackArrow } from '../../images/back-arrow.svg';

const useStyles = makeStyles(styles);

export type StepType = 'bridge' | 'onRamp';

export type StepProps = {
  stepType: StepType;
  title: string;
  onBack?: () => void;
  children: ReactNode;
  titleAdornment?: ReactNode;
  contentClass?: string;
  noPadding?: boolean;
};

export const Step = memo<StepProps>(function ({
  stepType,
  title,
  titleAdornment,
  onBack,
  children,
  contentClass,
  noPadding = false,
}) {
  const cardHeight = stepType === 'bridge' ? '658px' : '648px';

  const classes = useStyles({ cardHeight });

  return (
    <div className={classes.container}>
      <div className={classes.titleBar}>
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
        {titleAdornment ? <div className={classes.adornment}>{titleAdornment}</div> : null}
      </div>
      <div className={clsx(classes.content, contentClass, { [classes.noPadding]: noPadding })}>
        {children}
      </div>
    </div>
  );
});
