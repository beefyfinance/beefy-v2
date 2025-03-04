import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { memo, type ReactNode, useCallback } from 'react';
import CloseRoundedIcon from '../../../../images/icons/mui/CloseRounded.svg?react';
import { useAppDispatch } from '../../../../store.ts';
import { styles } from './styles.ts';
import { stepperActions } from '../../../../features/data/reducers/wallet/stepper.ts';

const useStyles = legacyMakeStyles(styles);

interface TitleProps {
  text: ReactNode;
}

export const Title = memo(function Title({ text }: TitleProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClose = useCallback(() => {
    dispatch(stepperActions.reset());
  }, [dispatch]);

  return (
    <div className={classes.titleContainer}>
      <div className={classes.title}>{text}</div>
      <button type="button" className={classes.closeIcon} onClick={handleClose}>
        <CloseRoundedIcon fontSize="small" color="#D0D0DA" />
      </button>
    </div>
  );
});

/*




*/
