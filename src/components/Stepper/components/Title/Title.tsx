import { IconButton, makeStyles } from '@material-ui/core';
import { type ReactNode, useCallback } from 'react';
import { memo } from 'react';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';

import { useAppDispatch } from '../../../../store';
import { styles } from './styles';

import { stepperActions } from '../../../../features/data/reducers/wallet/stepper';

const useStyles = makeStyles(styles);

interface TitleProps {
  text: ReactNode;
}

export const Title = memo<TitleProps>(function Title({ text }) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClose = useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>{text}</div>
      <IconButton className={classes.closeIcon} onClick={handleClose}>
        <CloseRoundedIcon fontSize="small" htmlColor="#D0D0DA" />
      </IconButton>
    </div>
  );
});

/*




*/
