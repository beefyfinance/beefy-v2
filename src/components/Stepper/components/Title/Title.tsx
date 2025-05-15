import { memo, type ReactNode, useCallback } from 'react';
import { stepperReset } from '../../../../features/data/actions/wallet/stepper.ts';
import { legacyMakeStyles } from '../../../../helpers/mui.ts';
import { useAppDispatch } from '../../../../features/data/store/hooks.ts';
import CloseRoundedIcon from '../../../../images/icons/mui/CloseRounded.svg?react';
import { styles } from './styles.ts';

const useStyles = legacyMakeStyles(styles);

interface TitleProps {
  text: ReactNode;
}

export const Title = memo(function Title({ text }: TitleProps) {
  const classes = useStyles();
  const dispatch = useAppDispatch();
  const handleClose = useCallback(() => {
    dispatch(stepperReset());
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
