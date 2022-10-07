import { IconButton, makeStyles } from '@material-ui/core';
import { memo, ReactNode } from 'react';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';

import { useAppDispatch } from '../../../../store';
import { styles } from './styles';
import React from 'react';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';

const useStyles = makeStyles(styles);

interface TitleProps {
  text: ReactNode;
}

export const Title = memo<TitleProps>(function ({ text }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClose = React.useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>{text}</div>
      <IconButton className={classes.closeIcon} onClick={handleClose}>
        <CloseRoundedIcon fontSize="small" htmlColor="#8A8EA8" />
      </IconButton>
    </div>
  );
});

/*




*/
