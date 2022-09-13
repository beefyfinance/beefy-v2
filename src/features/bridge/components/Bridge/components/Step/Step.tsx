import React, { memo, ReactNode, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import { useDispatch } from 'react-redux';
import clsx from 'clsx';
import { ReactComponent as BackArrow } from '../../../../../../images/back-arrow.svg';
import { FormStep } from '../../../../../data/reducers/wallet/bridge';
import { bridgeActions } from '../../../../../data/reducers/wallet/bridge';

const useStyles = makeStyles(styles);

export type StepProps = {
  title?: string;
  backStep?: FormStep;
  children: ReactNode;
  titleAdornment?: ReactNode;
  contentClass?: string;
  noPadding?: boolean;
};

export const Step = memo<StepProps>(function ({
  title,
  titleAdornment,
  backStep,
  children,
  contentClass,
  noPadding = false,
}) {
  const classes = useStyles();
  const dispatch = useDispatch();

  const handleBack = useCallback(() => {
    dispatch(bridgeActions.setStep({ step: backStep }));
  }, [dispatch, backStep]);

  return (
    <div className={classes.container}>
      {title ? (
        <div className={classes.titleBar}>
          {backStep !== undefined ? (
            <button onClick={handleBack} className={classes.backButton}>
              <BackArrow className={classes.backIcon} />
            </button>
          ) : null}
          <div>{title}</div>
          {titleAdornment ? <div className={classes.adornment}>{titleAdornment}</div> : null}
        </div>
      ) : null}
      <div className={clsx(classes.content, contentClass, { [classes.noPadding]: noPadding })}>
        {children}
      </div>
    </div>
  );
});
