import React, { memo, useCallback } from 'react';
import { makeStyles } from '@material-ui/styles';
import { styles } from './styles';
import clsx from 'clsx';
import { ReactComponent as SwitchIcon } from '../../../../../../images/switcher.svg';
import { onRampFormActions } from '../../../../../data/reducers/on-ramp';
import { useAppDispatch } from '../../../../../../store';

const useStyles = makeStyles(styles);

export type InputSwitcherProps = {
  className?: string;
};

export const InputSwitcher = memo<InputSwitcherProps>(function ({ className }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const setInputMode = useCallback(() => dispatch(onRampFormActions.toggleInputMode()), [dispatch]);

  return (
    <div className={clsx(classes.switcher, className)}>
      <button onClick={setInputMode} className={classes.button}>
        <SwitchIcon className={classes.icon} />
      </button>
    </div>
  );
});
